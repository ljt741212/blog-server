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
exports.CreateSeoSettingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateSeoSettingDto {
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
}
exports.CreateSeoSettingDto = CreateSeoSettingDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '标题' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '描述' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关键词' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "keywords", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sitemap URL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "sitemapUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Robots设置' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "robots", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Canonical URL' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "canonicalUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Open Graph标题' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "ogTitle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Open Graph描述' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "ogDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Open Graph图片' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "ogImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Schema标记' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "schemaMarkup", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Meta作者' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "metaAuthor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Meta视口' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeoSettingDto.prototype, "metaViewport", void 0);
//# sourceMappingURL=seo-setting.dto.js.map