# 数据库文档

本文档详细说明了博客后端系统的数据库设计和数据模型。

## 目录

- [数据库概述](#数据库概述)
- [表结构设计](#表结构设计)
- [关系说明](#关系说明)
- [索引设计](#索引设计)
- [数据字典](#数据字典)
- [迁移脚本](#迁移脚本)

## 数据库概述

### 基本信息

- **数据库类型**: MySQL 8.0+
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **存储引擎**: InnoDB

### 设计原则

1. **规范化设计**: 遵循数据库设计第三范式，减少数据冗余
2. **软删除**: 使用 `deletedAt` 字段实现软删除，保留历史数据
3. **时间戳**: 统一使用 `createdAt` 和 `updatedAt` 记录时间
4. **外键约束**: 使用外键保证数据完整性
5. **索引优化**: 为常用查询字段添加索引

## 表结构设计

### 1. User (用户表)

**表名**: `user`

**描述**: 存储系统用户信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户 ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(255) | NOT NULL | 密码（bcrypt 加密） |
| email | VARCHAR(100) | NULL | 邮箱 |
| avatar | VARCHAR(255) | NULL | 头像 URL |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deletedAt | DATETIME | NULL | 删除时间（软删除） |

**索引**:
- PRIMARY KEY (`id`)
- UNIQUE KEY (`username`)
- INDEX (`email`)
- INDEX (`deletedAt`)

**SQL 创建语句**:

```sql
CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NULL,
  `avatar` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_deleted_at` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 2. Post (文章表)

**表名**: `post`

**描述**: 存储博客文章信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 文章 ID |
| title | VARCHAR(200) | NOT NULL | 文章标题 |
| content | TEXT | NOT NULL | 文章内容 |
| summary | VARCHAR(500) | NULL | 文章摘要 |
| cover | VARCHAR(255) | NULL | 封面图片 URL |
| views | INT | DEFAULT 0 | 浏览量 |
| likes | INT | DEFAULT 0 | 点赞数 |
| isTop | BOOLEAN | DEFAULT FALSE | 是否置顶 |
| status | ENUM | DEFAULT 'draft' | 状态：draft(草稿), published(已发布) |
| categoryId | INT | NULL, FOREIGN KEY | 分类 ID |
| authorId | INT | NOT NULL, FOREIGN KEY | 作者 ID |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deletedAt | DATETIME | NULL | 删除时间（软删除） |

**索引**:
- PRIMARY KEY (`id`)
- INDEX (`categoryId`)
- INDEX (`authorId`)
- INDEX (`status`)
- INDEX (`isTop`)
- INDEX (`createdAt`)
- INDEX (`deletedAt`)

**SQL 创建语句**:

```sql
CREATE TABLE `post` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `summary` VARCHAR(500) NULL,
  `cover` VARCHAR(255) NULL,
  `views` INT NOT NULL DEFAULT 0,
  `likes` INT NOT NULL DEFAULT 0,
  `isTop` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `categoryId` INT NULL,
  `authorId` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`categoryId`),
  KEY `idx_author_id` (`authorId`),
  KEY `idx_status` (`status`),
  KEY `idx_is_top` (`isTop`),
  KEY `idx_created_at` (`createdAt`),
  KEY `idx_deleted_at` (`deletedAt`),
  CONSTRAINT `fk_post_category` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_post_author` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 3. Category (分类表)

**表名**: `category`

**描述**: 存储文章分类信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 分类 ID |
| name | VARCHAR(50) | NOT NULL | 分类名称 |
| description | VARCHAR(255) | NULL | 分类描述 |
| status | ENUM | DEFAULT 'active' | 状态：active(启用), inactive(禁用) |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deletedAt | DATETIME | NULL | 删除时间（软删除） |

**索引**:
- PRIMARY KEY (`id`)
- INDEX (`status`)
- INDEX (`deletedAt`)

**SQL 创建语句**:

```sql
CREATE TABLE `category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_deleted_at` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 4. Tag (标签表)

**表名**: `tag`

**描述**: 存储文章标签信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 标签 ID |
| name | VARCHAR(50) | NOT NULL | 标签名称 |
| color | VARCHAR(7) | NULL | 标签颜色（十六进制） |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deletedAt | DATETIME | NULL | 删除时间（软删除） |

**索引**:
- PRIMARY KEY (`id`)
- INDEX (`deletedAt`)

**SQL 创建语句**:

```sql
CREATE TABLE `tag` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `color` VARCHAR(7) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_deleted_at` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 5. PostTag (文章标签关联表)

**表名**: `post_tag`

**描述**: 文章和标签的多对多关联表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| postId | INT | PRIMARY KEY, FOREIGN KEY | 文章 ID |
| tagId | INT | PRIMARY KEY, FOREIGN KEY | 标签 ID |

**索引**:
- PRIMARY KEY (`postId`, `tagId`)
- INDEX (`tagId`)

**SQL 创建语句**:

```sql
CREATE TABLE `post_tag` (
  `postId` INT NOT NULL,
  `tagId` INT NOT NULL,
  PRIMARY KEY (`postId`, `tagId`),
  KEY `idx_tag_id` (`tagId`),
  CONSTRAINT `fk_post_tag_post` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_tag_tag` FOREIGN KEY (`tagId`) REFERENCES `tag` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 6. Comment (评论表)

**表名**: `comment`

**描述**: 存储文章评论信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 评论 ID |
| content | TEXT | NOT NULL | 评论内容 |
| status | ENUM | DEFAULT 'pending' | 状态：pending(待审核), approved(已通过), rejected(已拒绝) |
| postId | INT | NOT NULL, FOREIGN KEY | 文章 ID |
| parentId | INT | NULL, FOREIGN KEY | 父评论 ID（用于回复） |
| visitorId | VARCHAR(100) | NULL | 访客 ID |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deletedAt | DATETIME | NULL | 删除时间（软删除） |

**索引**:
- PRIMARY KEY (`id`)
- INDEX (`postId`)
- INDEX (`parentId`)
- INDEX (`status`)
- INDEX (`visitorId`)
- INDEX (`createdAt`)
- INDEX (`deletedAt`)

**SQL 创建语句**:

```sql
CREATE TABLE `comment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `content` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `postId` INT NOT NULL,
  `parentId` INT NULL,
  `visitorId` VARCHAR(100) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`postId`),
  KEY `idx_parent_id` (`parentId`),
  KEY `idx_status` (`status`),
  KEY `idx_visitor_id` (`visitorId`),
  KEY `idx_created_at` (`createdAt`),
  KEY `idx_deleted_at` (`deletedAt`),
  CONSTRAINT `fk_comment_post` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parentId`) REFERENCES `comment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 7. Visitor (访客表)

**表名**: `visitor`

**描述**: 存储访客信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | VARCHAR(100) | PRIMARY KEY | 访客 ID |
| fingerprint | VARCHAR(255) | NULL | 浏览器指纹 |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- PRIMARY KEY (`id`)
- INDEX (`createdAt`)

**SQL 创建语句**:

```sql
CREATE TABLE `visitor` (
  `id` VARCHAR(100) NOT NULL,
  `fingerprint` VARCHAR(255) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 8. VisitorLog (访客访问日志表)

**表名**: `visitor_log`

**描述**: 存储访客访问记录

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 日志 ID |
| visitorId | VARCHAR(100) | NOT NULL, FOREIGN KEY | 访客 ID |
| url | VARCHAR(500) | NULL | 访问 URL |
| referrer | VARCHAR(500) | NULL | 来源页面 |
| userAgent | VARCHAR(500) | NULL | 用户代理 |
| ip | VARCHAR(50) | NULL | IP 地址 |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- PRIMARY KEY (`id`)
- INDEX (`visitorId`)
- INDEX (`createdAt`)
- INDEX (`url`)

**SQL 创建语句**:

```sql
CREATE TABLE `visitor_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `visitorId` VARCHAR(100) NOT NULL,
  `url` VARCHAR(500) NULL,
  `referrer` VARCHAR(500) NULL,
  `userAgent` VARCHAR(500) NULL,
  `ip` VARCHAR(50) NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_visitor_id` (`visitorId`),
  KEY `idx_created_at` (`createdAt`),
  KEY `idx_url` (`url`(255)),
  CONSTRAINT `fk_visitor_log_visitor` FOREIGN KEY (`visitorId`) REFERENCES `visitor` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### 9. FriendLink (友链表)

**表名**: `friend_link`

**描述**: 存储友情链接信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 友链 ID |
| name | VARCHAR(100) | NOT NULL | 友链名称 |
| url | VARCHAR(500) | NOT NULL | 友链 URL |
| logo | VARCHAR(255) | NULL | Logo URL |
| description | VARCHAR(255) | NULL | 描述 |
| status | ENUM | DEFAULT 'active' | 状态：active(启用), inactive(禁用) |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deletedAt | DATETIME | NULL | 删除时间（软删除） |

**索引**:
- PRIMARY KEY (`id`)
- INDEX (`status`)
- INDEX (`deletedAt`)

---

### 10. GuestMessage (留言表)

**表名**: `guest_message`

**描述**: 存储访客留言信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 留言 ID |
| content | TEXT | NOT NULL | 留言内容 |
| visitorId | VARCHAR(100) | NULL | 访客 ID |
| nickname | VARCHAR(50) | NULL | 昵称 |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deletedAt | DATETIME | NULL | 删除时间（软删除） |

**索引**:
- PRIMARY KEY (`id`)
- INDEX (`visitorId`)
- INDEX (`createdAt`)
- INDEX (`deletedAt`)

---

### 11. Changelog (更新日志表)

**表名**: `changelog`

**描述**: 存储系统更新日志

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 日志 ID |
| version | VARCHAR(50) | NOT NULL | 版本号 |
| content | TEXT | NOT NULL | 更新内容 |
| releaseDate | DATE | NULL | 发布日期 |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |
| deletedAt | DATETIME | NULL | 删除时间（软删除） |

**索引**:
- PRIMARY KEY (`id`)
- INDEX (`version`)
- INDEX (`releaseDate`)
- INDEX (`deletedAt`)

---

### 12. Setting (设置表)

**表名**: `setting`

**描述**: 存储系统设置

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 设置 ID |
| key | VARCHAR(100) | UNIQUE, NOT NULL | 设置键 |
| value | TEXT | NULL | 设置值 |
| description | VARCHAR(255) | NULL | 描述 |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- PRIMARY KEY (`id`)
- UNIQUE KEY (`key`)

---

### 13. SeoSetting (SEO 设置表)

**表名**: `seo_setting`

**描述**: 存储 SEO 相关设置

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 设置 ID |
| title | VARCHAR(200) | NULL | 网站标题 |
| keywords | VARCHAR(500) | NULL | 关键词 |
| description | VARCHAR(500) | NULL | 描述 |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- PRIMARY KEY (`id`)

---

### 14. IcpInfo (ICP 信息表)

**表名**: `icp_info`

**描述**: 存储 ICP 备案信息

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 信息 ID |
| icpNumber | VARCHAR(50) | NULL | ICP 备案号 |
| createdAt | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updatedAt | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- PRIMARY KEY (`id`)

---

## 关系说明

### ER 图

```
User (1) ──< (N) Post
Category (1) ──< (N) Post
Post (N) ──< (N) Tag [通过 PostTag]
Post (1) ──< (N) Comment
Comment (1) ──< (N) Comment [自关联，parentId]
Visitor (1) ──< (N) VisitorLog
Visitor (1) ──< (N) Comment [可选]
Visitor (1) ──< (N) GuestMessage [可选]
```

### 关系详情

1. **User ↔ Post**: 一对多
   - 一个用户可写多篇文章
   - 删除用户时，文章如何处理取决于业务需求（RESTRICT/SET NULL/CASCADE）

2. **Category ↔ Post**: 一对多
   - 一个分类包含多篇文章
   - 删除分类时，文章的分类设置为 NULL（SET NULL）

3. **Post ↔ Tag**: 多对多
   - 通过 `post_tag` 中间表关联
   - 删除文章或标签时，关联记录自动删除（CASCADE）

4. **Post ↔ Comment**: 一对多
   - 一篇文章可有多个评论
   - 删除文章时，评论自动删除（CASCADE）

5. **Comment ↔ Comment**: 自关联（一对多）
   - 评论可回复评论，形成树形结构
   - 删除父评论时，子评论自动删除（CASCADE）

6. **Visitor ↔ VisitorLog**: 一对多
   - 一个访客可有多次访问记录
   - 删除访客时，访问记录自动删除（CASCADE）

## 索引设计

### 索引策略

1. **主键索引**: 所有表都有主键索引
2. **外键索引**: 所有外键字段都建立索引
3. **查询字段索引**: 常用查询字段建立索引
4. **软删除索引**: `deletedAt` 字段建立索引
5. **时间字段索引**: `createdAt` 字段建立索引（用于排序和筛选）

### 索引优化建议

1. **复合索引**: 对于多字段查询，考虑建立复合索引
2. **覆盖索引**: 对于频繁查询的字段组合，建立覆盖索引
3. **索引监控**: 定期检查索引使用情况，删除未使用的索引

## 数据字典

### 枚举值说明

#### Post.status
- `draft`: 草稿
- `published`: 已发布

#### Category.status / FriendLink.status
- `active`: 启用
- `inactive`: 禁用

#### Comment.status
- `pending`: 待审核
- `approved`: 已通过
- `rejected`: 已拒绝

## 迁移脚本

数据库迁移文件位于 `src/migrations/` 目录，使用 TypeORM 管理。

### 运行迁移

```bash
npm run migration:run
```

### 创建迁移

```bash
npm run migration:create ./src/migrations/your-migration-name
```

### 生成迁移

```bash
npm run migration:generate ./src/migrations/update-table
```

## 数据维护

### 清理软删除数据

定期清理已删除的数据（可选）：

```sql
-- 清理 30 天前删除的文章
DELETE FROM post WHERE deletedAt IS NOT NULL AND deletedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### 数据备份

参考 [部署文档](./DEPLOYMENT.md) 中的备份策略。

### 性能优化

1. **定期分析表**: `ANALYZE TABLE table_name;`
2. **优化表**: `OPTIMIZE TABLE table_name;`
3. **重建索引**: 根据实际情况重建索引
4. **分区表**: 对于大表（如 `visitor_log`），考虑使用分区表
