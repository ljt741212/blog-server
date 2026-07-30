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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../../../../../src/modules/category/category.entity");
const comment_entity_1 = require("../../../../../src/modules/comment/comment.entity");
const tag_entity_1 = require("../../../../../src/modules/tag/tag.entity");
const auth_util_1 = require("../../../../../src/shared/auth/auth.util");
const post_entity_1 = require("./post.entity");
let PostService = class PostService {
    postRepository;
    categoryRepository;
    tagRepository;
    commentRepository;
    authUtil;
    constructor(postRepository, categoryRepository, tagRepository, commentRepository, authUtil) {
        this.postRepository = postRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.commentRepository = commentRepository;
        this.authUtil = authUtil;
    }
    async paginateForAdmin(query) {
        const { current = 1, pageSize = 10 } = query || {};
        const countQb = this.postRepository.createQueryBuilder('post');
        if (query.searchValue) {
            countQb.andWhere('(post.title LIKE :kw OR post.summary LIKE :kw)', {
                kw: `%${query.searchValue}%`,
            });
        }
        if (query.status !== undefined) {
            countQb.andWhere('post.status = :status', { status: query.status });
        }
        if (query.categoryId) {
            countQb.andWhere('post.category_id = :categoryId', {
                categoryId: query.categoryId,
            });
        }
        if (query.tagId) {
            countQb.innerJoin('post.tags', 'tagFilter', 'tagFilter.id = :tagId', {
                tagId: query.tagId,
            });
        }
        const total = await countQb.getCount();
        const qb = this.postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('post.tags', 'tag')
            .leftJoinAndSelect('post.user', 'user');
        if (query.searchValue) {
            qb.andWhere('(post.title LIKE :kw OR post.summary LIKE :kw)', {
                kw: `%${query.searchValue}%`,
            });
        }
        if (query.status !== undefined) {
            qb.andWhere('post.status = :status', { status: query.status });
        }
        if (query.categoryId) {
            qb.andWhere('post.category_id = :categoryId', {
                categoryId: query.categoryId,
            });
        }
        if (query.tagId) {
            qb.innerJoin('post.tags', 'tagFilter', 'tagFilter.id = :tagId', {
                tagId: query.tagId,
            });
        }
        qb.orderBy('post.publishTime', 'DESC').addOrderBy('post.createdAt', 'DESC');
        qb.skip((current - 1) * pageSize).take(pageSize);
        const items = await qb.getMany();
        return {
            items: items.map((p) => this.buildAdminPost(p)),
            meta: { total, current, pageSize },
        };
    }
    async findAll(query) {
        const { current = 1, pageSize = 10 } = query || {};
        const countQb = this.postRepository
            .createQueryBuilder('post')
            .where('post.status = :status', { status: post_entity_1.PostStatus.PUBLISHED });
        if (query?.searchValue) {
            countQb.andWhere('(post.title LIKE :kw OR post.summary LIKE :kw)', {
                kw: `%${query.searchValue}%`,
            });
        }
        if (query?.categoryId) {
            countQb.andWhere('post.category_id = :categoryId', {
                categoryId: query.categoryId,
            });
        }
        if (query?.tagId) {
            countQb.innerJoin('post.tags', 'tagFilter', 'tagFilter.id = :tagId', {
                tagId: query.tagId,
            });
        }
        const total = await countQb.getCount();
        const qb = this.postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('post.tags', 'tag')
            .leftJoinAndSelect('post.user', 'user')
            .where('post.status = :status', { status: post_entity_1.PostStatus.PUBLISHED });
        if (query?.searchValue) {
            qb.andWhere('(post.title LIKE :kw OR post.summary LIKE :kw)', {
                kw: `%${query.searchValue}%`,
            });
        }
        if (query?.categoryId) {
            qb.andWhere('post.category_id = :categoryId', {
                categoryId: query.categoryId,
            });
        }
        if (query?.tagId) {
            qb.innerJoin('post.tags', 'tagFilter', 'tagFilter.id = :tagId', {
                tagId: query.tagId,
            });
        }
        qb.orderBy('post.isTop', 'DESC').addOrderBy('post.publishTime', 'DESC');
        qb.skip((current - 1) * pageSize).take(pageSize);
        const items = await qb.getMany();
        return {
            items: items.map((p) => this.buildPublicPost(p)),
            meta: { total, current, pageSize },
        };
    }
    async findOne(id) {
        const post = await this.postRepository.findOne({
            where: { id },
            relations: ['category', 'tags', 'user'],
        });
        if (!post)
            throw new common_1.NotFoundException('文章不存在');
        return post;
    }
    async findDetail(id) {
        const post = await this.findOne(id);
        return this.buildPublicPost(post);
    }
    async findPublicDetail(id, authorization) {
        const post = await this.findOne(id);
        if (post.status !== post_entity_1.PostStatus.PUBLISHED) {
            try {
                this.authUtil.extractUserId(authorization);
            }
            catch {
                throw new common_1.NotFoundException('文章不存在');
            }
        }
        return this.buildPublicPost(post);
    }
    async create(dto, authorization) {
        const { title, content, summary, coverImage, status, categoryId, tagIds, publishTime, } = dto;
        const userId = this.authUtil.extractUserId(authorization);
        await this.ensureCategoryExists(categoryId);
        const tags = tagIds?.length
            ? await this.tagRepository.find({ where: { id: (0, typeorm_2.In)(tagIds) } })
            : [];
        const entity = this.postRepository.create({
            title,
            content,
            summary,
            coverImage,
            status: status ?? post_entity_1.PostStatus.DRAFT,
            publishTime: publishTime ?? (status === post_entity_1.PostStatus.PUBLISHED ? new Date() : null),
            user: { id: userId },
            category: { id: categoryId },
            tags,
        });
        const saved = await this.postRepository.save(entity);
        return this.findDetail(saved.id);
    }
    async update(id, dto) {
        const post = await this.findOne(id);
        const { title, content, summary, coverImage, status, categoryId, tagIds, publishTime, } = dto;
        if (typeof title !== 'undefined')
            post.title = title;
        if (typeof content !== 'undefined')
            post.content = content;
        if (typeof summary !== 'undefined')
            post.summary = summary;
        if (typeof coverImage !== 'undefined')
            post.coverImage = coverImage;
        if (typeof status !== 'undefined') {
            post.status = status;
            if (status === post_entity_1.PostStatus.PUBLISHED && !post.publishTime) {
                post.publishTime = new Date();
            }
        }
        if (typeof publishTime !== 'undefined') {
            post.publishTime = publishTime;
        }
        if (typeof categoryId !== 'undefined') {
            await this.ensureCategoryExists(categoryId);
            post.category = { id: categoryId };
        }
        if (typeof tagIds !== 'undefined') {
            post.tags = tagIds.length
                ? await this.tagRepository.find({ where: { id: (0, typeorm_2.In)(tagIds) } })
                : [];
        }
        await this.postRepository.save(post);
        return this.findDetail(post.id);
    }
    async save(dto, authorization) {
        if (dto.id)
            return this.update(dto.id, dto);
        return this.create(dto, authorization);
    }
    async remove(id) {
        const post = await this.findOne(id);
        await this.commentRepository
            .createQueryBuilder()
            .delete()
            .where('parentId IN (SELECT id FROM (SELECT id FROM comments WHERE postId = :postId) AS tmp)', { postId: id })
            .execute();
        await this.commentRepository.delete({ postId: id });
        await this.postRepository.remove(post);
        return true;
    }
    async updateStatus(id, status) {
        if (typeof status === 'undefined') {
            throw new common_1.BadRequestException('状态不能为空');
        }
        const post = await this.findOne(id);
        post.status = status;
        if (status === post_entity_1.PostStatus.PUBLISHED && !post.publishTime) {
            post.publishTime = new Date();
        }
        await this.postRepository.save(post);
        return true;
    }
    async incrementViews(id) {
        const result = await this.postRepository.increment({ id }, 'views', 1);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('文章不存在');
        }
        return true;
    }
    async incrementLikes(id) {
        const result = await this.postRepository.increment({ id }, 'likes', 1);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('文章不存在');
        }
        return true;
    }
    async updateTop(id, isTop) {
        const post = await this.findOne(id);
        post.isTop = isTop;
        await this.postRepository.save(post);
        return true;
    }
    async ensureCategoryExists(categoryId) {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
        });
        if (!category)
            throw new common_1.BadRequestException('分类不存在');
    }
    buildPublicPost(post) {
        return {
            id: String(post.id),
            title: post.title,
            content: post.content,
            summary: post.summary,
            coverImage: post.coverImage,
            publishTime: post.publishTime,
            views: post.views ?? 0,
            likes: post.likes ?? 0,
            category: post.category
                ? {
                    id: post.category.id,
                    name: post.category.name,
                    description: post.category.description,
                }
                : null,
            tags: (post.tags || []).map((t) => ({
                id: t.id,
                name: t.name,
                description: t.description,
            })),
            author: post.user
                ? {
                    id: post.user.id,
                    username: post.user.username,
                    nickname: post.user.nickname,
                    avatar: post.user.avatar,
                    bio: post.user.bio,
                }
                : null,
            status: post.status,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        };
    }
    buildAdminPost(post) {
        return {
            id: String(post.id),
            title: post.title,
            summary: post.summary,
            coverImage: post.coverImage,
            status: post.status,
            isTop: post.isTop,
            categoryId: post.category?.id,
            category: post.category?.name,
            tagIds: post.tags?.map((t) => t.id) ?? [],
            tags: (post.tags || []).map((t) => t.name).join(', '),
            author: post.user?.username,
            publishTime: post.publishTime,
            views: post.views ?? 0,
            likes: post.likes ?? 0,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        };
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(3, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        auth_util_1.AuthUtil])
], PostService);
//# sourceMappingURL=post.service.js.map