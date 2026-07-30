import { Type } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';
import { User } from '@/modules/user/user.entity';
import { Visitor } from '@/modules/visitor/visitor.entity';

export enum GuestMessageStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('guest_messages')
export class GuestMessage extends CommonEntity {
  @Column({ type: 'text', comment: '留言内容' })
  content: string;

  @Column({
    type: 'enum',
    enum: GuestMessageStatus,
    default: GuestMessageStatus.PENDING,
    comment: '状态：待审核/已通过/已拒绝',
  })
  status: GuestMessageStatus;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '留言者昵称',
  })
  nickname: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '留言者邮箱',
  })
  email: string | null;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: true,
    comment: '用户ID（登录用户留言时）',
  })
  userId: number | null;

  @Column({
    name: 'visitor_id',
    type: 'int',
    nullable: true,
    comment: '访客ID（游客留言时）',
  })
  visitorId: number | null;

  @Type(() => User)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Type(() => Visitor)
  @ManyToOne(() => Visitor, { nullable: true })
  @JoinColumn({ name: 'visitor_id' })
  visitor: Visitor | null;
}
