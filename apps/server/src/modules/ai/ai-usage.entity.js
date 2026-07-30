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
exports.AiUsage = exports.AiAction = void 0;
const typeorm_1 = require("typeorm");
var AiAction;
(function (AiAction) {
    AiAction["CONTINUE_WRITE"] = "continue_write";
    AiAction["POLISH"] = "polish";
    AiAction["SUMMARY"] = "summary";
    AiAction["TITLE"] = "title";
    AiAction["ARTICLE_ADVICE"] = "article_advice";
    AiAction["CHAT"] = "chat";
})(AiAction || (exports.AiAction = AiAction = {}));
let AiUsage = class AiUsage extends typeorm_1.BaseEntity {
    id;
    configId;
    model;
    promptTokens;
    completionTokens;
    latencyMs;
    action;
    createdAt;
};
exports.AiUsage = AiUsage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AiUsage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'config_id', type: 'int', comment: '关联的模型配置' }),
    __metadata("design:type", Number)
], AiUsage.prototype, "configId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: '使用的模型名' }),
    __metadata("design:type", String)
], AiUsage.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'prompt_tokens',
        type: 'int',
        default: 0,
        comment: '输入 token',
    }),
    __metadata("design:type", Number)
], AiUsage.prototype, "promptTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'completion_tokens',
        type: 'int',
        default: 0,
        comment: '输出 token',
    }),
    __metadata("design:type", Number)
], AiUsage.prototype, "completionTokens", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'latency_ms',
        type: 'int',
        default: 0,
        comment: '响应延迟(ms)',
    }),
    __metadata("design:type", Number)
], AiUsage.prototype, "latencyMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, comment: '动作' }),
    __metadata("design:type", String)
], AiUsage.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', comment: '创建时间' }),
    __metadata("design:type", Date)
], AiUsage.prototype, "createdAt", void 0);
exports.AiUsage = AiUsage = __decorate([
    (0, typeorm_1.Entity)('ai_usage_logs')
], AiUsage);
//# sourceMappingURL=ai-usage.entity.js.map