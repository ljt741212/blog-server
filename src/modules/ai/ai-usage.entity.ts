import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AiAction {
  CONTINUE_WRITE = 'continue_write',
  POLISH = 'polish',
  SUMMARY = 'summary',
  TITLE = 'title',
  CHAT = 'chat',
}

@Entity('ai_usage_logs')
export class AiUsage extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'config_id', type: 'int', comment: '关联的模型配置' })
  configId: number;

  @Column({ type: 'varchar', length: 50, comment: '使用的模型名' })
  model: string;

  @Column({
    name: 'prompt_tokens',
    type: 'int',
    default: 0,
    comment: '输入 token',
  })
  promptTokens: number;

  @Column({
    name: 'completion_tokens',
    type: 'int',
    default: 0,
    comment: '输出 token',
  })
  completionTokens: number;

  @Column({
    name: 'latency_ms',
    type: 'int',
    default: 0,
    comment: '响应延迟(ms)',
  })
  latencyMs: number;

  @Column({ type: 'varchar', length: 30, comment: '动作' })
  action: AiAction;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;
}
