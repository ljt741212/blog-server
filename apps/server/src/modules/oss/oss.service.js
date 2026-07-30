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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OssService = void 0;
const path_1 = __importDefault(require("path"));
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ali_oss_1 = __importDefault(require("ali-oss"));
const oss_config_1 = require("../../../../../src/config/oss.config");
function assertSafeKey(key) {
    if (!key || !key.trim())
        throw new common_1.BadRequestException('key 不能为空');
    if (key.includes('\\'))
        throw new common_1.BadRequestException('key 不合法');
    if (key.includes('..'))
        throw new common_1.BadRequestException('key 不合法');
    if (key.startsWith('/'))
        throw new common_1.BadRequestException('key 不合法');
}
function normalizeDir(dir) {
    if (!dir)
        return '';
    const d = dir.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    if (!d)
        return '';
    if (d.includes('..'))
        throw new common_1.BadRequestException('dir 不合法');
    return d;
}
let OssService = class OssService {
    configService;
    client;
    cfg;
    constructor(configService) {
        this.configService = configService;
        const cfg = this.configService.get(oss_config_1.ossRegToken, {
            infer: true,
        });
        if (!cfg)
            throw new common_1.BadRequestException('OSS 配置缺失');
        this.cfg = cfg;
        if (!cfg.region ||
            !cfg.accessKeyId ||
            !cfg.accessKeySecret ||
            !cfg.bucket) {
            throw new common_1.BadRequestException('OSS 环境变量未配置完整');
        }
        this.client = new ali_oss_1.default({
            region: cfg.region,
            accessKeyId: cfg.accessKeyId,
            accessKeySecret: cfg.accessKeySecret,
            bucket: cfg.bucket,
            endpoint: cfg.endpoint || undefined,
            secure: cfg.secure,
        });
    }
    async upload(file, dir) {
        if (!file)
            throw new common_1.BadRequestException('请上传文件');
        if (!file.originalname)
            throw new common_1.BadRequestException('文件名缺失');
        if (!file.buffer || !file.buffer.length)
            throw new common_1.BadRequestException('文件内容为空');
        const maxBytes = (this.cfg.maxFileSizeMB ?? 10) * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new common_1.BadRequestException(`文件过大，不能超过 ${this.cfg.maxFileSizeMB ?? 10} MB`);
        }
        const allowedPrefixes = (this.cfg.allowedMimePrefixes || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        if (allowedPrefixes.length && file.mimetype) {
            const ok = allowedPrefixes.some((prefix) => file.mimetype.startsWith(prefix));
            if (!ok) {
                throw new common_1.BadRequestException(`不支持的文件类型：${file.mimetype || 'unknown'}`);
            }
        }
        const safeDir = normalizeDir(dir ?? this.cfg.defaultDir);
        const ext = path_1.default.extname(file.originalname).slice(0, 16).toLowerCase();
        const today = new Date();
        const datePath = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0'),
        ].join('/');
        const randomPart = Math.random().toString(16).slice(2, 10);
        const baseName = `${today.getTime()}-${randomPart}`;
        const dirPath = [safeDir, datePath].filter(Boolean).join('/');
        const key = [dirPath, `${baseName}${ext}`].filter(Boolean).join('/');
        let result;
        try {
            result = await this.client.put(key, file.buffer, {
                mime: file.mimetype || undefined,
            });
        }
        catch {
            throw new common_1.InternalServerErrorException('文件上传失败，请稍后重试');
        }
        const publicUrl = this.cfg.publicBaseUrl
            ? `${this.cfg.publicBaseUrl.replace(/\/+$/g, '')}/${key}`
            : result.url;
        const etag = result.res?.headers && typeof result.res.headers === 'object'
            ? result.res.headers.etag
            : undefined;
        return {
            key,
            url: publicUrl,
            mime: file.mimetype,
            size: file.size,
            originalName: file.originalname,
            etag,
        };
    }
    signUrl(key, expires) {
        assertSafeKey(key);
        const exp = expires ?? this.cfg.signExpires ?? 600;
        return this.client.signatureUrl(key, { expires: exp });
    }
    async getStream(key) {
        assertSafeKey(key);
        const result = await this.client.getStream(key);
        return result;
    }
};
exports.OssService = OssService;
exports.OssService = OssService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OssService);
//# sourceMappingURL=oss.service.js.map