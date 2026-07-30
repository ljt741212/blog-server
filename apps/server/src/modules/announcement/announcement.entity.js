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
exports.Announcement = exports.AnnouncementStatus = void 0;
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
var AnnouncementStatus;
(function (AnnouncementStatus) {
    AnnouncementStatus["DRAFT"] = "draft";
    AnnouncementStatus["PUBLISHED"] = "published";
    AnnouncementStatus["ARCHIVED"] = "archived";
})(AnnouncementStatus || (exports.AnnouncementStatus = AnnouncementStatus = {}));
let Announcement = class Announcement extends common_entity_1.CommonEntity {
    title;
    content;
    status;
    isTop;
    views;
};
exports.Announcement = Announcement;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, comment: '标题' }),
    __metadata("design:type", String)
], Announcement.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', comment: '内容' }),
    __metadata("design:type", String)
], Announcement.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AnnouncementStatus,
        default: AnnouncementStatus.DRAFT,
        comment: '状态',
    }),
    __metadata("design:type", String)
], Announcement.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'isTop',
        type: 'boolean',
        default: false,
        comment: '是否置顶',
    }),
    __metadata("design:type", Boolean)
], Announcement.prototype, "isTop", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, comment: '浏览量' }),
    __metadata("design:type", Number)
], Announcement.prototype, "views", void 0);
exports.Announcement = Announcement = __decorate([
    (0, typeorm_1.Entity)('announcements')
], Announcement);
//# sourceMappingURL=announcement.entity.js.map