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
exports.GuestMessage = exports.GuestMessageStatus = void 0;
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
const user_entity_1 = require("../../../../../src/modules/user/user.entity");
const visitor_entity_1 = require("../../../../../src/modules/visitor/visitor.entity");
var GuestMessageStatus;
(function (GuestMessageStatus) {
    GuestMessageStatus["PENDING"] = "pending";
    GuestMessageStatus["APPROVED"] = "approved";
    GuestMessageStatus["REJECTED"] = "rejected";
})(GuestMessageStatus || (exports.GuestMessageStatus = GuestMessageStatus = {}));
let GuestMessage = class GuestMessage extends common_entity_1.CommonEntity {
    content;
    status;
    nickname;
    email;
    userId;
    visitorId;
    user;
    visitor;
};
exports.GuestMessage = GuestMessage;
__decorate([
    (0, typeorm_1.Column)({ type: 'text', comment: '留言内容' }),
    __metadata("design:type", String)
], GuestMessage.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GuestMessageStatus,
        default: GuestMessageStatus.PENDING,
        comment: '状态：待审核/已通过/已拒绝',
    }),
    __metadata("design:type", String)
], GuestMessage.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: true,
        comment: '留言者昵称',
    }),
    __metadata("design:type", Object)
], GuestMessage.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: '留言者邮箱',
    }),
    __metadata("design:type", Object)
], GuestMessage.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'user_id',
        type: 'int',
        nullable: true,
        comment: '用户ID（登录用户留言时）',
    }),
    __metadata("design:type", Object)
], GuestMessage.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'visitor_id',
        type: 'int',
        nullable: true,
        comment: '访客ID（游客留言时）',
    }),
    __metadata("design:type", Object)
], GuestMessage.prototype, "visitorId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => user_entity_1.User),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Object)
], GuestMessage.prototype, "user", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => visitor_entity_1.Visitor),
    (0, typeorm_1.ManyToOne)(() => visitor_entity_1.Visitor, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'visitor_id' }),
    __metadata("design:type", Object)
], GuestMessage.prototype, "visitor", void 0);
exports.GuestMessage = GuestMessage = __decorate([
    (0, typeorm_1.Entity)('guest_messages')
], GuestMessage);
//# sourceMappingURL=guest-message.entity.js.map