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
exports.Comment = exports.CommentStatus = void 0;
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
const post_entity_1 = require("../../../../../src/modules/post/post.entity");
const user_entity_1 = require("../../../../../src/modules/user/user.entity");
const visitor_entity_1 = require("../../../../../src/modules/visitor/visitor.entity");
var CommentStatus;
(function (CommentStatus) {
    CommentStatus["PENDING"] = "pending";
    CommentStatus["APPROVED"] = "approved";
    CommentStatus["REJECTED"] = "rejected";
})(CommentStatus || (exports.CommentStatus = CommentStatus = {}));
let Comment = class Comment extends common_entity_1.CommonEntity {
    content;
    status;
    likes;
    userId;
    visitorId;
    postId;
    parentId;
    user;
    visitor;
    post;
    parent;
    replies;
};
exports.Comment = Comment;
__decorate([
    (0, typeorm_1.Column)({ type: 'text', comment: '评论内容' }),
    __metadata("design:type", String)
], Comment.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CommentStatus,
        default: CommentStatus.PENDING,
        comment: '状态：待审核/已通过/已拒绝',
    }),
    __metadata("design:type", String)
], Comment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, comment: '点赞数' }),
    __metadata("design:type", Number)
], Comment.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'int', nullable: true, comment: '用户ID' }),
    __metadata("design:type", Number)
], Comment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'visitor_id',
        type: 'int',
        nullable: true,
        comment: '访客ID',
    }),
    __metadata("design:type", Number)
], Comment.prototype, "visitorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'postId', type: 'int', comment: '文章ID' }),
    __metadata("design:type", Number)
], Comment.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'parentId',
        type: 'int',
        nullable: true,
        comment: '父评论ID',
    }),
    __metadata("design:type", Number)
], Comment.prototype, "parentId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => user_entity_1.User),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.comments, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Comment.prototype, "user", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => visitor_entity_1.Visitor),
    (0, typeorm_1.ManyToOne)(() => visitor_entity_1.Visitor, (visitor) => visitor.comments, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'visitor_id' }),
    __metadata("design:type", visitor_entity_1.Visitor)
], Comment.prototype, "visitor", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => post_entity_1.Post),
    (0, typeorm_1.ManyToOne)(() => post_entity_1.Post, (post) => post.comments),
    (0, typeorm_1.JoinColumn)({ name: 'postId' }),
    __metadata("design:type", post_entity_1.Post)
], Comment.prototype, "post", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Comment),
    (0, typeorm_1.ManyToOne)(() => Comment, (comment) => comment.replies, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parentId' }),
    __metadata("design:type", Comment)
], Comment.prototype, "parent", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Comment),
    (0, typeorm_1.OneToMany)(() => Comment, (comment) => comment.parent),
    __metadata("design:type", Array)
], Comment.prototype, "replies", void 0);
exports.Comment = Comment = __decorate([
    (0, typeorm_1.Entity)('comments')
], Comment);
//# sourceMappingURL=comment.entity.js.map