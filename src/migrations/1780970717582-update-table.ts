import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFriendLinkFields1780970717582 implements MigrationInterface {
  name = 'AddFriendLinkFields1780970717582';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` ADD \`avatar\` varchar(500) NULL COMMENT '头像/图标URL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` ADD \`sort\` int NOT NULL COMMENT '排序（越大越靠前）' DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` ADD \`status\` tinyint NOT NULL COMMENT '状态：1-启用，0-禁用' DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` DROP COLUMN \`status\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` DROP COLUMN \`sort\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` DROP COLUMN \`avatar\``,
    );
  }
}
