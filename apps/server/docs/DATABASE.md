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
- **ORM**: TypeORM

### 设计原则

1. **规范化设计**: 遵循数据库设计第三范式，减少数据冗余
2. **公共基类**: 所有业务表继承 `CommonEntity`，包含 `id` (自增主键)、`created_at`、`updated_at`
3. **外键约束**: 使用外键保证数据完整性
4. **索引优化**: 为常用查询字段添加索引
5. **时间戳**: 统一使用 `created_at` 和 `updated_at`，蛇形命名

> **注意**: 本项目不使用软删除，删除操作直接从数据库移除记录。

## 表结构设计

### 1. users（用户表）

**描述**: 存储系统用户信息

| 字段名         | 类型         | 约束                        | 说明                         |
| -------------- | ------------ | --------------------------- | ---------------------------- |
| id             | INT          | PRIMARY KEY, AUTO_INCREMENT | 用户 ID                      |
| username       | VARCHAR(50)  | UNIQUE, NOT NULL            | 用户名                       |
| nickname       | VARCHAR(50)  | NULL                        | 昵称                         |
| password       | VARCHAR(100) | NOT NULL                    | 密码（bcrypt 加密）          |
| email          | VARCHAR(100) | UNIQUE, NOT NULL            | 邮箱                         |
| phone          | VARCHAR(20)  | NULL                        | 手机号                       |
| wechat         | VARCHAR(50)  | NULL                        | 微信号                       |
| role           | TINYINT      | NOT NULL, DEFAULT 0         | 角色：0-管理员，1-超级管理员 |
| avatar         | VARCHAR(255) | NULL                        | 头像 URL                     |
| bio            | TEXT         | NULL                        | 简介                         |
| github_account | VARCHAR(100) | NULL                        | GitHub 账号                  |
| gender         | TINYINT      | NULL                        | 性别：0-女，1-男             |
| created_at     | DATETIME(6)  | NOT NULL                    | 创建时间                     |
| updated_at     | DATETIME(6)  | NOT NULL                    | 更新时间                     |

**索引**:

- PRIMARY KEY (`id`)
- UNIQUE KEY (`username`)
- UNIQUE KEY (`email`)

---

### 2. visitors（访客表）

**描述**: 存储访客信息

| 字段名         | 类型         | 约束                        | 说明                             |
| -------------- | ------------ | --------------------------- | -------------------------------- |
| id             | INT          | PRIMARY KEY, AUTO_INCREMENT | 访客 ID                          |
| visitor_id     | VARCHAR(64)  | UNIQUE, NULL                | 前端 localStorage 中的 visitorId |
| fingerprint    | VARCHAR(64)  | UNIQUE, NULL                | 浏览器指纹                       |
| ip             | VARCHAR(50)  | NULL                        | IP 地址                          |
| location       | VARCHAR(100) | NULL                        | 地理位置                         |
| user_agent     | VARCHAR(255) | NULL                        | 用户代理                         |
| last_active_at | DATETIME(6)  | NULL                        | 最后活跃时间（统计在线用）       |
| created_at     | DATETIME(6)  | NOT NULL                    | 创建时间                         |
| updated_at     | DATETIME(6)  | NOT NULL                    | 更新时间                         |

---

### 3. visitor_logs（访客日志表）

**描述**: 存储访客访问记录

| 字段名     | 类型         | 约束                        | 说明         |
| ---------- | ------------ | --------------------------- | ------------ |
| id         | INT          | PRIMARY KEY, AUTO_INCREMENT | 日志 ID      |
| visitorId  | INT          | NULL, FK→visitors.id        | 访客 ID      |
| ip         | VARCHAR(50)  | NOT NULL                    | IP 地址      |
| userAgent  | VARCHAR(255) | NULL                        | 用户代理     |
| pageUrl    | VARCHAR(255) | NULL                        | 访问页面 URL |
| referer    | VARCHAR(255) | NULL                        | 来源页面     |
| visited_at | DATETIME(6)  | NOT NULL                    | 访问时间     |

**索引**:

- PRIMARY KEY (`id`)
- KEY (`visitorId`)

**外键**: `visitorId` → `visitors(id)` ON DELETE SET NULL

---

### 4. categories（分类表）

**描述**: 存储文章分类信息

| 字段名      | 类型        | 约束                        | 说明                 |
| ----------- | ----------- | --------------------------- | -------------------- |
| id          | INT         | PRIMARY KEY, AUTO_INCREMENT | 分类 ID              |
| name        | VARCHAR(50) | UNIQUE, NOT NULL            | 分类名称             |
| description | TEXT        | NULL                        | 分类描述             |
| status      | TINYINT     | NOT NULL, DEFAULT 1         | 状态：1-启用，0-禁用 |
| version     | INT         | NOT NULL, DEFAULT 1         | 版本号（乐观锁）     |
| created_at  | DATETIME(6) | NOT NULL                    | 创建时间             |
| updated_at  | DATETIME(6) | NOT NULL                    | 更新时间             |

**索引**:

- PRIMARY KEY (`id`)
- UNIQUE KEY (`name`)

---

### 5. tags（标签表）

**描述**: 存储文章标签信息

| 字段名      | 类型         | 约束                        | 说明                 |
| ----------- | ------------ | --------------------------- | -------------------- |
| id          | INT          | PRIMARY KEY, AUTO_INCREMENT | 标签 ID              |
| name        | VARCHAR(50)  | UNIQUE, NOT NULL            | 标签名称             |
| description | VARCHAR(500) | NULL                        | 标签描述             |
| version     | INT          | NOT NULL, DEFAULT 1         | 版本号（乐观锁）     |
| status      | TINYINT      | NOT NULL, DEFAULT 1         | 状态：1-启用，0-禁用 |
| created_at  | DATETIME(6)  | NOT NULL                    | 创建时间             |
| updated_at  | DATETIME(6)  | NOT NULL                    | 更新时间             |

**索引**:

- PRIMARY KEY (`id`)
- UNIQUE KEY (`name`)

---

### 6. posts（文章表）

**描述**: 存储博客文章信息

| 字段名        | 类型         | 约束                        | 说明                           |
| ------------- | ------------ | --------------------------- | ------------------------------ |
| id            | INT          | PRIMARY KEY, AUTO_INCREMENT | 文章 ID                        |
| title         | VARCHAR(200) | NOT NULL                    | 文章标题                       |
| content       | TEXT         | NOT NULL                    | 文章内容                       |
| summary       | VARCHAR(500) | NULL                        | 文章摘要                       |
| coverImage    | VARCHAR(255) | NULL                        | 封面图片 URL                   |
| isTop         | TINYINT(1)   | NOT NULL, DEFAULT 0         | 是否置顶                       |
| isRecommended | TINYINT(1)   | NOT NULL, DEFAULT 0         | 是否推荐                       |
| slug          | VARCHAR(100) | NULL                        | URL 别名                       |
| views         | INT          | NOT NULL, DEFAULT 0         | 浏览量                         |
| likes         | INT          | NOT NULL, DEFAULT 0         | 点赞数                         |
| publishTime   | DATETIME(6)  | NULL                        | 发布时间                       |
| status        | ENUM         | NOT NULL, DEFAULT 'draft'   | 状态：draft/published/archived |
| user_id       | INT          | NULL, FK→users.id           | 作者 ID                        |
| category_id   | INT          | NOT NULL, FK→categories.id  | 分类 ID                        |
| created_at    | DATETIME(6)  | NOT NULL                    | 创建时间                       |
| updated_at    | DATETIME(6)  | NOT NULL                    | 更新时间                       |

**索引**:

- PRIMARY KEY (`id`)
- KEY (`user_id`)
- KEY (`category_id`)
- KEY (`status`)
- KEY (`slug`)

**外键**:

- `user_id` → `users(id)` ON DELETE SET NULL
- `category_id` → `categories(id)` ON DELETE RESTRICT

---

### 7. posts_tags（文章标签关联表）

**描述**: 文章和标签的多对多关联表

| 字段名  | 类型 | 约束                     | 说明    |
| ------- | ---- | ------------------------ | ------- |
| postsId | INT  | PRIMARY KEY, FK→posts.id | 文章 ID |
| tagsId  | INT  | PRIMARY KEY, FK→tags.id  | 标签 ID |

**索引**:

- PRIMARY KEY (`postsId`, `tagsId`)
- KEY (`tagsId`)

**外键**:

- `postsId` → `posts(id)` ON DELETE CASCADE
- `tagsId` → `tags(id)` ON DELETE CASCADE

---

### 8. comments（评论表）

**描述**: 存储文章评论信息

| 字段名     | 类型        | 约束                        | 说明                            |
| ---------- | ----------- | --------------------------- | ------------------------------- |
| id         | INT         | PRIMARY KEY, AUTO_INCREMENT | 评论 ID                         |
| content    | TEXT        | NOT NULL                    | 评论内容                        |
| status     | ENUM        | NOT NULL, DEFAULT 'pending' | 状态：pending/approved/rejected |
| likes      | INT         | NOT NULL, DEFAULT 0         | 点赞数                          |
| user_id    | INT         | NULL, FK→users.id           | 评论用户 ID                     |
| visitor_id | INT         | NULL, FK→visitors.id        | 评论访客 ID                     |
| postId     | INT         | NOT NULL, FK→posts.id       | 所属文章 ID                     |
| parentId   | INT         | NULL, FK→comments.id        | 父评论 ID（回复）               |
| created_at | DATETIME(6) | NOT NULL                    | 创建时间                        |
| updated_at | DATETIME(6) | NOT NULL                    | 更新时间                        |

**索引**:

- PRIMARY KEY (`id`)
- KEY (`user_id`)
- KEY (`visitor_id`)
- KEY (`postId`)
- KEY (`parentId`)
- KEY (`status`)

**外键**:

- `user_id` → `users(id)` ON DELETE SET NULL
- `visitor_id` → `visitors(id)` ON DELETE SET NULL
- `postId` → `posts(id)` ON DELETE CASCADE
- `parentId` → `comments(id)` ON DELETE SET NULL

---

### 9. announcements（公告表）

**描述**: 存储系统公告信息

| 字段名     | 类型         | 约束                        | 说明                           |
| ---------- | ------------ | --------------------------- | ------------------------------ |
| id         | INT          | PRIMARY KEY, AUTO_INCREMENT | 公告 ID                        |
| title      | VARCHAR(200) | NOT NULL                    | 公告标题                       |
| content    | TEXT         | NOT NULL                    | 公告内容                       |
| status     | ENUM         | NOT NULL, DEFAULT 'draft'   | 状态：draft/published/archived |
| isTop      | TINYINT(1)   | NOT NULL, DEFAULT 0         | 是否置顶                       |
| views      | INT          | NOT NULL, DEFAULT 0         | 浏览量                         |
| created_at | DATETIME(6)  | NOT NULL                    | 创建时间                       |
| updated_at | DATETIME(6)  | NOT NULL                    | 更新时间                       |

**索引**:

- PRIMARY KEY (`id`)
- KEY (`status`)

---

### 10. changelogs（更新日志表）

**描述**: 存储系统更新日志

| 字段名      | 类型         | 约束                            | 说明                                      |
| ----------- | ------------ | ------------------------------- | ----------------------------------------- |
| id          | INT          | PRIMARY KEY, AUTO_INCREMENT     | 日志 ID                                   |
| version     | VARCHAR(50)  | NOT NULL                        | 版本号                                    |
| title       | VARCHAR(200) | NOT NULL                        | 更新标题                                  |
| content     | TEXT         | NOT NULL                        | 更新内容                                  |
| type        | ENUM         | NOT NULL, DEFAULT 'improvement' | 类型：feature/improvement/bugfix/security |
| isPublished | TINYINT(1)   | NOT NULL, DEFAULT 0             | 是否发布                                  |
| releaseDate | DATE         | NOT NULL                        | 发布日期                                  |
| created_at  | DATETIME(6)  | NOT NULL                        | 创建时间                                  |
| updated_at  | DATETIME(6)  | NOT NULL                        | 更新时间                                  |

**索引**:

- PRIMARY KEY (`id`)
- KEY (`type`)
- KEY (`isPublished`)

---

### 11. friend_links（友链表）

**描述**: 存储友情链接信息

| 字段名      | 类型         | 约束                        | 说明                 |
| ----------- | ------------ | --------------------------- | -------------------- |
| id          | INT          | PRIMARY KEY, AUTO_INCREMENT | 友链 ID              |
| name        | VARCHAR(255) | NOT NULL                    | 友链名称             |
| url         | VARCHAR(255) | NOT NULL                    | 友链 URL             |
| description | TEXT         | NULL                        | 友链描述             |
| avatar      | VARCHAR(500) | NULL                        | 头像/图标 URL        |
| sort        | INT          | NOT NULL, DEFAULT 0         | 排序（越大越靠前）   |
| status      | TINYINT      | NOT NULL, DEFAULT 1         | 状态：1-启用，0-禁用 |
| created_at  | DATETIME(6)  | NOT NULL                    | 创建时间             |
| updated_at  | DATETIME(6)  | NOT NULL                    | 更新时间             |

---

### 12. seo_settings（SEO 设置表）

**描述**: 存储 SEO 相关设置（单行配置，只保留最新一条）

| 字段名         | 类型         | 约束                        | 说明                  |
| -------------- | ------------ | --------------------------- | --------------------- |
| id             | INT          | PRIMARY KEY, AUTO_INCREMENT | 设置 ID               |
| title          | VARCHAR(255) | NOT NULL                    | 网站标题              |
| description    | TEXT         | NULL                        | 网站描述              |
| keywords       | TEXT         | NULL                        | 关键词                |
| sitemap_url    | VARCHAR(255) | NULL                        | Sitemap URL           |
| robots         | TEXT         | NULL                        | Robots 配置           |
| canonical_url  | VARCHAR(255) | NULL                        | Canonical URL         |
| og_title       | VARCHAR(255) | NULL                        | Open Graph 标题       |
| og_description | TEXT         | NULL                        | Open Graph 描述       |
| og_image       | VARCHAR(255) | NULL                        | Open Graph 图片       |
| schema_markup  | TEXT         | NULL                        | Schema 结构化数据标记 |
| meta_author    | VARCHAR(255) | NULL                        | Meta 作者             |
| meta_viewport  | VARCHAR(255) | NULL                        | Meta 视口             |
| created_at     | DATETIME(6)  | NOT NULL                    | 创建时间              |
| updated_at     | DATETIME(6)  | NOT NULL                    | 更新时间              |

---

### 13. icp_info（ICP 备案信息表）

**描述**: 存储 ICP 备案信息（单行配置，只保留最新一条）

| 字段名       | 类型         | 约束                        | 说明             |
| ------------ | ------------ | --------------------------- | ---------------- |
| id           | INT          | PRIMARY KEY, AUTO_INCREMENT | 信息 ID          |
| icp_number   | VARCHAR(255) | NULL                        | ICP 备案号       |
| icp_url      | VARCHAR(255) | NULL                        | ICP 备案查询 URL |
| website_name | VARCHAR(255) | NULL                        | 网站名称         |
| created_at   | DATETIME(6)  | NOT NULL                    | 创建时间         |
| updated_at   | DATETIME(6)  | NOT NULL                    | 更新时间         |

---

### 14. guest_messages（留言表）

**描述**: 存储访客留言信息

| 字段名     | 类型         | 约束                        | 说明                            |
| ---------- | ------------ | --------------------------- | ------------------------------- |
| id         | INT          | PRIMARY KEY, AUTO_INCREMENT | 留言 ID                         |
| content    | TEXT         | NOT NULL                    | 留言内容                        |
| status     | ENUM         | NOT NULL, DEFAULT 'pending' | 状态：pending/approved/rejected |
| nickname   | VARCHAR(50)  | NULL                        | 留言者昵称                      |
| email      | VARCHAR(100) | NULL                        | 留言者邮箱                      |
| user_id    | INT          | NULL, FK→users.id           | 用户 ID（登录用户留言时）       |
| visitor_id | INT          | NULL, FK→visitors.id        | 访客 ID（游客留言时）           |
| created_at | DATETIME(6)  | NOT NULL                    | 创建时间                        |
| updated_at | DATETIME(6)  | NOT NULL                    | 更新时间                        |

**索引**:

- PRIMARY KEY (`id`)
- KEY (`user_id`)
- KEY (`visitor_id`)
- KEY (`status`)

**外键**:

- `user_id` → `users(id)` ON DELETE SET NULL
- `visitor_id` → `visitors(id)` ON DELETE SET NULL

---

### 15. site_config（站点配置表）

**描述**: 存储博客站点全局配置（网站标题、logo、favicon 等）

| 字段名     | 类型         | 约束                        | 说明     |
| ---------- | ------------ | --------------------------- | -------- |
| id         | INT          | PRIMARY KEY, AUTO_INCREMENT | 配置 ID  |
| key        | VARCHAR(100) | UNIQUE, NOT NULL            | 配置键   |
| value      | TEXT         | NULL                        | 配置值   |
| created_at | DATETIME(6)  | NOT NULL                    | 创建时间 |
| updated_at | DATETIME(6)  | NOT NULL                    | 更新时间 |

---

### 16. ai_configs（AI 模型配置表）

**描述**: 存储 AI 模型配置信息

| 字段名      | 类型         | 约束                        | 说明                 |
| ----------- | ------------ | --------------------------- | -------------------- |
| id          | INT          | PRIMARY KEY, AUTO_INCREMENT | 配置 ID              |
| name        | VARCHAR(50)  | NOT NULL                    | 配置名称             |
| provider    | VARCHAR(20)  | NOT NULL                    | 提供商（如 openai）  |
| model       | VARCHAR(50)  | NOT NULL                    | 模型标识（如 gpt-4） |
| api_key     | VARCHAR(255) | NULL                        | API 密钥             |
| base_url    | VARCHAR(255) | NULL                        | API 基础 URL         |
| temperature | DECIMAL(3,2) | DEFAULT 0.7                 | 温度参数             |
| max_tokens  | INT          | DEFAULT 2048                | 最大 token 数        |
| is_active   | TINYINT(1)   | DEFAULT 0                   | 是否启用             |
| created_at  | DATETIME(6)  | NOT NULL                    | 创建时间             |
| updated_at  | DATETIME(6)  | NOT NULL                    | 更新时间             |

---

### 17. ai_usage_logs（AI 使用日志表）

**描述**: 记录 AI API 调用日志

| 字段名        | 类型        | 约束                        | 说明           |
| ------------- | ----------- | --------------------------- | -------------- |
| id            | INT         | PRIMARY KEY, AUTO_INCREMENT | 日志 ID        |
| config_id     | INT         | NULL                        | 关联的模型配置 |
| model         | VARCHAR(50) | NOT NULL                    | 使用的模型名   |
| prompt_tokens | INT         | DEFAULT 0                   | 提示 token 数  |
| output_tokens | INT         | DEFAULT 0                   | 输出 token 数  |
| total_tokens  | INT         | DEFAULT 0                   | 总 token 数    |
| action        | VARCHAR(30) | NOT NULL                    | 调用动作       |
| created_at    | DATETIME(6) | NOT NULL                    | 创建时间       |

---

### 18. email_codes（邮箱验证码表）

**描述**: 存储邮箱登录验证码

| 字段名     | 类型         | 约束                        | 说明               |
| ---------- | ------------ | --------------------------- | ------------------ |
| id         | INT          | PRIMARY KEY, AUTO_INCREMENT | 记录 ID            |
| email      | VARCHAR(100) | NOT NULL                    | 邮箱地址           |
| code       | VARCHAR(10)  | NOT NULL                    | 验证码             |
| used       | TINYINT      | DEFAULT 0                   | 0-未使用，1-已使用 |
| created_at | DATETIME(6)  | NOT NULL                    | 创建时间           |
| updated_at | DATETIME(6)  | NOT NULL                    | 更新时间           |

---

### 19. ai_conversations（AI 会话表）

**描述**: 存储 AI 对话会话，支持多轮对话和会话恢复

| 字段名              | 类型         | 约束                        | 说明                                  |
| ------------------- | ------------ | --------------------------- | ------------------------------------- |
| id                  | INT          | PRIMARY KEY, AUTO_INCREMENT | 会话 ID                               |
| title               | VARCHAR(200) | NULL                        | AI 自动生成的标题（首条消息触发）     |
| user_id             | INT          | NOT NULL                    | 所属用户                              |
| messages            | JSON         | NULL                        | 完整消息历史（ConversationMessage[]） |
| checkpoint          | TEXT         | NULL                        | LangGraph checkpoint 序列化数据       |
| checkpoint_metadata | JSON         | NULL                        | Checkpoint metadata                   |
| checkpoint_config   | JSON         | NULL                        | Checkpoint config                     |
| created_at          | DATETIME(6)  | NOT NULL                    | 创建时间                              |
| updated_at          | DATETIME(6)  | NOT NULL                    | 更新时间                              |

**消息格式（ConversationMessage）**:

```json
{
  "role": "user | assistant | system | tool",
  "content": "消息内容",
  "toolCalls": [{ "name": "search_posts", "args": {}, "id": "call_1" }],
  "createdAt": "2026-07-31T09:00:00.000Z"
}
```

---

### 20. ai_memories（AI 记忆表）

**描述**: Agent 长期记忆，跨会话存储用户偏好、习惯、个人信息

| 字段名       | 类型         | 约束                        | 说明                                 |
| ------------ | ------------ | --------------------------- | ------------------------------------ |
| id           | INT          | PRIMARY KEY, AUTO_INCREMENT | 记忆 ID                              |
| user_id      | INT          | NOT NULL, INDEX             | 所属用户                             |
| content      | TEXT         | NOT NULL                    | 记忆内容                             |
| importance   | DECIMAL(3,2) | DEFAULT 0.50                | 重要性 0-1（个人信息 0.9，偏好 0.7） |
| access_count | INT          | DEFAULT 0                   | 被搜索命中次数                       |
| created_at   | DATETIME(6)  | NOT NULL                    | 创建时间                             |

**搜索策略**: 关键词匹配 × 重要性权重 × 时间衰减（e^(-0.1×hours/24)）
**遗忘策略**: 三种模式 — importance_based（低价值阈值）、time_based（按天数过期）、capacity_based（每用户最多 200 条）

---

## 关系说明

### ER 图

```
User (1) ──< (N) Post
Category (1) ──< (N) Post
Post (N) ──< (N) Tag [通过 posts_tags]
Post (1) ──< (N) Comment
Comment (1) ──< (N) Comment [自关联，parentId]
Visitor (1) ──< (N) VisitorLog
User (1) ──< (N) Comment [可选]
User (1) ──< (N) GuestMessage [可选]
User (1) ──< (N) Conversation [AI 会话]
User (1) ──< (N) AiMemory [AI 记忆]
Visitor (1) ──< (N) Comment [可选]
Visitor (1) ──< (N) GuestMessage [可选]
AiConfig (1) ──< (N) AiUsage [AI 配置 → 使用日志]
```

### 关系详情

1. **User ↔ Post**: 一对多。一个用户可写多篇文章。删除用户时文章保留（SET NULL）。

2. **Category ↔ Post**: 一对多。一个分类包含多篇文章。删除分类被阻止（RESTRICT）。

3. **Post ↔ Tag**: 多对多。通过 `posts_tags` 中间表关联。删除文章或标签时关联记录自动删除（CASCADE）。

4. **Post ↔ Comment**: 一对多。一篇文章可有多个评论。删除文章时评论自动删除（CASCADE）。

5. **Comment ↔ Comment**: 自关联。评论可回复评论，形成树形结构。删除父评论时子评论保留（SET NULL）。

6. **Visitor ↔ VisitorLog**: 一对多。一个访客可有多次访问记录。删除访客时日志保留（SET NULL）。

7. **User/Visitor ↔ Comment/GuestMessage**: 可选关联。通过 `user_id` 或 `visitor_id` 关联到评论或留言。

8. **AiConfig ↔ AiUsage**: 一对多。一个 AI 配置可对应多次调用日志。删除配置时日志保留（SET NULL）。

9. **User ↔ Conversation**: 一对多。一个用户可有多个 AI 会话。会话按 userId 隔离。

10. **User ↔ AiMemory**: 一对多。一个用户可有多个长期记忆。跨会话共享。

## 索引设计

### 索引策略

1. **主键索引**: 所有表都有自增主键（除 `posts_tags` 为复合主键）
2. **外键索引**: 所有外键字段都建立索引
3. **查询字段索引**: 常用过滤字段（`status`、`isPublished`）建立索引
4. **唯一索引**: `username`、`email`、`name` 等业务唯一字段

### 索引优化建议

1. **复合索引**: 对于多字段查询，考虑建立复合索引
2. **覆盖索引**: 对于频繁查询的字段组合，建立覆盖索引
3. **索引监控**: 定期检查索引使用情况，删除未使用的索引

## 数据字典

### 枚举值说明

#### Post.status / Announcement.status

- `draft`: 草稿
- `published`: 已发布
- `archived`: 已归档

#### Category.status / Tag.status

- `0` (DISABLED): 禁用
- `1` (ENABLED): 启用

#### Comment.status / GuestMessage.status

- `pending`: 待审核
- `approved`: 已通过
- `rejected`: 已拒绝

#### Changelog.type

- `feature`: 新功能
- `improvement`: 改进
- `bugfix`: 缺陷修复
- `security`: 安全更新

#### User.role

- `0` (ADMIN): 管理员
- `1` (SUPER_ADMIN): 超级管理员

#### User.gender

- `0` (FEMALE): 女
- `1` (MALE): 男

#### AI 相关枚举

**AiConfig.provider**: `openai` 等（由 AI SDK 支持的提供商）

**AiUsage.action**: `chat`（聊天）、`generate`（生成）、`suggest`（建议）等

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

### 同步 Schema（开发环境）

```bash
npm run schema:sync
```
