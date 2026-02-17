import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVisitorFingerprintColumn1776200000001 implements MigrationInterface {
  name = 'AddVisitorFingerprintColumn1776200000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnRows = (await queryRunner.query(
      `SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'visitors'
               AND COLUMN_NAME = 'fingerprint'`,
    )) as { COLUMN_NAME: string }[];

    if (!columnRows.length) {
      await queryRunner.query(
        `ALTER TABLE \`visitors\`
                 ADD \`fingerprint\` varchar(64) NULL COMMENT '访客指纹（旧字段，兼容用）'`,
      );
    }

    const indexRows = (await queryRunner.query(
      `SELECT INDEX_NAME
             FROM INFORMATION_SCHEMA.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'visitors'
               AND INDEX_NAME = 'IDX_visitors_fingerprint'`,
    )) as { INDEX_NAME: string }[];

    if (!indexRows.length) {
      await queryRunner.query(
        `ALTER TABLE \`visitors\`
                 ADD UNIQUE INDEX \`IDX_visitors_fingerprint\` (\`fingerprint\`)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`visitors\` DROP INDEX \`IDX_visitors_fingerprint\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` DROP COLUMN \`fingerprint\``,
    );
  }
}
