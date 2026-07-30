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
exports.SeoSettingController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const seo_setting_dto_1 = require("./seo-setting.dto");
const seo_setting_service_1 = require("./seo-setting.service");
let SeoSettingController = class SeoSettingController {
    seoSettingService;
    constructor(seoSettingService) {
        this.seoSettingService = seoSettingService;
    }
    getSeoSetting() {
        return this.seoSettingService.getSeoSetting();
    }
    save(dto) {
        return this.seoSettingService.save(dto);
    }
};
exports.SeoSettingController = SeoSettingController;
__decorate([
    (0, common_1.Get)('latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SeoSettingController.prototype, "getSeoSetting", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seo_setting_dto_1.CreateSeoSettingDto]),
    __metadata("design:returntype", void 0)
], SeoSettingController.prototype, "save", null);
exports.SeoSettingController = SeoSettingController = __decorate([
    (0, common_1.Controller)('seo-settings'),
    __metadata("design:paramtypes", [seo_setting_service_1.SeoSettingService])
], SeoSettingController);
//# sourceMappingURL=seo-setting.controller.js.map