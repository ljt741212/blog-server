"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt_auth_guard_1 = require("../../../../../src/common/guards/jwt-auth.guard");
const super_admin_guard_1 = require("../../../../../src/common/guards/super-admin.guard");
const env_1 = require("../../../../../src/global/env");
const auth_util_1 = require("./auth.util");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: (0, env_1.envString)('JWT_SECRET'),
                signOptions: { expiresIn: '7d' },
            }),
        ],
        providers: [jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard, auth_util_1.AuthUtil],
        exports: [jwt_1.JwtModule, jwt_auth_guard_1.JwtAuthGuard, super_admin_guard_1.SuperAdminGuard, auth_util_1.AuthUtil],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map