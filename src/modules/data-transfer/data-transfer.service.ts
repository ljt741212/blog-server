import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import * as readline from 'readline';
import { PassThrough } from 'stream';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as unzipper from 'unzipper';

import type archiver from 'archiver';
import type { Response } from 'express';

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

// archiver v8 is ESM-only with named exports; @types/archiver v7 is CJS-style
// eslint-disable-next-line @typescript-eslint/no-require-imports
const _archiverModule = require('archiver') as {
  ZipArchive: new (options?: Record<string, unknown>) => archiver.Archiver;
  TarArchive: new (options?: Record<string, unknown>) => archiver.Archiver;
};

const archiverCreate = (
  format: 'zip' | 'tar',
  options?: Record<string, unknown>,
): archiver.Archiver => {
  return format === 'zip'
    ? new _archiverModule.ZipArchive(options)
    : new _archiverModule.TarArchive(options);
};

@Injectable()
export class DataTransferService {
  private readonly logger = new Logger(DataTransferService.name);

  constructor(private readonly dataSource: DataSource) {}

  async exportAllToZip(res: Response) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();

    try {
      const exportedAt = new Date();
      const fileName = `blog-db-export-${exportedAt.toISOString().replace(/[:.]/g, '-')}.zip`;

      res.status(200);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );

      const zip = archiverCreate('zip', { zlib: { level: 9 } });
      zip.on('error', (err) => {
        res.destroy(err);
      });
      zip.pipe(res);

      const rawTables = (await runner.query(
        `SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`,
      )) as Array<Record<string, unknown>>;

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
        const [{ cnt }] = (await runner.query(
          `SELECT COUNT(*) as cnt FROM ${quoteId(table)}`,
        )) as Array<{ cnt: number }>;
        meta.tables.push({ name: table, rows: Number(cnt ?? 0) });
      }

      zip.append(JSON.stringify(meta, null, 2), { name: 'meta.json' });

      const chunkSize = 1000;
      for (const table of tableNames) {
        const entryStream = new PassThrough();
        zip.append(entryStream, { name: `tables/${table}.jsonl` });

        const [{ cnt }] = (await runner.query(
          `SELECT COUNT(*) as cnt FROM ${quoteId(table)}`,
        )) as Array<{ cnt: number }>;
        const total = Number(cnt ?? 0);

        for (let offset = 0; offset < total; offset += chunkSize) {
          const rows = (await runner.query(
            `SELECT * FROM ${quoteId(table)} LIMIT ? OFFSET ?`,
            [chunkSize, offset],
          )) as Array<Record<string, unknown>>;
          for (const row of rows) {
            entryStream.write(`${JSON.stringify(row, jsonReplacer)}\n`);
          }
        }

        entryStream.end();
      }

      await zip.finalize();
    } catch (err: unknown) {
      this.logger.error('数据库导出失败', err);
      throw new InternalServerErrorException('导出失败');
    } finally {
      await runner.release();
    }
  }

  async importAllFromZip(zipPath: string, options: ImportOptions) {
    if (options.mode !== 'truncate') {
      throw new BadRequestException('仅支持 truncate 导入模式');
    }

    const workDir = await fsp.mkdtemp(
      path.join(os.tmpdir(), 'blog-data-import-'),
    );
    try {
      // Validate zip before extraction
      await this.validateZipFile(zipPath);
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

      const tables = meta.tables.map((t) => t.name);

      // Pre-flight: verify all JSONL files exist before touching any data
      const missingFiles = tables.filter(
        (table) => !tableFiles.includes(`${table}.jsonl`),
      );
      if (missingFiles.length > 0) {
        throw new BadRequestException(
          `导入包缺少以下表的数据文件: ${missingFiles.join(', ')}`,
        );
      }

      const runner = this.dataSource.createQueryRunner();
      await runner.connect();
      await runner.startTransaction();

      let totalRows = 0;
      try {
        // DELETE is DML — works inside a transaction with FOREIGN_KEY_CHECKS=0.
        // TRUNCATE is DDL and cannot be used here: MySQL forbids TRUNCATE on
        // tables referenced by foreign keys even with FOREIGN_KEY_CHECKS=0.
        await runner.query('SET FOREIGN_KEY_CHECKS=0');

        for (const table of tables) {
          await runner.query(`DELETE FROM ${quoteId(table)}`);
        }

        for (const table of tables) {
          const filePath = path.join(tablesDir, `${table}.jsonl`);

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
                const v = row[col];
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
        await runner.commitTransaction();

        // Reset AUTO_INCREMENT counters after commit.
        // DELETE doesn't reset them like TRUNCATE does — if imported data
        // has higher IDs than the original, new inserts would try to reuse
        // stale counter values and hit duplicate-key errors.
        await this.resetAutoIncrements(runner, tables);
      } catch (e) {
        await runner.rollbackTransaction();
        throw e;
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
      await fsp
        .rm(workDir, { recursive: true, force: true })
        .catch((err: unknown) =>
          this.logger.warn(`清理临时目录失败: ${workDir}`, err),
        );
      await fsp
        .unlink(zipPath)
        .catch((err: unknown) =>
          this.logger.warn(`清理上传文件失败: ${zipPath}`, err),
        );
    }
  }

  private async validateZipFile(zipPath: string) {
    const fd = await fsp.open(zipPath, 'r');
    try {
      const buf = Buffer.alloc(4);
      const { bytesRead } = await fd.read(buf, 0, 4, 0);
      if (bytesRead < 4) {
        throw new BadRequestException('上传文件为空或损坏');
      }
      const magic = buf.readUInt32BE(0);
      // PK\x03\x04 (local file header), PK\x05\x06 (EOCD / empty archive), PK\x07\x08 (spanned)
      if (
        magic !== 0x504b0304 &&
        magic !== 0x504b0506 &&
        magic !== 0x504b0708
      ) {
        throw new BadRequestException('上传文件不是有效的 ZIP 文件');
      }
    } finally {
      await fd.close();
    }
  }

  private async resetAutoIncrements(
    runner: ReturnType<DataSource['createQueryRunner']>,
    tables: string[],
  ) {
    if (tables.length === 0) return;
    const placeholders = tables.map(() => '?').join(', ');
    const autoIncTables = (await runner.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND AUTO_INCREMENT IS NOT NULL AND TABLE_NAME IN (${placeholders})`,
      [(this.dataSource.options as { database?: string }).database, ...tables],
    )) as Array<{ TABLE_NAME: string }>;

    for (const { TABLE_NAME } of autoIncTables) {
      try {
        const [{ maxId }] = (await runner.query(
          `SELECT MAX(id) AS maxId FROM ${quoteId(TABLE_NAME)}`,
        )) as Array<{ maxId: number | null }>;
        if (maxId != null) {
          await runner.query(
            `ALTER TABLE ${quoteId(TABLE_NAME)} AUTO_INCREMENT = ?`,
            [Number(maxId) + 1],
          );
        }
      } catch (err: unknown) {
        this.logger.warn(`重置 AUTO_INCREMENT 失败: ${TABLE_NAME}`, err);
      }
    }
  }
}
