import fs from 'node:fs';
import path from 'node:path';

import { MigrationInterface, QueryRunner } from 'typeorm';

const sql = fs.readFileSync(
  path.join(__dirname, '../../database/schema.sql'),
  'utf8',
);

export class InitSchema1735000000000 implements MigrationInterface {
  name = 'InitSchema1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryRunner.query('DROP TABLE IF EXISTS `icp_info`;');
    await queryRunner.query('DROP TABLE IF EXISTS `seo_settings`;');
    await queryRunner.query('DROP TABLE IF EXISTS `friend_links`;');
    await queryRunner.query('DROP TABLE IF EXISTS `changelogs`;');
    await queryRunner.query('DROP TABLE IF EXISTS `announcements`;');
    await queryRunner.query('DROP TABLE IF EXISTS `comments`;');
    await queryRunner.query('DROP TABLE IF EXISTS `posts_tags`;');
    await queryRunner.query('DROP TABLE IF EXISTS `posts`;');
    await queryRunner.query('DROP TABLE IF EXISTS `tags`;');
    await queryRunner.query('DROP TABLE IF EXISTS `categories`;');
    await queryRunner.query('DROP TABLE IF EXISTS `visitor_logs`;');
    await queryRunner.query('DROP TABLE IF EXISTS `visitors`;');
    await queryRunner.query('DROP TABLE IF EXISTS `users`;');
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
}
