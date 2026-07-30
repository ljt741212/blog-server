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
exports.Changelog = exports.ChangelogType = void 0;
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
var ChangelogType;
(function (ChangelogType) {
    ChangelogType["FEATURE"] = "feature";
    ChangelogType["IMPROVEMENT"] = "improvement";
    ChangelogType["BUGFIX"] = "bugfix";
    ChangelogType["SECURITY"] = "security";
})(ChangelogType || (exports.ChangelogType = ChangelogType = {}));
let Changelog = class Changelog extends common_entity_1.CommonEntity {
    version;
    title;
    content;
    type;
    isPublished;
    releaseDate;
};
exports.Changelog = Changelog;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: '版本号' }),
    __metadata("design:type", String)
], Changelog.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, comment: '标题' }),
    __metadata("design:type", String)
], Changelog.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', comment: '内容' }),
    __metadata("design:type", String)
], Changelog.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ChangelogType,
        default: ChangelogType.IMPROVEMENT,
        comment: '类型',
    }),
    __metadata("design:type", String)
], Changelog.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'isPublished',
        type: 'boolean',
        default: false,
        comment: '是否发布',
    }),
    __metadata("design:type", Boolean)
], Changelog.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'releaseDate', type: 'date', comment: '发布日期' }),
    __metadata("design:type", Date)
], Changelog.prototype, "releaseDate", void 0);
exports.Changelog = Changelog = __decorate([
    (0, typeorm_1.Entity)('changelogs')
], Changelog);
//# sourceMappingURL=changelog.entity.js.map