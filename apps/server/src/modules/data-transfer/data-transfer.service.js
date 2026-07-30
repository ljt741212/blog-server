"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DataTransferService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTransferService = void 0;
const fs = __importStar(require("fs"));
const fsp = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const stream_1 = require("stream");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const unzipper = __importStar(require("unzipper"));
function jsonReplacer(key, value) {
    if (value instanceof Date)
        return value.toISOString().replace('T', ' ').replace('Z', '');
    return value;
}
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/;
function sanitizeValue(v) {
    if (typeof v === 'string' && ISO_DATETIME_RE.test(v)) {
        return v.replace('T', ' ').replace('Z', '');
    }
    return v;
}
function quoteId(name) {
    return `\`${String(name).replace(/`/g, '``')}\``;
}
function pickFirstColumnValue(row) {
    const keys = Object.keys(row);
    return keys.length > 0 ? row[keys[0]] : undefined;
}
function buildInsertSql(table, columns, rowCount) {
    const cols = columns.map(quoteId).join(', ');
    const oneRow = `(${columns.map(() => '?').join(', ')})`;
    const values = new Array(rowCount).fill(oneRow).join(', ');
    return `INSERT INTO ${quoteId(table)} (${cols}) VALUES ${values}`;
}
const _archiverModule = require('archiver');
const archiverCreate = (format, options) => {
    return format === 'zip'
        ? new _archiverModule.ZipArchive(options)
        : new _archiverModule.TarArchive(options);
};
let DataTransferService = DataTransferService_1 = class DataTransferService {
    dataSource;
    logger = new common_1.Logger(DataTransferService_1.name);
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async exportAllToZip(res) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        try {
            const exportedAt = new Date();
            const fileName = `blog-db-export-${exportedAt.toISOString().replace(/[:.]/g, '-')}.zip`;
            res.status(200);
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            const zip = archiverCreate('zip', { zlib: { level: 9 } });
            zip.on('error', (err) => {
                res.destroy(err);
            });
            zip.pipe(res);
            const rawTables = (await runner.query(`SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`));
            const excluded = new Set(['migrations', 'typeorm_metadata']);
            const tableNames = rawTables
                .map((row) => String(pickFirstColumnValue(row)))
                .filter((name) => name && !excluded.has(name));
            const meta = {
                exportedAt: exportedAt.toISOString(),
                db: {
                    type: 'mysql',
                    database: this.dataSource.options.database,
                    host: this.dataSource.options.host,
                    port: this.dataSource.options.port,
                },
                tables: [],
                format: {
                    kind: 'zip+jsonl',
                    version: 1,
                },
            };
            for (const table of tableNames) {
                const [{ cnt }] = (await runner.query(`SELECT COUNT(*) as cnt FROM ${quoteId(table)}`));
                meta.tables.push({ name: table, rows: Number(cnt ?? 0) });
            }
            zip.append(JSON.stringify(meta, null, 2), { name: 'meta.json' });
            const chunkSize = 1000;
            for (const table of tableNames) {
                const entryStream = new stream_1.PassThrough();
                zip.append(entryStream, { name: `tables/${table}.jsonl` });
                const [{ cnt }] = (await runner.query(`SELECT COUNT(*) as cnt FROM ${quoteId(table)}`));
                const total = Number(cnt ?? 0);
                for (let offset = 0; offset < total; offset += chunkSize) {
                    const rows = (await runner.query(`SELECT * FROM ${quoteId(table)} LIMIT ? OFFSET ?`, [chunkSize, offset]));
                    for (const row of rows) {
                        entryStream.write(`${JSON.stringify(row, jsonReplacer)}\n`);
                    }
                }
                entryStream.end();
            }
            await zip.finalize();
        }
        catch (err) {
            this.logger.error('数据库导出失败', err);
            throw new common_1.InternalServerErrorException('导出失败');
        }
        finally {
            await runner.release();
        }
    }
    async importAllFromZip(zipPath, options) {
        if (options.mode !== 'truncate') {
            throw new common_1.BadRequestException('仅支持 truncate 导入模式');
        }
        const workDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'blog-data-import-'));
        try {
            await this.validateZipFile(zipPath);
            await fs
                .createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: workDir }))
                .promise();
            const metaPath = path.join(workDir, 'meta.json');
            const metaRaw = await fsp.readFile(metaPath, 'utf8').catch(() => '');
            if (!metaRaw)
                throw new common_1.BadRequestException('导入包缺少 meta.json');
            const meta = JSON.parse(metaRaw);
            if (meta?.format?.kind !== 'zip+jsonl' || meta?.format?.version !== 1) {
                throw new common_1.BadRequestException('导入包格式不兼容');
            }
            const tablesDir = path.join(workDir, 'tables');
            const tableFiles = await fsp
                .readdir(tablesDir)
                .catch(() => []);
            if (!Array.isArray(tableFiles) || tableFiles.length === 0) {
                throw new common_1.BadRequestException('导入包缺少 tables 数据');
            }
            const tables = meta.tables.map((t) => t.name);
            const missingFiles = tables.filter((table) => !tableFiles.includes(`${table}.jsonl`));
            if (missingFiles.length > 0) {
                throw new common_1.BadRequestException(`导入包缺少以下表的数据文件: ${missingFiles.join(', ')}`);
            }
            const runner = this.dataSource.createQueryRunner();
            await runner.connect();
            await runner.startTransaction();
            let totalRows = 0;
            try {
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
                    let columns = null;
                    const batch = [];
                    const batchSize = 200;
                    const flush = async () => {
                        if (!columns || batch.length === 0)
                            return;
                        const sql = buildInsertSql(table, columns, batch.length);
                        const params = [];
                        for (const row of batch) {
                            for (const col of columns) {
                                const v = row[col];
                                params.push(typeof v === 'undefined' ? null : sanitizeValue(v));
                            }
                        }
                        await runner.query(sql, params);
                        totalRows += batch.length;
                        batch.length = 0;
                    };
                    for await (const line of rl) {
                        const trimmed = line.trim();
                        if (!trimmed)
                            continue;
                        const row = JSON.parse(trimmed);
                        if (!columns)
                            columns = Object.keys(row);
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
                await this.resetAutoIncrements(runner, tables);
            }
            catch (e) {
                await runner.rollbackTransaction();
                throw e;
            }
            finally {
                await runner.release();
            }
            return {
                tables: meta.tables.length,
                rows: totalRows,
            };
        }
        catch (e) {
            throw e instanceof common_1.BadRequestException
                ? e
                : new common_1.InternalServerErrorException('导入失败');
        }
        finally {
            await fsp
                .rm(workDir, { recursive: true, force: true })
                .catch((err) => this.logger.warn(`清理临时目录失败: ${workDir}`, err));
            await fsp
                .unlink(zipPath)
                .catch((err) => this.logger.warn(`清理上传文件失败: ${zipPath}`, err));
        }
    }
    async validateZipFile(zipPath) {
        const fd = await fsp.open(zipPath, 'r');
        try {
            const buf = Buffer.alloc(4);
            const { bytesRead } = await fd.read(buf, 0, 4, 0);
            if (bytesRead < 4) {
                throw new common_1.BadRequestException('上传文件为空或损坏');
            }
            const magic = buf.readUInt32BE(0);
            if (magic !== 0x504b0304 &&
                magic !== 0x504b0506 &&
                magic !== 0x504b0708) {
                throw new common_1.BadRequestException('上传文件不是有效的 ZIP 文件');
            }
        }
        finally {
            await fd.close();
        }
    }
    async resetAutoIncrements(runner, tables) {
        if (tables.length === 0)
            return;
        const placeholders = tables.map(() => '?').join(', ');
        const autoIncTables = (await runner.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND AUTO_INCREMENT IS NOT NULL AND TABLE_NAME IN (${placeholders})`, [this.dataSource.options.database, ...tables]));
        for (const { TABLE_NAME } of autoIncTables) {
            try {
                const [{ maxId }] = (await runner.query(`SELECT MAX(id) AS maxId FROM ${quoteId(TABLE_NAME)}`));
                if (maxId != null) {
                    await runner.query(`ALTER TABLE ${quoteId(TABLE_NAME)} AUTO_INCREMENT = ?`, [Number(maxId) + 1]);
                }
            }
            catch (err) {
                this.logger.warn(`重置 AUTO_INCREMENT 失败: ${TABLE_NAME}`, err);
            }
        }
    }
};
exports.DataTransferService = DataTransferService;
exports.DataTransferService = DataTransferService = DataTransferService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DataTransferService);
//# sourceMappingURL=data-transfer.service.js.map