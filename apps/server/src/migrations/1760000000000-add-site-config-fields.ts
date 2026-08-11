import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSiteConfigFields1760000000000 implements MigrationInterface {
  name = 'AddSiteConfigFields1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`site_config\` ADD \`site_started_at\` datetime NULL COMMENT '网站开始运行时间'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`site_config\` ADD \`footer_text\` varchar(500) NULL COMMENT '页脚一句话'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`site_config\` DROP COLUMN \`footer_text\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`site_config\` DROP COLUMN \`site_started_at\``,
    );
  }
}
