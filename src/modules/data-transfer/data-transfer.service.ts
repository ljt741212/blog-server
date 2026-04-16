import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import archiver from 'archiver';
import type { Response } from 'express';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import * as readline from 'readline';
import { PassThrough } from 'stream';
import { DataSource } from 'typeorm';
import * as unzipper from 'unzipper';

type ImportMode = 'truncate';

type ImportOptions = {
  mode: ImportMode;
};

type ExportMeta = {
  exportedAt: string;
  db: {
    type: string;
    database?: string;
    host?: string;
    port?: number;
  };
  tables: Array<{ name: string; rows: number }>;
  format: {
    kind: 'zip+jsonl';
    version: 1;
  };
};

function jsonReplacer(key: string, value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return value;
}

function quoteId(name: string) {
  return `\`${String(name).replace(/`/g, '``')}\``;
}

function pickFirstColumnValue(row: Record<string, unknown>) {
  const keys = Object.keys(row);
  return keys.length > 0 ? row[keys[0]] : undefined;
}

function buildInsertSql(table: string, columns: string[], rowCount: number) {
  const cols = columns.map(quoteId).join(', ');
  const oneRow = `(${columns.map(() => '?').join(', ')})`;
  const values = new Array(rowCount).fill(oneRow).join(', ');
  return `INSERT INTO ${quoteId(table)} (${cols}) VALUES ${values}`;
}

@Injectable()
export class DataTransferService {
  constructor(private readonly dataSource: DataSource) {}

  async exportAllToZip(res: Response) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();

    try {
      const exportedAt = new Date();
      const fileName = `blog-db-export-${exportedAt.toISOString().replace(/[:.]/g, '-')}.zip`;

      res.status(200);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      const zip = archiver('zip', { zlib: { level: 9 } });
      zip.on('error', (err) => {
        res.destroy(err);
      });
      zip.pipe(res);

      const rawTables: Array<Record<string, unknown>> = await runner.query(
        `SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`,
      );

      const excluded = new Set(['migrations', 'typeorm_metadata']);
      const tableNames = rawTables
        .map((row) => String(pickFirstColumnValue(row)))
        .filter((name) => name && !excluded.has(name));

      const meta: ExportMeta = {
        exportedAt: exportedAt.toISOString(),
        db: {
          type: 'mysql',
          database: (this.dataSource.options as { database?: string }).database,
          host: (this.dataSource.options as { host?: string }).host,
          port: (this.dataSource.options as { port?: number }).port,
        },
        tables: [],
        format: {
          kind: 'zip+jsonl',
          version: 1,
        },
      };

      for (const table of tableNames) {
        const [{ cnt }]: Array<{ cnt: number }> = await runner.query(
          `SELECT COUNT(*) as cnt FROM ${quoteId(table)}`,
        );
        meta.tables.push({ name: table, rows: Number(cnt ?? 0) });
      }

      zip.append(JSON.stringify(meta, null, 2), { name: 'meta.json' });

      const chunkSize = 1000;
      for (const table of tableNames) {
        const entryStream = new PassThrough();
        zip.append(entryStream, { name: `tables/${table}.jsonl` });

        const [{ cnt }]: Array<{ cnt: number }> = await runner.query(
          `SELECT COUNT(*) as cnt FROM ${quoteId(table)}`,
        );
        const total = Number(cnt ?? 0);

        for (let offset = 0; offset < total; offset += chunkSize) {
          const rows: Array<Record<string, unknown>> = await runner.query(
            `SELECT * FROM ${quoteId(table)} LIMIT ? OFFSET ?`,
            [chunkSize, offset],
          );
          for (const row of rows) {
            entryStream.write(`${JSON.stringify(row, jsonReplacer)}\n`);
          }
        }

        entryStream.end();
      }

      await zip.finalize();
    } catch (e) {
      throw new InternalServerErrorException('导出失败');
    } finally {
      await runner.release();
    }
  }

  async importAllFromZip(zipPath: string, options: ImportOptions) {
    if (options.mode !== 'truncate') {
      throw new BadRequestException('仅支持 truncate 导入模式');
    }

    const workDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'blog-data-import-'));
    try {
      await fs
        .createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: workDir }))
        .promise();

      const metaPath = path.join(workDir, 'meta.json');
      const metaRaw = await fsp.readFile(metaPath, 'utf8').catch(() => '');
      if (!metaRaw) throw new BadRequestException('导入包缺少 meta.json');

      const meta = JSON.parse(metaRaw) as ExportMeta;
      if (meta?.format?.kind !== 'zip+jsonl' || meta?.format?.version !== 1) {
        throw new BadRequestException('导入包格式不兼容');
      }

      const tablesDir = path.join(workDir, 'tables');
      const tableFiles: string[] = await fsp
        .readdir(tablesDir)
        .catch(() => [] as string[]);
      if (!Array.isArray(tableFiles) || tableFiles.length === 0) {
        throw new BadRequestException('导入包缺少 tables 数据');
      }

      const runner = this.dataSource.createQueryRunner();
      await runner.connect();

      let totalRows = 0;
      try {
        await runner.query('SET FOREIGN_KEY_CHECKS=0');

        const tables = meta.tables.map((t) => t.name);
        for (const table of tables) {
          await runner.query(`TRUNCATE TABLE ${quoteId(table)}`);
        }

        for (const table of tables) {
          const fileName = `${table}.jsonl`;
          if (!tableFiles.includes(fileName)) continue;
          const filePath = path.join(tablesDir, fileName);

          const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity,
          });

          let columns: string[] | null = null;
          const batch: Array<Record<string, unknown>> = [];
          const batchSize = 200;

          const flush = async () => {
            if (!columns || batch.length === 0) return;

            const sql = buildInsertSql(table, columns, batch.length);
            const params: unknown[] = [];
            for (const row of batch) {
              for (const col of columns) {
                const v = (row as Record<string, unknown>)[col];
                params.push(typeof v === 'undefined' ? null : v);
              }
            }

            await runner.query(sql, params);
            totalRows += batch.length;
            batch.length = 0;
          };

          for await (const line of rl) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            const row = JSON.parse(trimmed) as Record<string, unknown>;
            if (!columns) columns = Object.keys(row);
            batch.push(row);
            if (batch.length >= batchSize) {
              await flush();
            }
          }

          await flush();
          rl.close();
        }

        await runner.query('SET FOREIGN_KEY_CHECKS=1');
      } finally {
        await runner.release();
      }

      return {
        tables: meta.tables.length,
        rows: totalRows,
      };
    } catch (e) {
      throw e instanceof BadRequestException
        ? e
        : new InternalServerErrorException('导入失败');
    } finally {
      await fsp.rm(workDir, { recursive: true, force: true }).catch(() => {});
      await fsp.unlink(zipPath).catch(() => {});
    }
  }
}

