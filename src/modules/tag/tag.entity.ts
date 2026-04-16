import { Column, Entity, ManyToMany, VersionColumn } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';
import { Post } from '@/modules/post/post.entity';

export enum TagStatus {
  DISABLED = 0,
  ENABLED = 1,
}

@Entity('tags')
export class Tag extends CommonEntity {
  @Column({ type: 'varchar', length: 50, unique: true, comment: '标签名称' })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '描述' })
  description?: string;

  @VersionColumn({ comment: '版本号' })
  version: number;

  @Column({
    type: 'tinyint',
    default: TagStatus.ENABLED,
    comment: '状态：1-启用，0-禁用',
  })
  status: TagStatus;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}
