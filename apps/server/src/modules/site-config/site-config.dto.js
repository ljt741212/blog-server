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
exports.SaveSiteConfigDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SaveSiteConfigDto {
    backgroundImage;
    siteStartedAt;
    footerText;
}
exports.SaveSiteConfigDto = SaveSiteConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '背景图URL', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveSiteConfigDto.prototype, "backgroundImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '网站开始运行时间', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SaveSiteConfigDto.prototype, "siteStartedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '页脚一句话', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SaveSiteConfigDto.prototype, "footerText", void 0);
//# sourceMappingURL=site-config.dto.js.map