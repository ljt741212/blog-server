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
exports.UsageQueryDto = exports.ChatDto = exports.SaveAiConfigDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const common_1 = require("../../../../../src/common");
const ai_config_entity_1 = require("./ai-config.entity");
const ai_usage_entity_1 = require("./ai-usage.entity");
class SaveAiConfigDto {
    id;
    name;
    provider;
    model;
    apiKey;
    baseUrl;
    maxTokens;
    temperature;
}
exports.SaveAiConfigDto = SaveAiConfigDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SaveAiConfigDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], SaveAiConfigDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ai_config_entity_1.AiProvider),
    __metadata("design:type", String)
], SaveAiConfigDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], SaveAiConfigDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.apiKey !== '' && o.apiKey !== undefined),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], SaveAiConfigDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveAiConfigDto.prototype, "baseUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(131072),
    __metadata("design:type", Number)
], SaveAiConfigDto.prototype, "maxTokens", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], SaveAiConfigDto.prototype, "temperature", void 0);
class ChatDto {
    messages;
    action;
}
exports.ChatDto = ChatDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ChatDto.prototype, "messages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ai_usage_entity_1.AiAction),
    __metadata("design:type", String)
], ChatDto.prototype, "action", void 0);
class UsageQueryDto extends common_1.PaginationQueryDto {
    startDate;
    endDate;
    model;
}
exports.UsageQueryDto = UsageQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UsageQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UsageQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UsageQueryDto.prototype, "model", void 0);
//# sourceMappingURL=ai.dto.js.map