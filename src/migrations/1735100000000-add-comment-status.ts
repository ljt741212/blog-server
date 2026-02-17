import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentStatus1735100000000 implements MigrationInterface {
  name = 'AddCommentStatus1735100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`comments\`
      ADD COLUMN \`status\` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '状态：待审核/已通过/已拒绝' AFTER \`content\`
    `);
    await queryRunner.query(
      'CREATE INDEX `IDX_comments_status` ON `comments` (`status`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `IDX_comments_status` ON `comments`');
    await queryRunner.query('ALTER TABLE `comments` DROP COLUMN `status`');
  }
}
