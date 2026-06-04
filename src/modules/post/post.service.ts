import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Category } from '@/modules/category/category.entity';
import { Comment } from '@/modules/comment/comment.entity';
import { Tag } from '@/modules/tag/tag.entity';
import { AuthUtil } from '@/shared/auth/auth.util';

import { PostPageQueryDto, SavePostDto } from './post.dto';
import { Post, PostStatus } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly authUtil: AuthUtil,
  ) {}

  async paginateForAdmin(query: PostPageQueryDto) {
    const { current = 1, pageSize = 10 } = query || {};

    // Count query: no LEFT JOIN to avoid cartesian-product inflate
    const countQb = this.postRepository.createQueryBuilder('post');

    if (query.searchValue) {
      countQb.andWhere('(post.title LIKE :kw OR post.summary LIKE :kw)', {
        kw: `%${query.searchValue}%`,
      });
    }
    if (typeof query.status !== 'undefined') {
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

    // Data query: with JOINs for eager relations
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
    if (typeof query.status !== 'undefined') {
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
      items: items.map((p: Post) => this.buildAdminPost(p)),
      meta: { total, current, pageSize },
    };
  }

  async findAll(query?: PostPageQueryDto) {
    const { current = 1, pageSize = 10 } = query || {};

    // Count query: no LEFT JOIN to avoid cartesian-product inflate
    const countQb = this.postRepository
      .createQueryBuilder('post')
      .where('post.status = :status', { status: PostStatus.PUBLISHED });

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

    // Data query: with JOINs for eager relations
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.status = :status', { status: PostStatus.PUBLISHED });

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
      items: items.map((p: Post) => this.buildPublicPost(p)),
      meta: { total, current, pageSize },
    };
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'user'],
    });
    if (!post) throw new NotFoundException('文章不存在');
    return post;
  }

  async findDetail(id: number) {
    const post = await this.findOne(id);
    return this.buildPublicPost(post);
  }

  async findPublicDetail(id: number, authorization?: string) {
    const post = await this.findOne(id);

    if (post.status !== PostStatus.PUBLISHED) {
      try {
        this.authUtil.extractUserId(authorization);
      } catch {
        throw new NotFoundException('文章不存在');
      }
    }

    return this.buildPublicPost(post);
  }

  async create(dto: SavePostDto, authorization?: string) {
    const {
      title,
      content,
      summary,
      coverImage,
      status,
      categoryId,
      tagIds,
      publishTime,
    } = dto;

    const userId = this.authUtil.extractUserId(authorization);

    await this.ensureCategoryExists(categoryId);
    const tags = tagIds?.length
      ? await this.tagRepository.find({ where: { id: In(tagIds) } })
      : [];

    const entity = this.postRepository.create({
      title,
      content,
      summary,
      coverImage,
      status: status ?? PostStatus.DRAFT,
      publishTime:
        publishTime ?? (status === PostStatus.PUBLISHED ? new Date() : null),
      user: { id: userId } as Partial<Post['user']>,
      category: { id: categoryId } as Partial<Post['category']>,
      tags,
    });

    const saved = await this.postRepository.save(entity);
    return this.findDetail(saved.id);
  }

  async update(id: number, dto: SavePostDto) {
    const post = await this.findOne(id);

    const {
      title,
      content,
      summary,
      coverImage,
      status,
      categoryId,
      tagIds,
      publishTime,
    } = dto;

    if (typeof title !== 'undefined') post.title = title;
    if (typeof content !== 'undefined') post.content = content;
    if (typeof summary !== 'undefined') post.summary = summary;
    if (typeof coverImage !== 'undefined') post.coverImage = coverImage;
    if (typeof status !== 'undefined') {
      post.status = status;
      if (status === PostStatus.PUBLISHED && !post.publishTime) {
        post.publishTime = new Date();
      }
    }

    if (typeof publishTime !== 'undefined') {
      post.publishTime = publishTime;
    }

    if (typeof categoryId !== 'undefined') {
      await this.ensureCategoryExists(categoryId);
      post.category = { id: categoryId } as Category;
    }

    if (typeof tagIds !== 'undefined') {
      post.tags = tagIds.length
        ? await this.tagRepository.find({ where: { id: In(tagIds) } })
        : [];
    }

    await this.postRepository.save(post);
    return this.findDetail(post.id);
  }

  async save(dto: SavePostDto, authorization?: string) {
    if (dto.id) return this.update(dto.id, dto);
    return this.create(dto, authorization);
  }

  async remove(id: number) {
    const post = await this.findOne(id);

    // MySQL 不允许 DELETE 子查询引用同一张表，用派生表绕过
    await this.commentRepository
      .createQueryBuilder()
      .delete()
      .where(
        'parentId IN (SELECT id FROM (SELECT id FROM comments WHERE postId = :postId) AS tmp)',
        { postId: id },
      )
      .execute();
    await this.commentRepository.delete({ postId: id });

    await this.postRepository.remove(post);
    return true;
  }

  async updateStatus(id: number, status: PostStatus) {
    if (typeof status === 'undefined') {
      throw new BadRequestException('状态不能为空');
    }
    const post = await this.findOne(id);
    post.status = status;
    if (status === PostStatus.PUBLISHED && !post.publishTime) {
      post.publishTime = new Date();
    }
    await this.postRepository.save(post);
    return true;
  }

  async incrementViews(id: number) {
    const result = await this.postRepository.increment({ id }, 'views', 1);
    if (result.affected === 0) {
      throw new NotFoundException('文章不存在');
    }
    return true;
  }

  async incrementLikes(id: number) {
    const result = await this.postRepository.increment({ id }, 'likes', 1);
    if (result.affected === 0) {
      throw new NotFoundException('文章不存在');
    }
    return true;
  }

  async updateTop(id: number, isTop: boolean) {
    const post = await this.findOne(id);
    post.isTop = isTop;
    await this.postRepository.save(post);
    return true;
  }

  private async ensureCategoryExists(categoryId: number) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new BadRequestException('分类不存在');
  }

  private buildPublicPost(post: Post) {
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

  private buildAdminPost(post: Post) {
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
}
