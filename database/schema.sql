-- 博客系统数据库表结构
-- 数据库类型: MySQL
-- 基于 TypeORM 实体定义生成
-- ============================================

-- 创建数据库（如不存在）
CREATE DATABASE IF NOT EXISTS `blog_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `blog_db`;

-- 设置字符集与外键检查
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 用户表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `nickname` varchar(50) DEFAULT NULL COMMENT '昵称',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `email` varchar(100) NOT NULL COMMENT '邮箱',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `wechat` varchar(50) DEFAULT NULL COMMENT '微信号',
  `role` tinyint(4) NOT NULL DEFAULT 0 COMMENT '角色：0-管理员，1-超级管理员',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `bio` text COMMENT '简介',
  `github_account` varchar(100) DEFAULT NULL COMMENT 'GitHub账号',
  `gender` tinyint(4) DEFAULT NULL COMMENT '性别：0-女，1-男',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_users_username` (`username`),
  UNIQUE KEY `IDX_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 2. 访客表 (visitors)
-- ============================================
CREATE TABLE IF NOT EXISTS `visitors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `visitor_id` varchar(64) DEFAULT NULL COMMENT '访客唯一ID（前端 localStorage 中的 visitorId）',
  `fingerprint` varchar(64) DEFAULT NULL COMMENT '访客指纹（旧字段，兼容用）',
  `ip` varchar(50) NULL COMMENT 'IP地址',
  `location` varchar(100) DEFAULT NULL COMMENT '位置',
  `user_agent` varchar(255) DEFAULT NULL COMMENT '用户代理',
  `last_active_at` datetime(6) DEFAULT NULL COMMENT '最后活跃时间（用于统计当前在线）',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_visitors_ip` (`ip`),
  UNIQUE KEY `IDX_visitors_visitor_id` (`visitor_id`),
  UNIQUE KEY `IDX_visitors_fingerprint` (`fingerprint`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客表';

-- ============================================
-- 3. 访客日志表 (visitor_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS `visitor_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `visitorId` int(11) DEFAULT NULL COMMENT '访客ID',
  `ip` varchar(50) NOT NULL COMMENT 'IP地址',
  `userAgent` varchar(255) DEFAULT NULL COMMENT '用户代理',
  `pageUrl` varchar(255) DEFAULT NULL COMMENT '页面URL',
  `referer` varchar(255) DEFAULT NULL COMMENT '来源',
  `visited_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '访问时间',
  PRIMARY KEY (`id`),
  KEY `FK_visitor_logs_visitor` (`visitorId`),
  CONSTRAINT `FK_visitor_logs_visitor` FOREIGN KEY (`visitorId`) REFERENCES `visitors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客日志表';

-- ============================================
-- 4. 分类表 (categories)
-- ============================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `description` text COMMENT '描述',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `version` int(11) NOT NULL DEFAULT 1 COMMENT '版本号',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类表';

-- ============================================
-- 5. 标签表 (tags)
-- ============================================
CREATE TABLE IF NOT EXISTS `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '标签名称',
  `description` varchar(500) DEFAULT NULL COMMENT '描述',
  `version` int(11) NOT NULL DEFAULT 1 COMMENT '版本号',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_tags_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='标签表';

-- ============================================
-- 6. 文章表 (posts)
-- ============================================
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `summary` varchar(500) DEFAULT NULL COMMENT '摘要',
  `coverImage` varchar(255) DEFAULT NULL COMMENT '封面图',
  `isTop` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否置顶',
  `isRecommended` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否推荐',
  `slug` varchar(100) DEFAULT NULL COMMENT 'URL别名',
  `views` int(11) NOT NULL DEFAULT 0 COMMENT '浏览量',
  `likes` int(11) NOT NULL DEFAULT 0 COMMENT '点赞数',
  `publishTime` datetime(6) DEFAULT NULL COMMENT '发布时间',
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft' COMMENT '状态',
  `user_id` int(11) DEFAULT NULL COMMENT '用户ID',
  `category_id` int(11) NOT NULL COMMENT '分类ID',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_posts_user` (`user_id`),
  KEY `IDX_posts_category` (`category_id`),
  KEY `IDX_posts_status` (`status`),
  KEY `IDX_posts_slug` (`slug`),
  CONSTRAINT `FK_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_posts_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章表';

-- ============================================
-- 7. 文章标签关联表（多对多关系）(posts_tags)
-- ============================================
CREATE TABLE IF NOT EXISTS `posts_tags` (
  `postsId` int(11) NOT NULL COMMENT '文章ID',
  `tagsId` int(11) NOT NULL COMMENT '标签ID',
  PRIMARY KEY (`postsId`, `tagsId`),
  KEY `IDX_posts_tags_tag` (`tagsId`),
  CONSTRAINT `FK_posts_tags_post` FOREIGN KEY (`postsId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_posts_tags_tag` FOREIGN KEY (`tagsId`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章标签关联表';

-- ============================================
-- 8. 评论表 (comments)
-- ============================================
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL COMMENT '评论内容',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '状态：待审核/已通过/已拒绝',
  `likes` int(11) NOT NULL DEFAULT 0 COMMENT '点赞数',
  `user_id` int(11) DEFAULT NULL COMMENT '用户ID',
  `visitor_id` int(11) DEFAULT NULL COMMENT '访客ID',
  `postId` int(11) NOT NULL COMMENT '文章ID',
  `parentId` int(11) DEFAULT NULL COMMENT '父评论ID',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_comments_user` (`user_id`),
  KEY `IDX_comments_visitor` (`visitor_id`),
  KEY `IDX_comments_post` (`postId`),
  KEY `IDX_comments_parent` (`parentId`),
  KEY `IDX_comments_status` (`status`),
  CONSTRAINT `FK_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_comments_visitor` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_comments_post` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_comments_parent` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- ============================================
-- 9. 公告表 (announcements)
-- ============================================
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft' COMMENT '状态',
  `isTop` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否置顶',
  `views` int(11) NOT NULL DEFAULT 0 COMMENT '浏览量',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_announcements_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- ============================================
-- 10. 更新日志表 (changelogs)
-- ============================================
CREATE TABLE IF NOT EXISTS `changelogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `version` varchar(50) NOT NULL COMMENT '版本号',
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `type` enum('feature','improvement','bugfix','security') NOT NULL DEFAULT 'improvement' COMMENT '类型',
  `isPublished` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否发布',
  `releaseDate` date NOT NULL COMMENT '发布日期',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_changelogs_type` (`type`),
  KEY `IDX_changelogs_published` (`isPublished`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='更新日志表';

-- ============================================
-- 11. 友情链接表 (friend_links)
-- ============================================
CREATE TABLE IF NOT EXISTS `friend_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT '链接名称',
  `url` varchar(255) NOT NULL COMMENT '链接地址',
  `description` text COMMENT '描述',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='友情链接表';

-- ============================================
-- 12. SEO设置表 (seo_settings)
-- ============================================
CREATE TABLE IF NOT EXISTS `seo_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT '标题',
  `description` text COMMENT '描述',
  `keywords` text COMMENT '关键词',
  `sitemap_url` varchar(255) DEFAULT NULL COMMENT 'Sitemap URL',
  `robots` text COMMENT 'Robots设置',
  `canonical_url` varchar(255) DEFAULT NULL COMMENT 'Canonical URL',
  `og_title` varchar(255) DEFAULT NULL COMMENT 'Open Graph标题',
  `og_description` text COMMENT 'Open Graph描述',
  `og_image` varchar(255) DEFAULT NULL COMMENT 'Open Graph图片',
  `schema_markup` text COMMENT 'Schema标记',
  `meta_author` varchar(255) DEFAULT NULL COMMENT 'Meta作者',
  `meta_viewport` varchar(255) DEFAULT NULL COMMENT 'Meta视口',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SEO设置表';

-- ============================================
-- 13. ICP备案信息表 (icp_info)
-- ============================================
CREATE TABLE IF NOT EXISTS `icp_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `icp_number` varchar(255) DEFAULT NULL COMMENT 'ICP备案号',
  `icp_url` varchar(255) DEFAULT NULL COMMENT 'ICP备案URL',
  `website_name` varchar(255) DEFAULT NULL COMMENT '网站名称',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ICP备案信息表';

-- ============================================
-- 14. 访客留言表 (guest_messages)
-- ============================================
CREATE TABLE IF NOT EXISTS `guest_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL COMMENT '留言内容',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '状态：待审核/已通过/已拒绝',
  `nickname` varchar(50) DEFAULT NULL COMMENT '留言者昵称',
  `email` varchar(100) DEFAULT NULL COMMENT '留言者邮箱',
  `user_id` int(11) DEFAULT NULL COMMENT '用户ID（登录用户留言时）',
  `visitor_id` int(11) DEFAULT NULL COMMENT '访客ID（游客留言时）',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `IDX_guest_messages_user` (`user_id`),
  KEY `IDX_guest_messages_visitor` (`visitor_id`),
  KEY `IDX_guest_messages_status` (`status`),
  CONSTRAINT `FK_guest_messages_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `FK_guest_messages_visitor` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客留言表';

-- ============================================
-- 15. 站点配置表 (site_config)
-- ============================================
CREATE TABLE IF NOT EXISTS `site_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `background_image` varchar(500) DEFAULT NULL COMMENT '背景图URL',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站点配置表';

-- ============================================
-- 16. 邮箱验证码表 (email_codes)
-- ============================================
CREATE TABLE IF NOT EXISTS `email_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL COMMENT '邮箱地址',
  `code` varchar(10) NOT NULL COMMENT '验证码',
  `used` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0-未使用, 1-已使用',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮箱验证码表';

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;
