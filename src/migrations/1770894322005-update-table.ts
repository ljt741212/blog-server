import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTable1770894322005 implements MigrationInterface {
  name = 'UpdateTable1770894322005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`visitor_logs\` DROP FOREIGN KEY \`FK_visitor_logs_visitor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_comments_parent\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_comments_post\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_comments_user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_comments_visitor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_posts_category\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_posts_user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_posts_visitor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` DROP FOREIGN KEY \`FK_guest_messages_user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` DROP FOREIGN KEY \`FK_guest_messages_visitor\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` DROP FOREIGN KEY \`FK_posts_tags_post\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` DROP FOREIGN KEY \`FK_posts_tags_tag\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_categories_name\` ON \`categories\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_tags_name\` ON \`tags\``);
    await queryRunner.query(`DROP INDEX \`IDX_visitors_ip\` ON \`visitors\``);
    await queryRunner.query(`DROP INDEX \`IDX_comments_user\` ON \`comments\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_comments_visitor\` ON \`comments\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_comments_post\` ON \`comments\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_comments_parent\` ON \`comments\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_comments_status\` ON \`comments\``,
    );
    await queryRunner.query(`DROP INDEX \`IDX_posts_user\` ON \`posts\``);
    await queryRunner.query(`DROP INDEX \`IDX_posts_visitor\` ON \`posts\``);
    await queryRunner.query(`DROP INDEX \`IDX_posts_category\` ON \`posts\``);
    await queryRunner.query(`DROP INDEX \`IDX_posts_status\` ON \`posts\``);
    await queryRunner.query(`DROP INDEX \`IDX_posts_slug\` ON \`posts\``);
    await queryRunner.query(`DROP INDEX \`IDX_users_username\` ON \`users\``);
    await queryRunner.query(`DROP INDEX \`IDX_users_email\` ON \`users\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_guest_messages_user\` ON \`guest_messages\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_guest_messages_visitor\` ON \`guest_messages\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_guest_messages_status\` ON \`guest_messages\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_announcements_status\` ON \`announcements\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_changelogs_type\` ON \`changelogs\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_changelogs_published\` ON \`changelogs\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_posts_tags_tag\` ON \`posts_tags\``,
    );
    await queryRunner.query(`ALTER TABLE \`categories\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`tags\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`visitor_logs\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`visitors\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`comments\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`posts\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`users\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`icp_info\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`guest_messages\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`seo_settings\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`friend_links\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`announcements\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`changelogs\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`posts_tags\` COMMENT ''`);
    await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`visitor_id\``);
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD \`publishTime\` datetime NULL COMMENT '发布时间'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`name\` \`name\` varchar(50) NOT NULL COMMENT '分类名称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD UNIQUE INDEX \`IDX_8b0be371d28245da6e4f4b6187\` (\`name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`version\` \`version\` int NOT NULL COMMENT '版本号'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tags\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tags\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tags\` CHANGE \`name\` \`name\` varchar(50) NOT NULL COMMENT '标签名称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tags\` ADD UNIQUE INDEX \`IDX_d90243459a697eadb8ad56e909\` (\`name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tags\` CHANGE \`version\` \`version\` int NOT NULL COMMENT '版本号'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`ip\` \`ip\` varchar(50) NOT NULL COMMENT 'IP地址'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` ADD UNIQUE INDEX \`IDX_2954e32cc045541aeb70ccdf18\` (\`ip\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`isTop\` \`isTop\` tinyint NOT NULL COMMENT '是否置顶' DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`isRecommended\` \`isRecommended\` tinyint NOT NULL COMMENT '是否推荐' DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`user_id\` \`user_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`category_id\` \`category_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`username\` \`username\` varchar(50) NOT NULL COMMENT '用户名'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(100) NOT NULL COMMENT '密码' DEFAULT '123456'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(100) NOT NULL COMMENT '邮箱'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`role\` tinyint NOT NULL COMMENT '角色：0-管理员，1-超级管理员' DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`gender\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`gender\` tinyint NULL COMMENT '性别：0-女，1-男'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`icp_info\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`icp_info\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`seo_settings\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`seo_settings\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`announcements\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`announcements\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`announcements\` CHANGE \`isTop\` \`isTop\` tinyint NOT NULL COMMENT '是否置顶' DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`changelogs\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`changelogs\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`changelogs\` CHANGE \`isPublished\` \`isPublished\` tinyint NOT NULL COMMENT '是否发布' DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` CHANGE \`postsId\` \`postsId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` CHANGE \`tagsId\` \`tagsId\` int NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_43eb26a55c240c71497c76f281\` ON \`posts_tags\` (\`postsId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_56be2a177c90e0adf8444f2e36\` ON \`posts_tags\` (\`tagsId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitor_logs\` ADD CONSTRAINT \`FK_c60e51d7b549325bf8ae4997ca0\` FOREIGN KEY (\`visitorId\`) REFERENCES \`visitors\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_4c675567d2a58f0b07cef09c13d\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_7097753b3385051ac0616b05c36\` FOREIGN KEY (\`visitor_id\`) REFERENCES \`visitors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_e44ddaaa6d058cb4092f83ad61f\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_8770bd9030a3d13c5f79a7d2e81\` FOREIGN KEY (\`parentId\`) REFERENCES \`comments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_c4f9a7bd77b489e711277ee5986\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_852f266adc5d67c40405c887b49\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` ADD CONSTRAINT \`FK_a262bb5c7bada921bf9e3457377\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` ADD CONSTRAINT \`FK_91d53ffd9ce23447f057f25192d\` FOREIGN KEY (\`visitor_id\`) REFERENCES \`visitors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` ADD CONSTRAINT \`FK_43eb26a55c240c71497c76f2812\` FOREIGN KEY (\`postsId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` ADD CONSTRAINT \`FK_56be2a177c90e0adf8444f2e36c\` FOREIGN KEY (\`tagsId\`) REFERENCES \`tags\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` DROP FOREIGN KEY \`FK_56be2a177c90e0adf8444f2e36c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` DROP FOREIGN KEY \`FK_43eb26a55c240c71497c76f2812\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` DROP FOREIGN KEY \`FK_91d53ffd9ce23447f057f25192d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` DROP FOREIGN KEY \`FK_a262bb5c7bada921bf9e3457377\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_852f266adc5d67c40405c887b49\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_c4f9a7bd77b489e711277ee5986\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_8770bd9030a3d13c5f79a7d2e81\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_e44ddaaa6d058cb4092f83ad61f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_7097753b3385051ac0616b05c36\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_4c675567d2a58f0b07cef09c13d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitor_logs\` DROP FOREIGN KEY \`FK_c60e51d7b549325bf8ae4997ca0\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_56be2a177c90e0adf8444f2e36\` ON \`posts_tags\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_43eb26a55c240c71497c76f281\` ON \`posts_tags\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` CHANGE \`tagsId\` \`tagsId\` int NOT NULL COMMENT '标签ID'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` CHANGE \`postsId\` \`postsId\` int NOT NULL COMMENT '文章ID'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`changelogs\` CHANGE \`isPublished\` \`isPublished\` tinyint(1) NOT NULL COMMENT '是否发布' DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`changelogs\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`changelogs\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`announcements\` CHANGE \`isTop\` \`isTop\` tinyint(1) NOT NULL COMMENT '是否置顶' DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`announcements\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`announcements\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`seo_settings\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`seo_settings\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`icp_info\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`icp_info\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`gender\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`gender\` enum CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" ('male', 'female') NULL COMMENT '性别'`,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`role\` enum CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" ('super_admin', 'admin') NOT NULL COMMENT '角色' DEFAULT 'admin'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(100) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL COMMENT '邮箱'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(100) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL COMMENT '密码'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`username\` \`username\` varchar(50) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL COMMENT '用户名'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`category_id\` \`category_id\` int NOT NULL COMMENT '分类ID'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`user_id\` \`user_id\` int NULL COMMENT '用户ID'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`isRecommended\` \`isRecommended\` tinyint(1) NOT NULL COMMENT '是否推荐' DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`isTop\` \`isTop\` tinyint(1) NOT NULL COMMENT '是否置顶' DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` DROP INDEX \`IDX_2954e32cc045541aeb70ccdf18\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`ip\` \`ip\` varchar(50) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL COMMENT 'IP地址'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitors\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tags\` CHANGE \`version\` \`version\` int NOT NULL COMMENT '版本号' DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tags\` DROP INDEX \`IDX_d90243459a697eadb8ad56e909\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tags\` CHANGE \`name\` \`name\` varchar(50) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL COMMENT '标签名称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tags\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tags\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`version\` \`version\` int NOT NULL COMMENT '版本号' DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP INDEX \`IDX_8b0be371d28245da6e4f4b6187\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`name\` \`name\` varchar(50) CHARACTER SET "utf8mb4" COLLATE "utf8mb4_general_ci" NOT NULL COMMENT '分类名称'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` DROP COLUMN \`publishTime\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD \`visitor_id\` int NULL COMMENT '访客ID'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` COMMENT '文章标签关联表'`,
    );
    await queryRunner.query(`ALTER TABLE \`changelogs\` COMMENT '更新日志表'`);
    await queryRunner.query(`ALTER TABLE \`announcements\` COMMENT '公告表'`);
    await queryRunner.query(
      `ALTER TABLE \`friend_links\` COMMENT '友情链接表'`,
    );
    await queryRunner.query(`ALTER TABLE \`seo_settings\` COMMENT 'SEO设置表'`);
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` COMMENT '访客留言表'`,
    );
    await queryRunner.query(`ALTER TABLE \`icp_info\` COMMENT 'ICP备案信息表'`);
    await queryRunner.query(`ALTER TABLE \`users\` COMMENT '用户表'`);
    await queryRunner.query(`ALTER TABLE \`posts\` COMMENT '文章表'`);
    await queryRunner.query(`ALTER TABLE \`comments\` COMMENT '评论表'`);
    await queryRunner.query(`ALTER TABLE \`visitors\` COMMENT '访客表'`);
    await queryRunner.query(
      `ALTER TABLE \`visitor_logs\` COMMENT '访客日志表'`,
    );
    await queryRunner.query(`ALTER TABLE \`tags\` COMMENT '标签表'`);
    await queryRunner.query(`ALTER TABLE \`categories\` COMMENT '分类表'`);
    await queryRunner.query(
      `CREATE INDEX \`IDX_posts_tags_tag\` ON \`posts_tags\` (\`tagsId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_changelogs_published\` ON \`changelogs\` (\`isPublished\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_changelogs_type\` ON \`changelogs\` (\`type\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_announcements_status\` ON \`announcements\` (\`status\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_guest_messages_status\` ON \`guest_messages\` (\`status\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_guest_messages_visitor\` ON \`guest_messages\` (\`visitor_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_guest_messages_user\` ON \`guest_messages\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_users_email\` ON \`users\` (\`email\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_users_username\` ON \`users\` (\`username\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_posts_slug\` ON \`posts\` (\`slug\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_posts_status\` ON \`posts\` (\`status\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_posts_category\` ON \`posts\` (\`category_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_posts_visitor\` ON \`posts\` (\`visitor_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_posts_user\` ON \`posts\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_comments_status\` ON \`comments\` (\`status\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_comments_parent\` ON \`comments\` (\`parentId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_comments_post\` ON \`comments\` (\`postId\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_comments_visitor\` ON \`comments\` (\`visitor_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_comments_user\` ON \`comments\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_visitors_ip\` ON \`visitors\` (\`ip\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_tags_name\` ON \`tags\` (\`name\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_categories_name\` ON \`categories\` (\`name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` ADD CONSTRAINT \`FK_posts_tags_tag\` FOREIGN KEY (\`tagsId\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts_tags\` ADD CONSTRAINT \`FK_posts_tags_post\` FOREIGN KEY (\`postsId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` ADD CONSTRAINT \`FK_guest_messages_visitor\` FOREIGN KEY (\`visitor_id\`) REFERENCES \`visitors\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`guest_messages\` ADD CONSTRAINT \`FK_guest_messages_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_posts_visitor\` FOREIGN KEY (\`visitor_id\`) REFERENCES \`visitors\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_posts_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_posts_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_comments_visitor\` FOREIGN KEY (\`visitor_id\`) REFERENCES \`visitors\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_comments_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_comments_post\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_comments_parent\` FOREIGN KEY (\`parentId\`) REFERENCES \`comments\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`visitor_logs\` ADD CONSTRAINT \`FK_visitor_logs_visitor\` FOREIGN KEY (\`visitorId\`) REFERENCES \`visitors\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }
}
