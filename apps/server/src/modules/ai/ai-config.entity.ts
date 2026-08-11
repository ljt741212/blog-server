import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';

export enum AiProvider {
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek',
  ANTHROPIC = 'anthropic',
}

@Entity('ai_configs')
export class AiConfig extends CommonEntity {
  @Column({ type: 'varchar', length: 50, comment: '配置名称' })
  name: string;

  @Column({ type: 'varchar', length: 20, comment: '提供商' })
  provider: AiProvider;

  @Column({ type: 'varchar', length: 50, comment: '模型标识' })
  model: string;

  @Column({
    name: 'api_key',
    type: 'varchar',
    length: 500,
    comment: 'API Key（加密存储）',
  })
  apiKey: string;

  @Column({
    name: 'base_url',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'API 地址',
  })
  baseUrl: string;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    default: 0,
    comment: '是否启用',
  })
  isActive: boolean;

  @Column({
    name: 'max_tokens',
    type: 'int',
    default: 4096,
    comment: '默认最大 token 数',
  })
  maxTokens: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0.7,
    comment: '默认温度参数',
  })
  temperature: number;
}
