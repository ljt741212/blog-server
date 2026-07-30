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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const tag_dto_1 = require("./tag.dto");
const tag_service_1 = require("./tag.service");
let TagController = class TagController {
    tagService;
    constructor(tagService) {
        this.tagService = tagService;
    }
    paginate(query) {
        return this.tagService.paginateForAdmin(query);
    }
    findAll() {
        return this.tagService.findAll();
    }
    findOne(params) {
        return this.tagService.findOne(params.id);
    }
    save(dto) {
        return this.tagService.save(dto);
    }
    update(params, dto) {
        return this.tagService.update(params.id, dto);
    }
    remove(params) {
        return this.tagService.remove(params.id);
    }
};
exports.TagController = TagController;
__decorate([
    (0, common_1.Get)('page'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tag_dto_1.TagPageQueryDto]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "paginate", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TagController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tag_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tag_dto_1.SaveTagDto]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "save", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tag_dto_1.IdParamDto, tag_dto_1.UpdateTagDto]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tag_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], TagController.prototype, "remove", null);
exports.TagController = TagController = __decorate([
    (0, common_1.Controller)('tags'),
    __metadata("design:paramtypes", [tag_service_1.TagService])
], TagController);
//# sourceMappingURL=tag.controller.js.map