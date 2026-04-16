import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('announcements')
export class Announcement extends CommonEntity {
  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'text', comment: '内容' })
  content: string;

  @Column({
    type: 'enum',
    enum: AnnouncementStatus,
    default: AnnouncementStatus.DRAFT,
    comment: '状态',
  })
  status: AnnouncementStatus;

  @Column({
    name: 'isTop',
    type: 'boolean',
    default: false,
    comment: '是否置顶',
  })
  isTop: boolean;

  @Column({ type: 'int', default: 0, comment: '浏览量' })
  views: number;
}
