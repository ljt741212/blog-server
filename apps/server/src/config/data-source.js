"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
const envPath = (0, path_1.resolve)(__dirname, '../../.env');
const envDevPath = (0, path_1.resolve)(__dirname, `../../.env.${process.env.NODE_ENV || 'development'}`);
if ((0, fs_1.existsSync)(envPath)) {
    (0, dotenv_1.config)({ path: envPath });
}
if ((0, fs_1.existsSync)(envDevPath)) {
    (0, dotenv_1.config)({ path: envDevPath });
}
const isCompiled = __filename.endsWith('.js');
const entitiesPath = isCompiled
    ? 'dist/modules/**/*.entity.js'
    : 'src/modules/**/*.entity.ts';
const migrationsPath = isCompiled
    ? 'dist/migrations/*.js'
    : 'src/migrations/*.ts';
const subscribersPath = isCompiled
    ? 'dist/**/*.subscriber.js'
    : 'src/**/*.subscriber.ts';
exports.default = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE || 'blog_db',
    synchronize: false,
    logging: true,
    multipleStatements: true,
    entities: [entitiesPath],
    migrations: [migrationsPath],
    subscribers: [subscribersPath],
});
//# sourceMappingURL=data-source.js.map