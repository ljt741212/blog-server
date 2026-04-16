import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable1770980406427 implements MigrationInterface {
  name = 'UpdateTable1770980406427';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_2954e32cc045541aeb70ccdf18\` ON \`visitors\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_visitors_visitor_id\` ON \`visitors\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_visitors_fingerprint\` ON \`visitors\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`nickname\` varchar(50) NULL COMMENT '昵称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`phone\` varchar(20) NULL COMMENT '手机号'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`wechat\` varchar(50) NULL COMMENT '微信号'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`visitor_id\` \`visitor_id\` varchar(64) NULL COMMENT '访客唯一ID（前端 localStorage 中的 visitorId）'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` ADD UNIQUE INDEX \`IDX_37ae698fcd524f2ecdd29f83bf\` (\`visitor_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`fingerprint\` \`fingerprint\` varchar(64) NULL COMMENT '访客唯一ID（浏览器指纹，如 localStorage 中的 visitorId）'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` ADD UNIQUE INDEX \`IDX_a7910eb5f7936b71500fec8053\` (\`fingerprint\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`ip\` \`ip\` varchar(50) NULL COMMENT 'IP地址'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`ip\` \`ip\` varchar(50) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL COMMENT 'IP地址'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` DROP INDEX \`IDX_a7910eb5f7936b71500fec8053\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`fingerprint\` \`fingerprint\` varchar(64) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NULL COMMENT '访客指纹（旧字段，兼容用）'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` DROP INDEX \`IDX_37ae698fcd524f2ecdd29f83bf\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`visitor_id\` \`visitor_id\` varchar(64) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NULL COMMENT '访客唯一ID（前端 localStorage 中的 visitorId）'`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`wechat\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phone\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`nickname\``);
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_visitors_fingerprint\` ON \`visitors\` (\`fingerprint\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_visitors_visitor_id\` ON \`visitors\` (\`visitor_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_2954e32cc045541aeb70ccdf18\` ON \`visitors\` (\`ip\`)`,
    );
  }
}
