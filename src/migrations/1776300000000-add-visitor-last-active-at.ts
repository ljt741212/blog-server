import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVisitorLastActiveAt1776300000000 implements MigrationInterface {
  name = 'AddVisitorLastActiveAt1776300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnRows = (await queryRunner.query(
      `SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'visitors'
               AND COLUMN_NAME = 'last_active_at'`,
    )) as { COLUMN_NAME: string }[];

    if (!columnRows.length) {
      await queryRunner.query(
        `ALTER TABLE \`visitors\`
                 ADD \`last_active_at\` datetime(6) NULL COMMENT '最后活跃时间（用于统计当前在线）'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`visitors\` DROP COLUMN \`last_active_at\``,
    );
  }
}
