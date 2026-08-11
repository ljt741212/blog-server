import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginateQueryBuilderForAdmin } from '@/common';
import { Post } from '@/modules/post/post.entity';
import { Visitor } from '@/modules/visitor/visitor.entity';

import {
  CommentAdminPageQueryDto,
  CommentsByPostQueryDto,
  CreateCommentDto,
} from './comment.dto';
import { Comment, CommentStatus } from './comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Visitor)
    private readonly visitorRepository: Repository<Visitor>,
  ) {}

  async create(dto: CreateCommentDto): Promise<Comment> {
    const { content, postId, parentId, userId, visitorId: visitorIdStr } = dto;

    await this.ensurePostExists(postId);
    if (parentId) {
      await this.ensureCommentExists(parentId);
    }
    if (!userId && !visitorIdStr) {
      throw new BadRequestException('请提供 userId 或 visitorId');
    }

    let visitorIdNum: number | undefined;
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
      status: CommentStatus.PENDING,
    });
    const saved = await this.commentRepository.save(comment);
    return this.commentRepository.findOneOrFail({
      where: { id: saved.id },
      relations: ['user', 'visitor', 'post'],
    });
  }

  async updateStatus(id: number, status: CommentStatus): Promise<boolean> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('评论不存在');
    comment.status = status;
    await this.commentRepository.save(comment);
    return true;
  }

  async paginateForAdmin(query: CommentAdminPageQueryDto) {
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
    const page = await paginateQueryBuilderForAdmin(qb, query);
    return {
      ...page,
      items: page.items.map((c) => this.buildCommentItem(c)),
    };
  }

  async findByPostId(query: CommentsByPostQueryDto) {
    const { postId, approvedOnly = true, page = 1, limit = 10 } = query;
    await this.ensurePostExists(postId);

    const qb = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.visitor', 'visitor')
      .leftJoinAndSelect(
        'comment.replies',
        'replies',
        approvedOnly ? 'replies.status = :replyStatus' : undefined,
        approvedOnly ? { replyStatus: CommentStatus.APPROVED } : undefined,
      )
      .leftJoinAndSelect('replies.user', 'replyUser')
      .leftJoinAndSelect('replies.visitor', 'replyVisitor')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentId IS NULL');

    if (approvedOnly) {
      qb.andWhere('comment.status = :status', {
        status: CommentStatus.APPROVED,
      });
    }

    qb.orderBy('comment.createdAt', 'ASC');

    const pagination = await paginateQueryBuilderForAdmin(qb, {
      page,
      limit,
    });
    return {
      ...pagination,
      items: pagination.items.map((c) => this.buildCommentForPost(c)),
    };
  }

  async remove(id: number): Promise<boolean> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['replies'],
    });
    if (!comment) throw new NotFoundException('评论不存在');
    await this.commentRepository.remove(comment);
    return true;
  }

  private async ensurePostExists(postId: number): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new BadRequestException('文章不存在');
  }

  private async ensureCommentExists(commentId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new BadRequestException('父评论不存在');
  }

  private buildCommentItem(comment: Comment) {
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

  private buildCommentForPost(comment: Comment) {
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
}
