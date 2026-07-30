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
exports.OssController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const common_2 = require("../../../../../src/common");
const oss_dto_1 = require("./dto/oss.dto");
const oss_service_1 = require("./oss.service");
let OssController = class OssController {
    ossService;
    constructor(ossService) {
        this.ossService = ossService;
    }
    upload(file, query) {
        return this.ossService.upload(file, query.dir);
    }
    signUrl(query) {
        return {
            url: this.ossService.signUrl(query.key, query.expires),
        };
    }
    async download(key, res) {
        const result = await this.ossService.getStream(key);
        const contentType = (result.res?.headers && result.res.headers['content-type']) ||
            'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(key.split('/').pop() || 'file')}"`);
        result.stream.pipe(res);
    }
};
exports.OssController = OssController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, oss_dto_1.UploadQueryDto]),
    __metadata("design:returntype", void 0)
], OssController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)('sign-url'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [oss_dto_1.SignUrlQueryDto]),
    __metadata("design:returntype", void 0)
], OssController.prototype, "signUrl", null);
__decorate([
    (0, common_1.Get)('download'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard),
    __param(0, (0, common_1.Query)('key')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OssController.prototype, "download", null);
exports.OssController = OssController = __decorate([
    (0, common_1.Controller)('oss'),
    __metadata("design:paramtypes", [oss_service_1.OssService])
], OssController);
//# sourceMappingURL=oss.controller.js.map