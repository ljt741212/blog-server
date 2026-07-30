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
exports.Post = exports.PostStatus = void 0;
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const common_entity_1 = require("../../../../../src/common/entity/common.entity");
const category_entity_1 = require("../../../../../src/modules/category/category.entity");
const comment_entity_1 = require("../../../../../src/modules/comment/comment.entity");
const tag_entity_1 = require("../../../../../src/modules/tag/tag.entity");
const user_entity_1 = require("../../../../../src/modules/user/user.entity");
var PostStatus;
(function (PostStatus) {
    PostStatus["DRAFT"] = "draft";
    PostStatus["PUBLISHED"] = "published";
    PostStatus["ARCHIVED"] = "archived";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
let Post = class Post extends common_entity_1.CommonEntity {
    title;
    content;
    summary;
    coverImage;
    isTop;
    isRecommended;
    slug;
    views;
    likes;
    status;
    publishTime;
    user;
    category;
    tags;
    comments;
};
exports.Post = Post;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, comment: '标题' }),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', comment: '内容' }),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true, comment: '摘要' }),
    __metadata("design:type", String)
], Post.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'coverImage',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: '封面图',
    }),
    __metadata("design:type", String)
], Post.prototype, "coverImage", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'isTop',
        type: 'boolean',
        default: false,
        comment: '是否置顶',
    }),
    __metadata("design:type", Boolean)
], Post.prototype, "isTop", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'isRecommended',
        type: 'boolean',
        default: false,
        comment: '是否推荐',
    }),
    __metadata("design:type", Boolean)
], Post.prototype, "isRecommended", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, comment: 'URL别名' }),
    __metadata("design:type", String)
], Post.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, comment: '浏览量' }),
    __metadata("design:type", Number)
], Post.prototype, "views", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, comment: '点赞数' }),
    __metadata("design:type", Number)
], Post.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PostStatus,
        default: PostStatus.DRAFT,
        comment: '状态',
    }),
    __metadata("design:type", String)
], Post.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'publishTime',
        type: 'datetime',
        nullable: true,
        comment: '发布时间',
    }),
    __metadata("design:type", Object)
], Post.prototype, "publishTime", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => user_entity_1.User),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.posts, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Post.prototype, "user", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => category_entity_1.Category),
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.posts),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], Post.prototype, "category", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => tag_entity_1.Tag),
    (0, typeorm_1.ManyToMany)(() => tag_entity_1.Tag, (tag) => tag.posts),
    (0, typeorm_1.JoinTable)({
        name: 'posts_tags',
        joinColumn: { name: 'postsId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagsId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Post.prototype, "tags", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => comment_entity_1.Comment),
    (0, typeorm_1.OneToMany)(() => comment_entity_1.Comment, (comment) => comment.post),
    __metadata("design:type", Array)
], Post.prototype, "comments", void 0);
exports.Post = Post = __decorate([
    (0, typeorm_1.Entity)('posts')
], Post);
//# sourceMappingURL=post.entity.js.map