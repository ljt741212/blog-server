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
exports.FriendLinkController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const friend_link_dto_1 = require("./friend-link.dto");
const friend_link_service_1 = require("./friend-link.service");
let FriendLinkController = class FriendLinkController {
    friendLinkService;
    constructor(friendLinkService) {
        this.friendLinkService = friendLinkService;
    }
    findAll(query) {
        return this.friendLinkService.findAll(query.status, query.sortOrder);
    }
    apply(dto) {
        return this.friendLinkService.apply(dto);
    }
    save(dto) {
        return this.friendLinkService.save(dto);
    }
    update(params, dto) {
        return this.friendLinkService.update(params.id, dto);
    }
    batchSort(dto) {
        return this.friendLinkService.batchSort(dto);
    }
    updateStatus(params, dto) {
        return this.friendLinkService.updateStatus(params.id, dto);
    }
    remove(params) {
        return this.friendLinkService.remove(params.id);
    }
};
exports.FriendLinkController = FriendLinkController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_link_dto_1.FindAllQueryDto]),
    __metadata("design:returntype", void 0)
], FriendLinkController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('apply'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_link_dto_1.ApplyFriendLinkDto]),
    __metadata("design:returntype", void 0)
], FriendLinkController.prototype, "apply", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_link_dto_1.SaveFriendLinkDto]),
    __metadata("design:returntype", void 0)
], FriendLinkController.prototype, "save", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_link_dto_1.IdParamDto, friend_link_dto_1.SaveFriendLinkDto]),
    __metadata("design:returntype", void 0)
], FriendLinkController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('sort'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_link_dto_1.BatchSortDto]),
    __metadata("design:returntype", void 0)
], FriendLinkController.prototype, "batchSort", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_link_dto_1.IdParamDto,
        friend_link_dto_1.UpdateFriendLinkStatusDto]),
    __metadata("design:returntype", void 0)
], FriendLinkController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [friend_link_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], FriendLinkController.prototype, "remove", null);
exports.FriendLinkController = FriendLinkController = __decorate([
    (0, common_1.Controller)('friend-links'),
    __metadata("design:paramtypes", [friend_link_service_1.FriendLinkService])
], FriendLinkController);
//# sourceMappingURL=friend-link.controller.js.map