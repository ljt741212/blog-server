"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoSettingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const seo_setting_controller_1 = require("./seo-setting.controller");
const seo_setting_entity_1 = require("./seo-setting.entity");
const seo_setting_service_1 = require("./seo-setting.service");
let SeoSettingModule = class SeoSettingModule {
};
exports.SeoSettingModule = SeoSettingModule;
exports.SeoSettingModule = SeoSettingModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([seo_setting_entity_1.SeoSetting])],
        controllers: [seo_setting_controller_1.SeoSettingController],
        providers: [seo_setting_service_1.SeoSettingService],
        exports: [seo_setting_service_1.SeoSettingService],
    })
], SeoSettingModule);
//# sourceMappingURL=seo-setting.module.js.map