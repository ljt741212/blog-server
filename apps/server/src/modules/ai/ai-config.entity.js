"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiConfig = exports.AiProvider = void 0;
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
var AiProvider;
(function (AiProvider) {
    AiProvider["OPENAI"] = "openai";
    AiProvider["DEEPSEEK"] = "deepseek";
    AiProvider["ANTHROPIC"] = "anthropic";
})(AiProvider || (exports.AiProvider = AiProvider = {}));
let AiConfig = class AiConfig extends common_entity_1.CommonEntity {
    name;
    provider;
    model;
    apiKey;
    baseUrl;
    isActive;
    maxTokens;
    temperature;
};
exports.AiConfig = AiConfig;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: '配置名称' }),
    __metadata("design:type", String)
], AiConfig.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, comment: '提供商' }),
    __metadata("design:type", String)
], AiConfig.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: '模型标识' }),
    __metadata("design:type", String)
], AiConfig.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'api_key',
        type: 'varchar',
        length: 500,
        comment: 'API Key（加密存储）',
    }),
    __metadata("design:type", String)
], AiConfig.prototype, "apiKey", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'base_url',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'API 地址',
    }),
    __metadata("design:type", String)
], AiConfig.prototype, "baseUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'is_active',
        type: 'tinyint',
        default: 0,
        comment: '是否启用',
    }),
    __metadata("design:type", Boolean)
], AiConfig.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'max_tokens',
        type: 'int',
        default: 4096,
        comment: '默认最大 token 数',
    }),
    __metadata("design:type", Number)
], AiConfig.prototype, "maxTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 3,
        scale: 2,
        default: 0.7,
        comment: '默认温度参数',
    }),
    __metadata("design:type", Number)
], AiConfig.prototype, "temperature", void 0);
exports.AiConfig = AiConfig = __decorate([
    (0, typeorm_1.Entity)('ai_configs')
], AiConfig);
//# sourceMappingURL=ai-config.entity.js.map