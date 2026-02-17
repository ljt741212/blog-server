import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVisitorIdColumn1776200000000 implements MigrationInterface {
  name = 'AddVisitorIdColumn1776200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnRows = (await queryRunner.query(
      `SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'visitors'
               AND COLUMN_NAME = 'visitor_id'`,
    )) as { COLUMN_NAME: string }[];

    if (!columnRows.length) {
      await queryRunner.query(
        `ALTER TABLE \`visitors\`
                 ADD \`visitor_id\` varchar(64) NULL COMMENT '访客唯一ID（前端 localStorage 中的 visitorId）'`,
      );
    }

    const indexRows = (await queryRunner.query(
      `SELECT INDEX_NAME
             FROM INFORMATION_SCHEMA.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'visitors'
               AND INDEX_NAME = 'IDX_visitors_visitor_id'`,
    )) as { INDEX_NAME: string }[];

    if (!indexRows.length) {
      await queryRunner.query(
        `ALTER TABLE \`visitors\`
                 ADD UNIQUE INDEX \`IDX_visitors_visitor_id\` (\`visitor_id\`)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`visitors\` DROP INDEX \`IDX_visitors_visitor_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` DROP COLUMN \`visitor_id\``,
    );
  }
}
