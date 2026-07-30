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
exports.Tag = exports.TagStatus = void 0;
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
const post_entity_1 = require("../../../../../src/modules/post/post.entity");
var TagStatus;
(function (TagStatus) {
    TagStatus[TagStatus["DISABLED"] = 0] = "DISABLED";
    TagStatus[TagStatus["ENABLED"] = 1] = "ENABLED";
})(TagStatus || (exports.TagStatus = TagStatus = {}));
let Tag = class Tag extends common_entity_1.CommonEntity {
    name;
    description;
    version;
    status;
    posts;
};
exports.Tag = Tag;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, comment: '标签名称' }),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true, comment: '描述' }),
    __metadata("design:type", String)
], Tag.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)({ comment: '版本号' }),
    __metadata("design:type", Number)
], Tag.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'tinyint',
        default: TagStatus.ENABLED,
        comment: '状态：1-启用，0-禁用',
    }),
    __metadata("design:type", Number)
], Tag.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => post_entity_1.Post, (post) => post.tags),
    __metadata("design:type", Array)
], Tag.prototype, "posts", void 0);
exports.Tag = Tag = __decorate([
    (0, typeorm_1.Entity)('tags')
], Tag);
//# sourceMappingURL=tag.entity.js.map