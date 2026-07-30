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
exports.VisitorLog = void 0;
const typeorm_1 = require("typeorm");
const visitor_entity_1 = require("./visitor.entity");
let VisitorLog = class VisitorLog {
    id;
    visitor;
    visitorId;
    ip;
    userAgent;
    pageUrl;
    referer;
    visitedAt;
};
exports.VisitorLog = VisitorLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VisitorLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => visitor_entity_1.Visitor, (visitor) => visitor.logs, {
        nullable: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    }),
    __metadata("design:type", visitor_entity_1.Visitor)
], VisitorLog.prototype, "visitor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'visitorId', type: 'int', nullable: true, comment: '访客ID' }),
    __metadata("design:type", Number)
], VisitorLog.prototype, "visitorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: 'IP地址' }),
    __metadata("design:type", String)
], VisitorLog.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'userAgent',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '用户代理',
    }),
    __metadata("design:type", String)
], VisitorLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'pageUrl',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '页面URL',
    }),
    __metadata("design:type", String)
], VisitorLog.prototype, "pageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '来源',
    }),
    __metadata("design:type", String)
], VisitorLog.prototype, "referer", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'visited_at', comment: '访问时间' }),
    __metadata("design:type", Date)
], VisitorLog.prototype, "visitedAt", void 0);
exports.VisitorLog = VisitorLog = __decorate([
    (0, typeorm_1.Entity)('visitor_logs')
], VisitorLog);
//# sourceMappingURL=visitor-log.entity.js.map