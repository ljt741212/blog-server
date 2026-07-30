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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const lodash_1 = require("lodash");
const typeorm_2 = require("typeorm");
const common_2 = require("../../../../../src/common");
const email_service_1 = require("../../../../../src/modules/email/email.service");
const auth_util_1 = require("../../../../../src/shared/auth/auth.util");
const user_entity_1 = require("./user.entity");
function toUserResponse(u) {
    return {
        id: String(u.id),
        username: u.username,
        nickname: u.nickname,
        email: u.email,
        phone: u.phone,
        wechat: u.wechat,
        avatar: u.avatar,
        role: u.role,
        bio: u.bio,
        github: u.githubAccount,
        createdAt: u.createdAt,
    };
}
let UserService = class UserService {
    userRepository;
    jwtService;
    authUtil;
    emailService;
    constructor(userRepository, jwtService, authUtil, emailService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authUtil = authUtil;
        this.emailService = emailService;
    }
    async paginateForAdmin(query) {
        const qb = this.userRepository.createQueryBuilder('user');
        if (query.searchValue) {
            qb.andWhere('(user.username LIKE :kw OR user.email LIKE :kw)', {
                kw: `%${query.searchValue}%`,
            });
        }
        qb.orderBy('user.created_at', 'DESC');
        const pageResult = await (0, common_2.paginateQueryBuilderForAdmin)(qb, query);
        return {
            ...pageResult,
            items: pageResult.items.map((u) => toUserResponse(u)),
        };
    }
    async findCurrentUser(authorization) {
        const userId = this.authUtil.extractUserId(authorization);
        return this.findDetailForAdmin(userId);
    }
    async findSuperAdmin() {
        const user = await this.userRepository.findOne({
            where: { role: user_entity_1.UserRole.SUPER_ADMIN },
        });
        if (!user)
            throw new common_1.NotFoundException('超级管理员不存在');
        return toUserResponse(user);
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('用户不存在');
        return user;
    }
    async findDetailForAdmin(id) {
        const u = await this.findOne(id);
        return toUserResponse(u);
    }
    async create(dto) {
        const { username, email, password, nickname, phone, wechat, avatar, bio, github, gender, role, } = dto;
        if (!username || !email) {
            throw new common_1.BadRequestException('用户名和邮箱必填');
        }
        if (!password) {
            throw new common_1.BadRequestException('密码不能为空');
        }
        const exists = await this.userRepository.findOne({
            where: [{ username }, { email }],
        });
        if (exists) {
            throw new common_1.BadRequestException('用户名或邮箱已存在');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const entity = this.userRepository.create({
            username,
            nickname,
            password: hashedPassword,
            email,
            phone,
            wechat,
            avatar,
            bio,
            githubAccount: github,
            gender,
            role,
        });
        const saved = await this.userRepository.save(entity);
        return this.findDetailForAdmin(saved.id);
    }
    async update(id, dto) {
        const user = await this.findOne(id);
        const { username, email, password, github, ...fields } = dto;
        if (username && username !== user.username) {
            const exists = await this.userRepository.findOne({ where: { username } });
            if (exists)
                throw new common_1.BadRequestException('用户名已存在');
            user.username = username;
        }
        if (email && email !== user.email) {
            const exists = await this.userRepository.findOne({ where: { email } });
            if (exists)
                throw new common_1.BadRequestException('邮箱已存在');
            user.email = email;
        }
        if (typeof password === 'string' && password.length > 0) {
            user.password = await bcrypt.hash(password, 12);
        }
        if (github !== undefined)
            user.githubAccount = github;
        Object.assign(user, (0, lodash_1.pickBy)(fields, (v) => v !== undefined));
        await this.userRepository.save(user);
        return this.findDetailForAdmin(user.id);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
        return true;
    }
    async login(dto) {
        const user = await this.userRepository.findOne({
            where: { username: dto.username },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('用户名或密码错误');
        }
        const isValid = await bcrypt.compare(dto.password, user.password);
        if (!isValid)
            throw new common_1.UnauthorizedException('用户名或密码错误');
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };
        const token = this.jwtService.sign(payload);
        return {
            token,
            user: toUserResponse(user),
        };
    }
    async sendEmailCode(dto) {
        await this.emailService.sendCode(dto.email);
        return { message: '验证码已发送' };
    }
    async emailLogin(dto) {
        const valid = await this.emailService.verifyCode(dto.email, dto.code);
        if (!valid) {
            throw new common_1.UnauthorizedException('验证码错误或已过期');
        }
        const user = await this.userRepository.findOne({
            where: { email: dto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('该邮箱未注册');
        }
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };
        const token = this.jwtService.sign(payload);
        return {
            token,
            user: toUserResponse(user),
        };
    }
    async changePassword(authorization, dto) {
        const userId = this.authUtil.extractUserId(authorization);
        const user = await this.findOne(userId);
        const isValid = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('原密码错误');
        }
        user.password = await bcrypt.hash(dto.newPassword, 12);
        await this.userRepository.save(user);
        return { message: '密码修改成功' };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        auth_util_1.AuthUtil,
        email_service_1.EmailService])
], UserService);
//# sourceMappingURL=user.service.js.map