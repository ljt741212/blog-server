import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiTables1767600000000 implements MigrationInterface {
  name = 'AddAiTables1767600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`ai_configs\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`name\` varchar(50) NOT NULL COMMENT '配置名称',
        \`provider\` varchar(20) NOT NULL COMMENT '提供商',
        \`model\` varchar(50) NOT NULL COMMENT '模型标识',
        \`api_key\` varchar(500) NOT NULL COMMENT 'API Key（加密存储）',
        \`base_url\` varchar(255) DEFAULT NULL COMMENT 'API 地址',
        \`is_active\` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否启用',
        \`max_tokens\` int(11) NOT NULL DEFAULT 4096 COMMENT '默认最大 token 数',
        \`temperature\` decimal(3,2) NOT NULL DEFAULT 0.70 COMMENT '默认温度参数',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型配置表'
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`ai_usage_logs\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`config_id\` int(11) NOT NULL COMMENT '关联的模型配置',
        \`model\` varchar(50) NOT NULL COMMENT '使用的模型名',
        \`prompt_tokens\` int(11) NOT NULL DEFAULT 0 COMMENT '输入 token',
        \`completion_tokens\` int(11) NOT NULL DEFAULT 0 COMMENT '输出 token',
        \`latency_ms\` int(11) NOT NULL DEFAULT 0 COMMENT '响应延迟(ms)',
        \`action\` varchar(30) NOT NULL COMMENT '动作',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        PRIMARY KEY (\`id\`),
        KEY \`IDX_usage_config\` (\`config_id\`),
        KEY \`IDX_usage_created_at\` (\`created_at\`),
        CONSTRAINT \`FK_usage_config\` FOREIGN KEY (\`config_id\`) REFERENCES \`ai_configs\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI用量日志表'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `ai_usage_logs`');
    await queryRunner.query('DROP TABLE IF EXISTS `ai_configs`');
  }
}
