import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';

@Entity('site_config')
export class SiteConfig extends CommonEntity {
  @Column({
    name: 'background_image',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '背景图URL',
  })
  backgroundImage: string;

  @Column({
    name: 'site_started_at',
    type: 'datetime',
    nullable: true,
    comment: '网站开始运行时间',
  })
  siteStartedAt: Date | null;

  @Column({
    name: 'footer_text',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '页脚一句话',
  })
  footerText: string;
}
