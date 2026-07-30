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
exports.EmailCode = void 0;
const typeorm_1 = require("typeorm");
let EmailCode = class EmailCode {
    id;
    email;
    code;
    used;
    createdAt;
};
exports.EmailCode = EmailCode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmailCode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, comment: '邮箱地址' }),
    __metadata("design:type", String)
], EmailCode.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, comment: '验证码' }),
    __metadata("design:type", String)
], EmailCode.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0, comment: '0-未使用, 1-已使用' }),
    __metadata("design:type", Number)
], EmailCode.prototype, "used", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '创建时间' }),
    __metadata("design:type", Date)
], EmailCode.prototype, "createdAt", void 0);
exports.EmailCode = EmailCode = __decorate([
    (0, typeorm_1.Entity)('email_codes')
], EmailCode);
//# sourceMappingURL=email-code.entity.js.map