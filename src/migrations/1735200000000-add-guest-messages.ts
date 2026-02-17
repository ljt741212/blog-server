import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestMessages1735200000000 implements MigrationInterface {
  name = 'AddGuestMessages1735200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`guest_messages\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`content\` text NOT NULL COMMENT '留言内容',
        \`status\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '状态：待审核/已通过/已拒绝',
        \`nickname\` varchar(50) DEFAULT NULL COMMENT '留言者昵称',
        \`email\` varchar(100) DEFAULT NULL COMMENT '留言者邮箱',
        \`user_id\` int(11) DEFAULT NULL COMMENT '用户ID（登录用户留言时）',
        \`visitor_id\` int(11) DEFAULT NULL COMMENT '访客ID（游客留言时）',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
        PRIMARY KEY (\`id\`),
        KEY \`IDX_guest_messages_user\` (\`user_id\`),
        KEY \`IDX_guest_messages_visitor\` (\`visitor_id\`),
        KEY \`IDX_guest_messages_status\` (\`status\`),
        CONSTRAINT \`FK_guest_messages_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT \`FK_guest_messages_visitor\` FOREIGN KEY (\`visitor_id\`) REFERENCES \`visitors\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客留言表'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `guest_messages`');
  }
}
