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
exports.FriendLink = exports.FriendLinkStatus = void 0;
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
var FriendLinkStatus;
(function (FriendLinkStatus) {
    FriendLinkStatus[FriendLinkStatus["DISABLED"] = 0] = "DISABLED";
    FriendLinkStatus[FriendLinkStatus["ENABLED"] = 1] = "ENABLED";
})(FriendLinkStatus || (exports.FriendLinkStatus = FriendLinkStatus = {}));
let FriendLink = class FriendLink extends common_entity_1.CommonEntity {
    name;
    url;
    description;
    avatar;
    sort;
    status;
};
exports.FriendLink = FriendLink;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, comment: '链接名称' }),
    __metadata("design:type", String)
], FriendLink.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, comment: '链接地址' }),
    __metadata("design:type", String)
], FriendLink.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '描述' }),
    __metadata("design:type", String)
], FriendLink.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 500,
        nullable: true,
        comment: '头像/图标URL',
    }),
    __metadata("design:type", String)
], FriendLink.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, comment: '排序（越大越靠前）' }),
    __metadata("design:type", Number)
], FriendLink.prototype, "sort", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'tinyint',
        default: FriendLinkStatus.ENABLED,
        comment: '状态：1-启用，0-禁用',
    }),
    __metadata("design:type", Number)
], FriendLink.prototype, "status", void 0);
exports.FriendLink = FriendLink = __decorate([
    (0, typeorm_1.Entity)('friend_links')
], FriendLink);
//# sourceMappingURL=friend-link.entity.js.map