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
}
