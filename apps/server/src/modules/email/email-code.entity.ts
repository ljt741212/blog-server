import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('email_codes')
export class EmailCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '邮箱地址' })
  email: string;

  @Column({ type: 'varchar', length: 10, comment: '验证码' })
  code: string;

  @Column({ type: 'tinyint', default: 0, comment: '0-未使用, 1-已使用' })
  used: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;
}
