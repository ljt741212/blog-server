import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';
import { Post } from '@/modules/post/post.entity';
import { User } from '@/modules/user/user.entity';
import { Visitor } from '@/modules/visitor/visitor.entity';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('comments')
export class Comment extends CommonEntity {
  @Column({ type: 'text', comment: '评论内容' })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PENDING,
    comment: '状态：待审核/已通过/已拒绝',
  })
  status: CommentStatus;

  @Column({ type: 'int', default: 0, comment: '点赞数' })
  likes: number;

  @Column({ name: 'user_id', type: 'int', nullable: true, comment: '用户ID' })
  userId: number;

  @Column({
    name: 'visitor_id',
    type: 'int',
    nullable: true,
    comment: '访客ID',
  })
  visitorId: number;

  @Column({ name: 'postId', type: 'int', comment: '文章ID' })
  postId: number;

  @Column({
    name: 'parentId',
    type: 'int',
    nullable: true,
    comment: '父评论ID',
  })
  parentId: number;

  @Type(() => User)
  @ManyToOne(() => User, (user) => user.comments, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Type(() => Visitor)
  @ManyToOne(() => Visitor, (visitor) => visitor.comments, {
    nullable: true,
  })
  @JoinColumn({ name: 'visitor_id' })
  visitor: Visitor;

  @Type(() => Post)
  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Type(() => Comment)
  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @Type(() => Comment)
  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];
}
