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
exports.SeoSetting = void 0;
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
let SeoSetting = class SeoSetting extends common_entity_1.CommonEntity {
    title;
    description;
    keywords;
    sitemapUrl;
    robots;
    canonicalUrl;
    ogTitle;
    ogDescription;
    ogImage;
    schemaMarkup;
    metaAuthor;
    metaViewport;
};
exports.SeoSetting = SeoSetting;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, comment: '标题' }),
    __metadata("design:type", String)
], SeoSetting.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '描述' }),
    __metadata("design:type", String)
], SeoSetting.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '关键词' }),
    __metadata("design:type", String)
], SeoSetting.prototype, "keywords", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'sitemap_url',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Sitemap URL',
    }),
    __metadata("design:type", String)
], SeoSetting.prototype, "sitemapUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: 'Robots设置' }),
    __metadata("design:type", String)
], SeoSetting.prototype, "robots", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'canonical_url',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Canonical URL',
    }),
    __metadata("design:type", String)
], SeoSetting.prototype, "canonicalUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'og_title',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Open Graph标题',
    }),
    __metadata("design:type", String)
], SeoSetting.prototype, "ogTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'og_description',
        type: 'text',
        nullable: true,
        comment: 'Open Graph描述',
    }),
    __metadata("design:type", String)
], SeoSetting.prototype, "ogDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'og_image',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Open Graph图片',
    }),
    __metadata("design:type", String)
], SeoSetting.prototype, "ogImage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'schema_markup',
        type: 'text',
        nullable: true,
        comment: 'Schema标记',
    }),
    __metadata("design:type", String)
], SeoSetting.prototype, "schemaMarkup", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'meta_author',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Meta作者',
    }),
    __metadata("design:type", String)
], SeoSetting.prototype, "metaAuthor", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'meta_viewport',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: 'Meta视口',
    }),
    __metadata("design:type", String)
], SeoSetting.prototype, "metaViewport", void 0);
exports.SeoSetting = SeoSetting = __decorate([
    (0, typeorm_1.Entity)('seo_settings')
], SeoSetting);
//# sourceMappingURL=seo-setting.entity.js.map