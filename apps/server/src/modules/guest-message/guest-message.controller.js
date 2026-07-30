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
exports.GuestMessageController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const guest_message_dto_1 = require("./guest-message.dto");
const guest_message_service_1 = require("./guest-message.service");
let GuestMessageController = class GuestMessageController {
    guestMessageService;
    constructor(guestMessageService) {
        this.guestMessageService = guestMessageService;
    }
    create(dto) {
        return this.guestMessageService.create(dto);
    }
    updateStatus(params, dto) {
        return this.guestMessageService.updateStatus(params.id, dto.status);
    }
    paginate(query) {
        return this.guestMessageService.paginateForAdmin(query);
    }
    findList(query) {
        return this.guestMessageService.findList(query);
    }
    remove(params) {
        return this.guestMessageService.remove(params.id);
    }
};
exports.GuestMessageController = GuestMessageController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [guest_message_dto_1.CreateGuestMessageDto]),
    __metadata("design:returntype", void 0)
], GuestMessageController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [guest_message_dto_1.GuestMessageIdParamDto,
        guest_message_dto_1.UpdateGuestMessageStatusDto]),
    __metadata("design:returntype", void 0)
], GuestMessageController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)('page'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [guest_message_dto_1.GuestMessageAdminPageQueryDto]),
    __metadata("design:returntype", void 0)
], GuestMessageController.prototype, "paginate", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [guest_message_dto_1.GuestMessageListQueryDto]),
    __metadata("design:returntype", void 0)
], GuestMessageController.prototype, "findList", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [guest_message_dto_1.GuestMessageIdParamDto]),
    __metadata("design:returntype", void 0)
], GuestMessageController.prototype, "remove", null);
exports.GuestMessageController = GuestMessageController = __decorate([
    (0, common_1.Controller)('guest-messages'),
    __metadata("design:paramtypes", [guest_message_service_1.GuestMessageService])
], GuestMessageController);
//# sourceMappingURL=guest-message.controller.js.map