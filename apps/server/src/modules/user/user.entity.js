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
exports.User = exports.Gender = exports.UserRole = void 0;
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
const comment_entity_1 = require("../../../../../src/modules/comment/comment.entity");
const post_entity_1 = require("../../../../../src/modules/post/post.entity");
var UserRole;
(function (UserRole) {
    UserRole[UserRole["ADMIN"] = 0] = "ADMIN";
    UserRole[UserRole["SUPER_ADMIN"] = 1] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var Gender;
(function (Gender) {
    Gender[Gender["FEMALE"] = 0] = "FEMALE";
    Gender[Gender["MALE"] = 1] = "MALE";
})(Gender || (exports.Gender = Gender = {}));
let User = class User extends common_entity_1.CommonEntity {
    username;
    nickname;
    password;
    email;
    phone;
    wechat;
    role;
    avatar;
    bio;
    githubAccount;
    gender;
    posts;
    comments;
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, comment: '用户名' }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true, comment: '昵称' }),
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, comment: '密码' }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true, comment: '邮箱' }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true, comment: '手机号' }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true, comment: '微信号' }),
    __metadata("design:type", String)
], User.prototype, "wechat", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'tinyint',
        default: UserRole.ADMIN,
        comment: '角色：0-管理员，1-超级管理员',
    }),
    __metadata("design:type", Number)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, comment: '头像' }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, comment: '简介' }),
    __metadata("design:type", String)
], User.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'github_account',
        type: 'varchar',
        length: 100,
        nullable: true,
        comment: 'GitHub账号',
    }),
    __metadata("design:type", String)
], User.prototype, "githubAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'tinyint',
        nullable: true,
        comment: '性别：0-女，1-男',
    }),
    __metadata("design:type", Number)
], User.prototype, "gender", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => post_entity_1.Post),
    (0, typeorm_1.OneToMany)(() => post_entity_1.Post, (post) => post.user),
    __metadata("design:type", Array)
], User.prototype, "posts", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => comment_entity_1.Comment),
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (comment) => comment.user),
    __metadata("design:type", Array)
], User.prototype, "comments", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map