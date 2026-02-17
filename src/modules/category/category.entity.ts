import { Column, Entity, OneToMany, VersionColumn } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';
import { Post } from '@/modules/post/post.entity';

export enum CategoryStatus {
  DISABLED = 0,
  ENABLED = 1,
}

@Entity('categories')
export class Category extends CommonEntity {
  @Column({ type: 'varchar', length: 50, unique: true, comment: '分类名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({
    type: 'tinyint',
    default: CategoryStatus.ENABLED,
    comment: '状态：1-启用，0-禁用',
  })
  status: CategoryStatus;

  @VersionColumn({ comment: '版本号' })
  version: number;

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];
}
