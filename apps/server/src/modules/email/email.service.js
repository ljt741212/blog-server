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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const nodemailer = __importStar(require("nodemailer"));
const typeorm_2 = require("typeorm");
const config_2 = require("../../../../../src/config");
const email_code_entity_1 = require("./email-code.entity");
let EmailService = class EmailService {
    configService;
    emailCodeRepository;
    transporter;
    cfg;
    constructor(configService, emailCodeRepository) {
        this.configService = configService;
        this.emailCodeRepository = emailCodeRepository;
        const cfg = this.configService.get(config_2.emailRegToken, {
            infer: true,
        });
        if (!cfg || !cfg.user || !cfg.pass) {
            throw new Error('邮件配置不完整，请检查 EMAIL_USER / EMAIL_PASS');
        }
        this.cfg = cfg;
        this.transporter = nodemailer.createTransport({
            host: cfg.host,
            port: cfg.port,
            secure: cfg.secure,
            auth: { user: cfg.user, pass: cfg.pass },
        });
    }
    async sendCode(to) {
        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            throw new common_1.BadRequestException('邮箱格式不正确');
        }
        const recent = await this.emailCodeRepository.findOne({
            where: { email: to, createdAt: (0, typeorm_2.MoreThan)(new Date(Date.now() - 60_000)) },
            order: { createdAt: 'DESC' },
        });
        if (recent) {
            throw new common_1.BadRequestException('发送过于频繁，请 60 秒后再试');
        }
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const entity = this.emailCodeRepository.create({ email: to, code });
        await this.emailCodeRepository.save(entity);
        try {
            await this.transporter.sendMail({
                from: this.cfg.from || this.cfg.user,
                to,
                subject: '登录验证码',
                html: `<p>您的验证码是：<strong>${code}</strong></p><p>5 分钟内有效，请勿泄露。</p>`,
            });
        }
        catch {
            throw new common_1.InternalServerErrorException('邮件发送失败，请稍后重试');
        }
    }
    async verifyCode(email, code) {
        if (!email || !code)
            return false;
        const record = await this.emailCodeRepository.findOne({
            where: { email, code, used: 0 },
            order: { createdAt: 'DESC' },
        });
        if (!record)
            return false;
        if (Date.now() - record.createdAt.getTime() > 5 * 60_000) {
            return false;
        }
        record.used = 1;
        await this.emailCodeRepository.save(record);
        return true;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(email_code_entity_1.EmailCode)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], EmailService);
//# sourceMappingURL=email.service.js.map