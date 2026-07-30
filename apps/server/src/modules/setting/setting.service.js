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
exports.SettingService = void 0;
const common_1 = require("@nestjs/common");
const icp_info_service_1 = require("../../../../../src/modules/icp-info/icp-info.service");
const seo_setting_service_1 = require("../../../../../src/modules/seo-setting/seo-setting.service");
const site_config_service_1 = require("../../../../../src/modules/site-config/site-config.service");
let SettingService = class SettingService {
    seoSettingService;
    icpInfoService;
    siteConfigService;
    constructor(seoSettingService, icpInfoService, siteConfigService) {
        this.seoSettingService = seoSettingService;
        this.icpInfoService = icpInfoService;
        this.siteConfigService = siteConfigService;
    }
    async getAll() {
        const [seo, icp, siteConfig] = await Promise.all([
            this.seoSettingService.getSeoSetting(),
            this.icpInfoService.getLatest(),
            this.siteConfigService.get(),
        ]);
        return { seo, icp, siteConfig };
    }
    async save(dto) {
        const [seo, icp, siteConfig] = await Promise.all([
            dto.seo
                ? this.seoSettingService.save(dto.seo)
                : this.seoSettingService.getSeoSetting(),
            dto.icp
                ? this.icpInfoService.save(dto.icp)
                : this.icpInfoService.getLatest(),
            dto.siteConfig
                ? this.siteConfigService.save(dto.siteConfig)
                : this.siteConfigService.get(),
        ]);
        return { seo, icp, siteConfig };
    }
};
exports.SettingService = SettingService;
exports.SettingService = SettingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [seo_setting_service_1.SeoSettingService,
        icp_info_service_1.IcpInfoService,
        site_config_service_1.SiteConfigService])
], SettingService);
//# sourceMappingURL=setting.service.js.map