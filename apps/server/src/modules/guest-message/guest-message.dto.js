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
exports.GuestMessageListQueryDto = exports.GuestMessageIdParamDto = exports.UpdateGuestMessageStatusDto = exports.CreateGuestMessageDto = exports.GuestMessageAdminPageQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const common_1 = require("../../../../../src/common");
const guest_message_entity_1 = require("./guest-message.entity");
class GuestMessageAdminPageQueryDto {
    current;
    pageSize;
    status;
    searchValue;
}
exports.GuestMessageAdminPageQueryDto = GuestMessageAdminPageQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GuestMessageAdminPageQueryDto.prototype, "current", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GuestMessageAdminPageQueryDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(guest_message_entity_1.GuestMessageStatus),
    __metadata("design:type", String)
], GuestMessageAdminPageQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], GuestMessageAdminPageQueryDto.prototype, "searchValue", void 0);
class CreateGuestMessageDto {
    content;
    nickname;
    email;
    userId;
    visitorId;
    visitorUuid;
}
exports.CreateGuestMessageDto = CreateGuestMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000),
    __metadata("design:type", String)
], CreateGuestMessageDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateGuestMessageDto.prototype, "nickname", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateGuestMessageDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateGuestMessageDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateGuestMessageDto.prototype, "visitorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], CreateGuestMessageDto.prototype, "visitorUuid", void 0);
class UpdateGuestMessageStatusDto {
    status;
}
exports.UpdateGuestMessageStatusDto = UpdateGuestMessageStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(guest_message_entity_1.GuestMessageStatus),
    __metadata("design:type", String)
], UpdateGuestMessageStatusDto.prototype, "status", void 0);
class GuestMessageIdParamDto {
    id;
}
exports.GuestMessageIdParamDto = GuestMessageIdParamDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GuestMessageIdParamDto.prototype, "id", void 0);
class GuestMessageListQueryDto extends common_1.PaginationQueryDto {
    approvedOnly;
}
exports.GuestMessageListQueryDto = GuestMessageListQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GuestMessageListQueryDto.prototype, "approvedOnly", void 0);
//# sourceMappingURL=guest-message.dto.js.map