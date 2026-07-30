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
exports.PostController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const post_dto_1 = require("./post.dto");
const post_service_1 = require("./post.service");
let PostController = class PostController {
    postService;
    constructor(postService) {
        this.postService = postService;
    }
    paginate(query) {
        return this.postService.paginateForAdmin(query);
    }
    findAll(query) {
        return this.postService.findAll(query);
    }
    findOne(params, authorization) {
        return this.postService.findPublicDetail(params.id, authorization);
    }
    save(dto, authorization) {
        return this.postService.save(dto, authorization);
    }
    updateStatus(params, dto) {
        return this.postService.updateStatus(params.id, dto.status);
    }
    incrementViews(params) {
        return this.postService.incrementViews(params.id);
    }
    incrementLikes(params) {
        return this.postService.incrementLikes(params.id);
    }
    updateTop(params, dto) {
        return this.postService.updateTop(params.id, dto.isTop);
    }
    remove(params) {
        return this.postService.remove(params.id);
    }
};
exports.PostController = PostController;
__decorate([
    (0, common_1.Get)('page'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_dto_1.PostPageQueryDto]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "paginate", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_dto_1.PostPageQueryDto]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_dto_1.IdParamDto, String]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_dto_1.SavePostDto, String]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "save", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_dto_1.IdParamDto, post_dto_1.UpdatePostStatusDto]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Put)(':id/views'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "incrementViews", null);
__decorate([
    (0, common_1.Put)(':id/likes'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "incrementLikes", null);
__decorate([
    (0, common_1.Put)(':id/top'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_dto_1.IdParamDto, post_dto_1.UpdatePostTopDto]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "updateTop", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [post_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], PostController.prototype, "remove", null);
exports.PostController = PostController = __decorate([
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [post_service_1.PostService])
], PostController);
//# sourceMappingURL=post.controller.js.map