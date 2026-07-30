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
exports.AnnouncementController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const announcement_dto_1 = require("./announcement.dto");
const announcement_service_1 = require("./announcement.service");
let AnnouncementController = class AnnouncementController {
    announcementService;
    constructor(announcementService) {
        this.announcementService = announcementService;
    }
    paginate(query) {
        return this.announcementService.paginateForAdmin(query);
    }
    findAll() {
        return this.announcementService.findAll();
    }
    findOne(params) {
        return this.announcementService.findPublicOne(params.id);
    }
    save(dto) {
        return this.announcementService.save(dto);
    }
    remove(params) {
        return this.announcementService.remove(params.id);
    }
};
exports.AnnouncementController = AnnouncementController;
__decorate([
    (0, common_1.Get)('page'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [announcement_dto_1.AnnouncementPageQueryDto]),
    __metadata("design:returntype", void 0)
], AnnouncementController.prototype, "paginate", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnnouncementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [announcement_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], AnnouncementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [announcement_dto_1.SaveAnnouncementDto]),
    __metadata("design:returntype", void 0)
], AnnouncementController.prototype, "save", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [announcement_dto_1.IdParamDto]),
    __metadata("design:returntype", void 0)
], AnnouncementController.prototype, "remove", null);
exports.AnnouncementController = AnnouncementController = __decorate([
    (0, common_1.Controller)('announcements'),
    __metadata("design:paramtypes", [announcement_service_1.AnnouncementService])
], AnnouncementController);
//# sourceMappingURL=announcement.controller.js.map