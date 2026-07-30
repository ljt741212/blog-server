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
exports.UpdateFriendLinkStatusDto = exports.BatchSortDto = exports.SortItemDto = exports.ApplyFriendLinkDto = exports.SaveFriendLinkDto = exports.IdParamDto = exports.FindAllQueryDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const friend_link_entity_1 = require("./friend-link.entity");
class FindAllQueryDto {
    status;
    sortOrder;
}
exports.FindAllQueryDto = FindAllQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsEnum)(friend_link_entity_1.FriendLinkStatus),
    __metadata("design:type", Number)
], FindAllQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], FindAllQueryDto.prototype, "sortOrder", void 0);
class IdParamDto {
    id;
}
exports.IdParamDto = IdParamDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], IdParamDto.prototype, "id", void 0);
class SaveFriendLinkDto {
    id;
    name;
    url;
    description;
    avatar;
    sort;
    status;
}
exports.SaveFriendLinkDto = SaveFriendLinkDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SaveFriendLinkDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SaveFriendLinkDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SaveFriendLinkDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveFriendLinkDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], SaveFriendLinkDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SaveFriendLinkDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsEnum)(friend_link_entity_1.FriendLinkStatus),
    __metadata("design:type", Number)
], SaveFriendLinkDto.prototype, "status", void 0);
class ApplyFriendLinkDto {
    name;
    url;
    description;
    avatar;
}
exports.ApplyFriendLinkDto = ApplyFriendLinkDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], ApplyFriendLinkDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], ApplyFriendLinkDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApplyFriendLinkDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], ApplyFriendLinkDto.prototype, "avatar", void 0);
class SortItemDto {
    id;
    sort;
}
exports.SortItemDto = SortItemDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SortItemDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SortItemDto.prototype, "sort", void 0);
class BatchSortDto {
    items;
}
exports.BatchSortDto = BatchSortDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SortItemDto),
    __metadata("design:type", Array)
], BatchSortDto.prototype, "items", void 0);
class UpdateFriendLinkStatusDto {
    status;
}
exports.UpdateFriendLinkStatusDto = UpdateFriendLinkStatusDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsEnum)(friend_link_entity_1.FriendLinkStatus),
    __metadata("design:type", Number)
], UpdateFriendLinkStatusDto.prototype, "status", void 0);
//# sourceMappingURL=friend-link.dto.js.map