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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_2 = require("../../../../../src/common");
const post_entity_1 = require("../../../../../src/modules/post/post.entity");
const visitor_entity_1 = require("../../../../../src/modules/visitor/visitor.entity");
const comment_entity_1 = require("./comment.entity");
let CommentService = class CommentService {
    commentRepository;
    postRepository;
    visitorRepository;
    constructor(commentRepository, postRepository, visitorRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.visitorRepository = visitorRepository;
    }
    async create(dto) {
        const { content, postId, parentId, userId, visitorId: visitorIdStr } = dto;
        await this.ensurePostExists(postId);
        if (parentId) {
            await this.ensureCommentExists(parentId);
        }
        if (!userId && !visitorIdStr) {
            throw new common_1.BadRequestException('请提供 userId 或 visitorId');
        }
        let visitorIdNum;
        if (visitorIdStr) {
            let visitor = await this.visitorRepository.findOne({
                where: [{ visitorId: visitorIdStr }, { fingerprint: visitorIdStr }],
            });
            if (!visitor) {
                visitor = this.visitorRepository.create({
                    visitorId: visitorIdStr,
                    fingerprint: visitorIdStr,
                });
                visitor = await this.visitorRepository.save(visitor);
            }
            visitorIdNum = visitor.id;
        }
        const comment = this.commentRepository.create({
            content,
            postId,
            parentId: parentId ?? undefined,
            userId: userId ?? undefined,
            visitorId: visitorIdNum ?? undefined,
            status: comment_entity_1.CommentStatus.PENDING,
        });
        const saved = await this.commentRepository.save(comment);
        return this.commentRepository.findOneOrFail({
            where: { id: saved.id },
            relations: ['user', 'visitor', 'post'],
        });
    }
    async updateStatus(id, status) {
        const comment = await this.commentRepository.findOne({ where: { id } });
        if (!comment)
            throw new common_1.NotFoundException('评论不存在');
        comment.status = status;
        await this.commentRepository.save(comment);
        return true;
    }
    async paginateForAdmin(query) {
        const qb = this.commentRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .leftJoinAndSelect('comment.visitor', 'visitor')
            .leftJoinAndSelect('comment.post', 'post')
            .leftJoinAndSelect('comment.parent', 'parent');
        if (query.postId) {
            qb.andWhere('comment.postId = :postId', { postId: query.postId });
        }
        if (query.status !== undefined) {
            qb.andWhere('comment.status = :status', { status: query.status });
        }
        if (query.searchValue) {
            qb.andWhere('comment.content LIKE :kw', {
                kw: `%${query.searchValue}%`,
            });
        }
        qb.orderBy('comment.createdAt', 'DESC');
        const page = await (0, common_2.paginateQueryBuilderForAdmin)(qb, query);
        return {
            ...page,
            items: page.items.map((c) => this.buildCommentItem(c)),
        };
    }
    async findByPostId(query) {
        const { postId, approvedOnly = true, page = 1, limit = 10 } = query;
        await this.ensurePostExists(postId);
        const qb = this.commentRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .leftJoinAndSelect('comment.visitor', 'visitor')
            .leftJoinAndSelect('comment.replies', 'replies', approvedOnly ? 'replies.status = :replyStatus' : undefined, approvedOnly ? { replyStatus: comment_entity_1.CommentStatus.APPROVED } : undefined)
            .leftJoinAndSelect('replies.user', 'replyUser')
            .leftJoinAndSelect('replies.visitor', 'replyVisitor')
            .where('comment.postId = :postId', { postId })
            .andWhere('comment.parentId IS NULL');
        if (approvedOnly) {
            qb.andWhere('comment.status = :status', {
                status: comment_entity_1.CommentStatus.APPROVED,
            });
        }
        qb.orderBy('comment.createdAt', 'ASC');
        const pagination = await (0, common_2.paginateQueryBuilderForAdmin)(qb, {
            page,
            limit,
        });
        return {
            ...pagination,
            items: pagination.items.map((c) => this.buildCommentForPost(c)),
        };
    }
    async remove(id) {
        const comment = await this.commentRepository.findOne({
            where: { id },
            relations: ['replies'],
        });
        if (!comment)
            throw new common_1.NotFoundException('评论不存在');
        await this.commentRepository.remove(comment);
        return true;
    }
    async ensurePostExists(postId) {
        const post = await this.postRepository.findOne({ where: { id: postId } });
        if (!post)
            throw new common_1.BadRequestException('文章不存在');
    }
    async ensureCommentExists(commentId) {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
        });
        if (!comment)
            throw new common_1.BadRequestException('父评论不存在');
    }
    buildCommentItem(comment) {
        return {
            id: comment.id,
            content: comment.content,
            status: comment.status,
            likes: comment.likes,
            postId: comment.postId,
            parentId: comment.parentId,
            user: comment.user
                ? { id: comment.user.id, username: comment.user.username }
                : null,
            visitor: comment.visitor
                ? { id: comment.visitor.id, ip: comment.visitor.ip }
                : null,
            post: comment.post
                ? { id: comment.post.id, title: comment.post.title }
                : null,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        };
    }
    buildCommentForPost(comment) {
        return {
            id: comment.id,
            content: comment.content,
            likes: comment.likes,
            status: comment.status,
            user: comment.user
                ? {
                    id: comment.user.id,
                    username: comment.user.username,
                    avatar: comment.user.avatar,
                }
                : null,
            visitor: comment.visitor
                ? {
                    id: comment.visitor.id,
                    ip: comment.visitor.ip,
                    userAgent: comment.visitor.userAgent ?? undefined,
                }
                : null,
            replies: (comment.replies || []).map((r) => ({
                id: r.id,
                content: r.content,
                likes: r.likes,
                user: r.user
                    ? { id: r.user.id, username: r.user.username, avatar: r.user.avatar }
                    : null,
                visitor: r.visitor ? { id: r.visitor.id, ip: r.visitor.ip } : null,
                createdAt: r.createdAt,
            })),
            createdAt: comment.createdAt,
        };
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(1, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(2, (0, typeorm_1.InjectRepository)(visitor_entity_1.Visitor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CommentService);
//# sourceMappingURL=comment.service.js.map