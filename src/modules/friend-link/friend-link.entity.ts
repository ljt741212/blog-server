import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';

export enum FriendLinkStatus {
  DISABLED = 0,
  ENABLED = 1,
}

@Entity('friend_links')
export class FriendLink extends CommonEntity {
  @Column({ type: 'varchar', length: 255, comment: '链接名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, comment: '链接地址' })
  url: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '头像/图标URL',
  })
  avatar: string;

  @Column({ type: 'int', default: 0, comment: '排序（越大越靠前）' })
  sort: number;

  @Column({
    type: 'tinyint',
    default: FriendLinkStatus.ENABLED,
    comment: '状态：1-启用，0-禁用',
  })
  status: FriendLinkStatus;
}
