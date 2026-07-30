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
exports.SiteConfigController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("../../../../../src/common");
const site_config_dto_1 = require("./site-config.dto");
const site_config_service_1 = require("./site-config.service");
let SiteConfigController = class SiteConfigController {
    siteConfigService;
    constructor(siteConfigService) {
        this.siteConfigService = siteConfigService;
    }
    get() {
        return this.siteConfigService.get();
    }
    save(dto) {
        return this.siteConfigService.save(dto);
    }
};
exports.SiteConfigController = SiteConfigController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SiteConfigController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [site_config_dto_1.SaveSiteConfigDto]),
    __metadata("design:returntype", void 0)
], SiteConfigController.prototype, "save", null);
exports.SiteConfigController = SiteConfigController = __decorate([
    (0, common_1.Controller)('site-config'),
    __metadata("design:paramtypes", [site_config_service_1.SiteConfigService])
], SiteConfigController);
//# sourceMappingURL=site-config.controller.js.map