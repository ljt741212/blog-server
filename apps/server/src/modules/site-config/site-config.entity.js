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
exports.SiteConfig = void 0;
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
let SiteConfig = class SiteConfig extends common_entity_1.CommonEntity {
    backgroundImage;
    siteStartedAt;
    footerText;
};
exports.SiteConfig = SiteConfig;
__decorate([
    (0, typeorm_1.Column)({
        name: 'background_image',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '背景图URL',
    }),
    __metadata("design:type", String)
], SiteConfig.prototype, "backgroundImage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'site_started_at',
        type: 'datetime',
        nullable: true,
        comment: '网站开始运行时间',
    }),
    __metadata("design:type", Object)
], SiteConfig.prototype, "siteStartedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'footer_text',
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '页脚一句话',
    }),
    __metadata("design:type", String)
], SiteConfig.prototype, "footerText", void 0);
exports.SiteConfig = SiteConfig = __decorate([
    (0, typeorm_1.Entity)('site_config')
], SiteConfig);
//# sourceMappingURL=site-config.entity.js.map