import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';

@Entity('friend_links')
export class FriendLink extends CommonEntity {
  @Column({ type: 'varchar', length: 255, comment: '链接名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, comment: '链接地址' })
  url: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;
}
