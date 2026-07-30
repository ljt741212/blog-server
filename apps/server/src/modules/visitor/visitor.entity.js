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
exports.Visitor = void 0;
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
const comment_entity_1 = require("../../../../../src/modules/comment/comment.entity");
const visitor_log_entity_1 = require("./visitor-log.entity");
let Visitor = class Visitor extends common_entity_1.CommonEntity {
    visitorId;
    fingerprint;
    ip;
    location;
    userAgent;
    lastActiveAt;
    comments;
    logs;
};
exports.Visitor = Visitor;
__decorate([
    (0, typeorm_1.Column)({
        name: 'visitor_id',
        type: 'varchar',
        length: 64,
        unique: true,
        nullable: true,
        comment: '访客唯一ID（前端 localStorage 中的 visitorId）',
    }),
    __metadata("design:type", Object)
], Visitor.prototype, "visitorId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 64,
        unique: true,
        nullable: true,
        comment: '访客唯一ID（浏览器指纹，如 localStorage 中的 visitorId）',
    }),
    __metadata("design:type", Object)
], Visitor.prototype, "fingerprint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true, comment: 'IP地址' }),
    __metadata("design:type", String)
], Visitor.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, comment: '位置' }),
    __metadata("design:type", Object)
], Visitor.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_agent',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '用户代理',
    }),
    __metadata("design:type", String)
], Visitor.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'last_active_at',
        type: 'datetime',
        precision: 6,
        nullable: true,
        comment: '最后活跃时间（用于统计当前在线）',
    }),
    __metadata("design:type", Object)
], Visitor.prototype, "lastActiveAt", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => comment_entity_1.Comment),
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (comment) => comment.visitor),
    __metadata("design:type", Array)
], Visitor.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => visitor_log_entity_1.VisitorLog, (log) => log.visitor),
    __metadata("design:type", Array)
], Visitor.prototype, "logs", void 0);
exports.Visitor = Visitor = __decorate([
    (0, typeorm_1.Entity)('visitors')
], Visitor);
//# sourceMappingURL=visitor.entity.js.map