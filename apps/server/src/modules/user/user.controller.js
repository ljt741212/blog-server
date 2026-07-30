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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const user_dto_1 = require("./user.dto");
const user_service_1 = require("./user.service");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    login(dto) {
        return this.userService.login(dto);
    }
    sendEmailCode(dto) {
        return this.userService.sendEmailCode(dto);
    }
    emailLogin(dto) {
        return this.userService.emailLogin(dto);
    }
    currentUser(authorization) {
        return this.userService.findCurrentUser(authorization);
    }
    async getSuperAdmin() {
        return this.userService.findSuperAdmin();
    }
    changePassword(authorization, dto) {
        return this.userService.changePassword(authorization, dto);
    }
    paginate(query) {
        return this.userService.paginateForAdmin(query);
    }
    findOne(params) {
        return this.userService.findDetailForAdmin(params.id);
    }
    save(dto) {
        if (dto.id != null && dto.id > 0) {
            const { id, ...rest } = dto;
            return this.userService.update(id, rest);
        }
        return this.userService.create(dto);
    }
    update(params, dto) {
        return this.userService.update(params.id, dto);
    }
    remove(params) {
        return this.userService.remove(params.id);
    }
    removeByPost(params) {
        return this.userService.remove(params.id);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UserLoginDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('send-email-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.SendEmailCodeDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "sendEmailCode", null);
__decorate([
    (0, common_1.Post)('email-login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.EmailLoginDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "emailLogin", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "currentUser", null);
__decorate([
    (0, common_1.Get)('super-admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getSuperAdmin", null);
__decorate([
    (0, common_1.Put)('change-password'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('page'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.UserPageQueryDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "paginate", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "save", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.IdParamDto, user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/delete'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "removeByPost", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map