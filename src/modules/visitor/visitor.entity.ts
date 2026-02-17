import { Type } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';
import { Comment } from '@/modules/comment/comment.entity';

import { VisitorLog } from './visitor-log.entity';

@Entity('visitors')
export class Visitor extends CommonEntity {
  @Column({
    name: 'visitor_id',
    type: 'varchar',
    length: 64,
    unique: true,
    nullable: true,
    comment: '访客唯一ID（前端 localStorage 中的 visitorId）',
  })
  visitorId: string | null;

  @Column({
    type: 'varchar',
    length: 64,
    unique: true,
    nullable: true,
    comment: '访客唯一ID（浏览器指纹，如 localStorage 中的 visitorId）',
  })
  fingerprint: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: 'IP地址' })
  ip: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '位置' })
  location: string | null;

  @Column({
    name: 'user_agent',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '用户代理',
  })
  userAgent: string;

  @Type(() => Comment)
  @OneToMany(() => Comment, (comment) => comment.visitor)
  comments: Comment[];

  @OneToMany(() => VisitorLog, (log) => log.visitor)
  logs: VisitorLog[];
}
