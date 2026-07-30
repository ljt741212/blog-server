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
exports.CategoryController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const category_dto_1 = require("./category.dto");
const category_service_1 = require("./category.service");
let CategoryController = class CategoryController {
    categoryService;
    constructor(categoryService) {
        this.categoryService = categoryService;
    }
    paginate(query) {
        return this.categoryService.paginateForAdmin(query);
    }
    findAll() {
        return this.categoryService.findAll();
    }
    findOne(params) {
        return this.categoryService.findOne(params.id);
    }
    save(dto) {
        return this.categoryService.save(dto);
    }
    update(params, dto) {
        return this.categoryService.update(params.id, dto);
    }
    updateStatus(params, dto) {
        return this.categoryService.updateStatus(params.id, dto.status);
    }
    remove(params) {
        return this.categoryService.remove(params.id);
    }
};
exports.CategoryController = CategoryController;
__decorate([
    (0, common_1.Get)('page'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_dto_1.CategoryPageQueryDto]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "paginate", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_dto_1.SaveCategoryDto]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "save", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_dto_1.IdParamDto, category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_dto_1.IdParamDto,
        category_dto_1.UpdateCategoryStatusDto]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [category_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], CategoryController.prototype, "remove", null);
exports.CategoryController = CategoryController = __decorate([
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [category_service_1.CategoryService])
], CategoryController);
//# sourceMappingURL=category.controller.js.map