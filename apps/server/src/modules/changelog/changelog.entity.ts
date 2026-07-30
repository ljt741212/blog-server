import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';

export enum ChangelogType {
  FEATURE = 'feature',
  IMPROVEMENT = 'improvement',
  BUGFIX = 'bugfix',
  SECURITY = 'security',
}

@Entity('changelogs')
export class Changelog extends CommonEntity {
  @Column({ type: 'varchar', length: 50, comment: '版本号' })
  version: string;

  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'text', comment: '内容' })
  content: string;

  @Column({
    type: 'enum',
    enum: ChangelogType,
    default: ChangelogType.IMPROVEMENT,
    comment: '类型',
  })
  type: ChangelogType;

  @Column({
    name: 'isPublished',
    type: 'boolean',
    default: false,
    comment: '是否发布',
  })
  isPublished: boolean;

  @Column({ name: 'releaseDate', type: 'date', comment: '发布日期' })
  releaseDate: Date;
}
