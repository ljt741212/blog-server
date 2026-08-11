import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('ai_memories')
export class AiMemory {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'user_id', type: 'int', comment: '所属用户' })
  userId: number;

  @Column({ type: 'text', comment: '记忆内容' })
  content: string;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.5,
    comment: '重要性 0-1',
  })
  importance: number;

  @Column({
    name: 'access_count',
    type: 'int',
    default: 0,
    comment: '被搜索命中的次数',
  })
  accessCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
