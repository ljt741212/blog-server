import { Type } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';
import { Category } from '@/modules/category/category.entity';
import { Comment } from '@/modules/comment/comment.entity';
import { Tag } from '@/modules/tag/tag.entity';
import { User } from '@/modules/user/user.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('posts')
export class Post extends CommonEntity {
  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'text', comment: '内容' })
  content: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '摘要' })
  summary: string;

  @Column({
    name: 'coverImage',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '封面图',
  })
  coverImage: string;

  @Column({
    name: 'isTop',
    type: 'boolean',
    default: false,
    comment: '是否置顶',
  })
  isTop: boolean;

  @Column({
    name: 'isRecommended',
    type: 'boolean',
    default: false,
    comment: '是否推荐',
  })
  isRecommended: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'URL别名' })
  slug: string;

  @Column({ type: 'int', default: 0, comment: '浏览量' })
  views: number;

  @Column({ type: 'int', default: 0, comment: '点赞数' })
  likes: number;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
    comment: '状态',
  })
  status: PostStatus;

  @Column({
    name: 'publishTime',
    type: 'datetime',
    nullable: true,
    comment: '发布时间',
  })
  publishTime: Date | null;

  @Type(() => User)
  @ManyToOne(() => User, (user) => user.posts, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Type(() => Category)
  @ManyToOne(() => Category, (category) => category.posts)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Type(() => Tag)
  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({
    name: 'posts_tags',
    joinColumn: { name: 'postsId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagsId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @Type(() => Comment)
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
