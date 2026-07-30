import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Visitor } from './visitor.entity';

@Entity('visitor_logs')
export class VisitorLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Visitor, (visitor) => visitor.logs, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  visitor: Visitor;

  @Column({ name: 'visitorId', type: 'int', nullable: true, comment: '访客ID' })
  visitorId: number;

  @Column({ type: 'varchar', length: 50, comment: 'IP地址' })
  ip: string;

  @Column({
    name: 'userAgent',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '用户代理',
  })
  userAgent: string;

  @Column({
    name: 'pageUrl',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '页面URL',
  })
  pageUrl: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '来源',
  })
  referer: string;

  @CreateDateColumn({ name: 'visited_at', comment: '访问时间' })
  visitedAt: Date;
}
