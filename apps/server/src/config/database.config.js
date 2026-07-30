"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConfig = exports.dbRegToken = void 0;
const config_1 = require("@nestjs/config");
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_1 = require("typeorm");
const env_1 = require("../../../../src/global/env");
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
dotenv_1.default.config({ path: '.env' });
const dataSourceOptions = {
    type: 'mysql',
    host: (0, env_1.env)('DB_HOST', '127.0.0.1'),
    port: (0, env_1.envNumber)('DB_PORT', 3306),
    username: (0, env_1.env)('DB_USERNAME', 'root'),
    password: (0, env_1.env)('DB_PASSWORD'),
    database: (0, env_1.env)('DB_DATABASE', 'blog_db'),
    synchronize: (0, env_1.envBoolean)('DB_SYNCHRONIZE', false),
    multipleStatements: true,
    entities: ['dist/modules/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    subscribers: ['dist/**/*.subscriber{.ts,.js}'],
};
exports.dbRegToken = 'database';
exports.DatabaseConfig = (0, config_1.registerAs)(exports.dbRegToken, () => dataSourceOptions);
const dataSource = new typeorm_1.DataSource(dataSourceOptions);
exports.default = dataSource;
//# sourceMappingURL=database.config.js.map