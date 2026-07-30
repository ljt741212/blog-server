"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTransferController = void 0;
const os = __importStar(require("os"));
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const common_2 = require("../../../../../src/common");
const data_transfer_service_1 = require("./data-transfer.service");
const wordpress_import_service_1 = require("./wordpress-import.service");
let DataTransferController = class DataTransferController {
    dataTransferService;
    wpImportService;
    constructor(dataTransferService, wpImportService) {
        this.dataTransferService = dataTransferService;
        this.wpImportService = wpImportService;
    }
    exportAll(res) {
        return this.dataTransferService.exportAllToZip(res);
    }
    async importAll(file, mode) {
        if (!file?.path)
            throw new common_1.BadRequestException('缺少上传文件 file');
        if (mode && mode !== 'truncate') {
            throw new common_1.BadRequestException('mode 仅支持 truncate');
        }
        return this.dataTransferService.importAllFromZip(file.path, {
            mode: mode ?? 'truncate',
        });
    }
    async importWordPress(file) {
        if (!file?.path)
            throw new common_1.BadRequestException('缺少上传文件 file');
        return this.wpImportService.importFromXml(file.path);
    }
};
exports.DataTransferController = DataTransferController;
__decorate([
    (0, common_1.Get)('export'),
    (0, common_2.Bypass)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DataTransferController.prototype, "exportAll", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => cb(null, os.tmpdir()),
            filename: (req, file, cb) => {
                const suffix = (0, path_1.extname)(file.originalname || '') || '.zip';
                cb(null, `data-import-${Date.now()}${suffix}`);
            },
        }),
        limits: {
            fileSize: 1024 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Query)('mode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DataTransferController.prototype, "importAll", null);
__decorate([
    (0, common_1.Post)('import-wordpress'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => cb(null, os.tmpdir()),
            filename: (req, file, cb) => {
                const suffix = (0, path_1.extname)(file.originalname || '') || '.xml';
                cb(null, `wp-import-${Date.now()}${suffix}`);
            },
        }),
        limits: {
            fileSize: 1024 * 1024 * 100,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataTransferController.prototype, "importWordPress", null);
exports.DataTransferController = DataTransferController = __decorate([
    (0, common_1.Controller)('data-transfer'),
    (0, common_1.UseGuards)(common_2.JwtAuthGuard, common_2.SuperAdminGuard),
    __metadata("design:paramtypes", [data_transfer_service_1.DataTransferService,
        wordpress_import_service_1.WordPressImportService])
], DataTransferController);
//# sourceMappingURL=data-transfer.controller.js.map