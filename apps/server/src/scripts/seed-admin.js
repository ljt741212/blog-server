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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcryptjs"));
const data_source_1 = __importDefault(require("../../../../src/config/data-source"));
const user_entity_1 = require("../../../../src/modules/user/user.entity");
const DEFAULT_USERNAME = 'admin';
const DEFAULT_EMAIL = 'admin@localhost.com';
const DEFAULT_PASSWORD = '123456';
async function seed() {
    await data_source_1.default.initialize();
    const userRepo = data_source_1.default.getRepository(user_entity_1.User);
    const count = await userRepo.count();
    if (count > 0) {
        console.log('[seed] 已有用户，跳过创建初始管理员');
        await data_source_1.default.destroy();
        return;
    }
    const username = process.env.SEED_ADMIN_USERNAME ?? DEFAULT_USERNAME;
    const email = process.env.SEED_ADMIN_EMAIL ?? DEFAULT_EMAIL;
    const rawPassword = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
    const password = await bcrypt.hash(rawPassword, 12);
    await userRepo.save(userRepo.create({
        username,
        email,
        password,
        role: user_entity_1.UserRole.SUPER_ADMIN,
    }));
    console.log('[seed] 已创建初始管理员');
    console.log('  用户名:', username);
    console.log('  邮箱:', email);
    console.log('  密码:', rawPassword === DEFAULT_PASSWORD
        ? `${rawPassword}（请尽快在后台修改）`
        : '***');
    await data_source_1.default.destroy();
}
seed().catch((e) => {
    console.error('[seed] 执行失败:', e);
    process.exit(1);
});
//# sourceMappingURL=seed-admin.js.map