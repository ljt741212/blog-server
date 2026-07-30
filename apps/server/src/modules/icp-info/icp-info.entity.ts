import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';

@Entity('icp_info')
export class IcpInfo extends CommonEntity {
  @Column({
    name: 'icp_number',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ICP备案号',
  })
  icpNumber: string;

  @Column({
    name: 'icp_url',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ICP备案URL',
  })
  icpUrl: string;

  @Column({
    name: 'website_name',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '网站名称',
  })
  websiteName: string;
}
