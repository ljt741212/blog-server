import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiConversations1768100000000 implements MigrationInterface {
  name = 'AddAiConversations1768100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`ai_conversations\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`title\` varchar(200) DEFAULT NULL COMMENT 'AI自动生成的标题',
        \`user_id\` int(11) NOT NULL COMMENT '所属用户',
        \`messages\` json DEFAULT NULL COMMENT '完整消息历史',
        \`checkpoint\` text DEFAULT NULL COMMENT 'LangGraph checkpoint 序列化数据',
        \`checkpoint_metadata\` json DEFAULT NULL COMMENT 'Checkpoint metadata',
        \`checkpoint_config\` json DEFAULT NULL COMMENT 'Checkpoint config',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        KEY \`IDX_conversations_user\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI对话记录表'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`ai_conversations\``);
  }
}
