# 架构文档

本文档详细说明了博客后端系统的架构设计和技术实现。

## 目录

- [整体架构](#整体架构)
- [技术栈](#技术栈)
- [模块设计](#模块设计)
- [数据库设计](#数据库设计)
- [认证与授权](#认证与授权)
- [API 设计](#api-设计)
- [错误处理](#错误处理)
- [日志系统](#日志系统)

## 整体架构

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                     客户端层                              │
│              (Web Frontend / Mobile App)                │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ RESTful API
┌────────────────────▼────────────────────────────────────┐
│                    API 网关层                             │
│              (NestJS Application)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 守卫层   │  │ 拦截器层  │  │ 管道层   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   业务逻辑层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 用户模块 │  │ 文章模块 │  │ 评论模块 │  ...          │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   数据访问层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ TypeORM  │  │ 实体映射 │  │ 数据源   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   数据存储层                              │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │      MySQL       │  │    阿里云 OSS    │             │
│  └──────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

### 分层架构

项目采用经典的三层架构：

1. **表现层 (Presentation Layer)**
   - Controllers: 处理 HTTP 请求和响应
   - DTOs: 数据传输对象，定义请求和响应的数据结构
   - Guards: 路由守卫，处理认证和授权（JwtAuthGuard、SuperAdminGuard）
   - Interceptors: 拦截器（TransformInterceptor 统一响应包装）
   - Decorators: 自定义装饰器（@CurrentUser、@Bypass）

2. **业务逻辑层 (Business Logic Layer)**
   - Services: 业务逻辑处理
   - Entities: 领域实体模型，继承自 CommonEntity

3. **数据访问层 (Data Access Layer)**
   - TypeORM: ORM 框架
   - Repositories: 数据访问抽象（通过 InjectRepository）
   - Migrations: 数据库迁移脚本
   - QueryBuilder: 复杂查询构建

## 技术栈

### 核心框架

- **NestJS 11**: 基于 Express 的 Node.js 框架
  - 模块化设计
  - 依赖注入
  - 装饰器支持
  - TypeScript 原生支持

### 数据库

- **TypeORM 0.3**: ORM 框架
  - 实体关系映射
  - 数据库迁移
  - 查询构建器
  - 事务支持

- **MySQL 8.0+**: 关系型数据库
  - 主数据存储
  - ACID 事务支持
  - 字符集: utf8mb4

### 认证与安全

- **JWT (JSON Web Token)**: 无状态认证
- **Passport**: 认证中间件
- **bcryptjs**: 密码加密

### 文件存储

- **阿里云 OSS**: 对象存储服务
  - 文件上传
  - 文件下载
  - 签名 URL 生成

### 开发工具

- **TypeScript 5.7**: 类型安全的 JavaScript
- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **Husky**: Git hooks 管理
- **Jest**: 单元测试框架

## 模块设计

### 模块划分原则

1. **单一职责**: 每个模块只负责一个业务领域
2. **高内聚低耦合**: 模块内部紧密相关，模块间依赖最小
3. **可扩展性**: 易于添加新功能和模块

### 业务模块

#### 1. 用户模块 (User Module)

**职责**:

- 用户登录（JWT 签发）
- 用户信息 CRUD
- 密码修改
- 当前用户信息查询

**路径**: `src/modules/user/`

#### 2. 文章模块 (Post Module)

**职责**:

- 文章的 CRUD 操作
- 文章状态管理（draft / published / archived）
- 文章置顶功能
- 浏览量/点赞数统计
- 文章与分类、标签的关联

**路径**: `src/modules/post/`

#### 3. 分类模块 (Category Module)

**职责**:

- 分类的 CRUD 操作
- 分类状态管理（0-禁用 / 1-启用）
- 乐观锁版本控制

**路径**: `src/modules/category/`

#### 4. 标签模块 (Tag Module)

**职责**:

- 标签的 CRUD 操作
- 标签状态管理（0-禁用 / 1-启用）
- 标签与文章的多对多关系
- 乐观锁版本控制

**路径**: `src/modules/tag/`

#### 5. 评论模块 (Comment Module)

**职责**:

- 评论的创建（登录用户或访客均可）
- 评论审核机制（pending / approved / rejected）
- 评论回复（父子关系，parentId 自关联）
- 评论状态管理

**路径**: `src/modules/comment/`

#### 6. 访客模块 (Visitor Module)

**职责**:

- 访客信息记录
- 访问日志记录
- 心跳在线状态维护
- SSE 实时在线访客流推送
- 访客仪表板统计

**路径**: `src/modules/visitor/`

#### 7. 文件上传模块 (OSS Module)

**职责**:

- 文件上传到阿里云 OSS
- 文件签名 URL 生成
- 文件下载（流式传输）

**路径**: `src/modules/oss/`

#### 8. 友链模块 (Friend Link Module)

**职责**:

- 友链的 CRUD 操作

**路径**: `src/modules/friend-link/`

#### 9. 留言模块 (Guest Message Module)

**职责**:

- 访客留言创建
- 留言审核机制（pending / approved / rejected）
- 留言列表查询

**路径**: `src/modules/guest-message/`

#### 10. 公告模块 (Announcement Module)

**职责**:

- 公告的 CRUD 操作
- 公告状态管理（draft / published / archived）
- 公告置顶功能

**路径**: `src/modules/announcement/`

#### 11. 更新日志模块 (Changelog Module)

**职责**:

- 更新日志的 CRUD 操作
- 发布状态管理（isPublished）
- 按类型（feature / improvement / bugfix / security）分类

**路径**: `src/modules/changelog/`

#### 12. 设置模块 (Setting Module)

**职责**:

- 聚合设置管理（SEO、友链、ICP 信息的组合读写）
- 友链批量替换（事务性操作）

**路径**: `src/modules/setting/`

#### 13. SEO 设置模块 (SEO Setting Module)

**职责**:

- SEO 元数据存储（title、description、keywords、OG 标签、Schema 标记等）
- 单行配置模式（只保留最新一条记录）

**路径**: `src/modules/seo-setting/`

#### 14. ICP 备案信息模块 (ICP Info Module)

**职责**:

- ICP 备案号、查询 URL、网站名称存储
- 单行配置模式（只保留最新一条记录）

**路径**: `src/modules/icp-info/`

#### 15. 数据导入导出模块 (Data Transfer Module)

**职责**:

- 全量数据导出为 ZIP 文件
- 从 ZIP 文件导入数据（清空后导入模式）
- ZIP 文件完整性校验
- 导入后 AUTO_INCREMENT 重置

**权限**: 仅超级管理员（role=1）可访问

**路径**: `src/modules/data-transfer/`

#### 16. AI 模块 (AI Module)

**路径**: `src/modules/ai/`

**职责**:

- AI 聊天对话（流式 SSE 响应）
- AI 配置管理（CRUD + 切换启用状态）
- AI 使用量统计日志

**核心接口**:

- `POST /api/ai/chat` — AI 对话（流式）
- `GET /api/ai/configs` — 获取 AI 配置列表
- `POST /api/ai/configs/save` — 创建/更新配置
- `DELETE /api/ai/configs/:id` — 删除配置
- `PATCH /api/ai/configs/:id/activate` — 切换启用状态
- `GET /api/ai/usage` — 查询使用统计

**权限**: 需登录认证

#### 17. 站点配置模块 (Site Config Module)

**路径**: `src/modules/site-config/`

**职责**:

- 博客站点全局配置（网站标题、logo、favicon、footer 等）
- 键值对存储，前端按需读取

**核心接口**:

- `GET /api/site-config` — 获取当前站点配置
- `PUT /api/site-config` — 更新站点配置

**权限**: 读取无需认证，写入需认证

#### 18. 邮件模块 (Email Module)

**路径**: `src/modules/email/`

**职责**:

- 发送邮箱验证码（QQ 邮箱 SMTP）
- 验证码有效期和防刷机制
- 邮箱登录支持

**关联实体**: `email_codes`（邮箱验证码表）

**权限**: 发送验证码无需认证

### 共享模块

#### Shared Module

**Database Module** (`src/shared/database/`):

- TypeORM 数据源配置
- MySQL 连接管理

**Entities Module** (`src/shared/database/entities.module.ts`):

- 全局实体注册，供所有业务模块使用

**Auth Module** (`src/shared/auth/`):

- JWT 密钥配置
- AuthUtil 工具类（token 解析、用户 ID 提取）

### 公共模块 (Common Module)

**路径**: `src/common/`

**包含**:

- `decorators/bypass.decorator.ts`: `@Bypass()` 装饰器，标记方法跳过 TransformInterceptor 响应包装
- `decorators/current-user.decorator.ts`: `@CurrentUser()` 装饰器，从请求中提取当前用户
- `guards/jwt-auth.guard.ts`: JWT 认证守卫，验证 token 有效性
- `guards/super-admin.guard.ts`: 超级管理员守卫，验证用户 role=1
- `interceptors/transform.interceptor.ts`: 响应转换拦截器，统一包装为 `{ code, message, data }` 格式
- `pagination/`: 分页 DTO 基类、类型定义和工具函数
- `model/response.model.ts`: 统一响应模型
- `constants/response.constant.ts`: 响应常量（状态码、消息）

## 数据库设计

### 设计原则

1. **规范化**: 遵循数据库设计范式，减少数据冗余
2. **公共基类**: 所有业务表继承 `CommonEntity`（含 `id`、`created_at`、`updated_at`）
3. **索引优化**: 为常用查询字段和外键添加索引
4. **外键约束**: 保证数据完整性
5. **不使用软删除**: 删除操作直接从数据库移除记录

### 核心表结构

#### users（用户表）

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  nickname VARCHAR(50) NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NULL,
  wechat VARCHAR(50) NULL,
  role TINYINT NOT NULL DEFAULT 0,
  avatar VARCHAR(255) NULL,
  bio TEXT NULL,
  github_account VARCHAR(100) NULL,
  gender TINYINT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### posts（文章表）

```sql
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(500) NULL,
  cover_image VARCHAR(255) NULL,
  is_top TINYINT(1) NOT NULL DEFAULT 0,
  is_recommended TINYINT(1) NOT NULL DEFAULT 0,
  slug VARCHAR(100) NULL,
  views INT NOT NULL DEFAULT 0,
  likes INT NOT NULL DEFAULT 0,
  publish_time DATETIME(6) NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  user_id INT NULL,
  category_id INT NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
```

#### categories（分类表）

```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NULL,
  status TINYINT NOT NULL DEFAULT 1,
  version INT NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### tags（标签表）

```sql
CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(500) NULL,
  version INT NOT NULL DEFAULT 1,
  status TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### posts_tags（文章标签关联表）

```sql
CREATE TABLE posts_tags (
  postsId INT NOT NULL,
  tagsId INT NOT NULL,
  PRIMARY KEY (postsId, tagsId),
  FOREIGN KEY (postsId) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tagsId) REFERENCES tags(id) ON DELETE CASCADE
);
```

#### comments（评论表）

```sql
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  likes INT NOT NULL DEFAULT 0,
  user_id INT NULL,
  visitor_id INT NULL,
  post_id INT NOT NULL,
  parent_id INT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE SET NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL
);
```

#### visitors（访客表）

```sql
CREATE TABLE visitors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visitor_id VARCHAR(64) UNIQUE NULL,
  fingerprint VARCHAR(64) UNIQUE NULL,
  ip VARCHAR(50) NULL,
  location VARCHAR(100) NULL,
  user_agent VARCHAR(255) NULL,
  last_active_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### visitor_logs（访客日志表）

```sql
CREATE TABLE visitor_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visitorId INT NULL,
  ip VARCHAR(50) NOT NULL,
  userAgent VARCHAR(255) NULL,
  pageUrl VARCHAR(255) NULL,
  referer VARCHAR(255) NULL,
  visited_at DATETIME(6) NOT NULL,
  FOREIGN KEY (visitorId) REFERENCES visitors(id) ON DELETE SET NULL
);
```

#### announcements（公告表）

```sql
CREATE TABLE announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  is_top TINYINT(1) NOT NULL DEFAULT 0,
  views INT NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### changelogs（更新日志表）

```sql
CREATE TABLE changelogs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  version VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('feature', 'improvement', 'bugfix', 'security') NOT NULL DEFAULT 'improvement',
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  release_date DATE NOT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### friend_links（友链表）

```sql
CREATE TABLE friend_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### guest_messages（留言表）

```sql
CREATE TABLE guest_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  nickname VARCHAR(50) NULL,
  email VARCHAR(100) NULL,
  user_id INT NULL,
  visitor_id INT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (visitor_id) REFERENCES visitors(id) ON DELETE SET NULL
);
```

#### seo_settings（SEO 设置表）

```sql
CREATE TABLE seo_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  keywords TEXT NULL,
  sitemap_url VARCHAR(255) NULL,
  robots TEXT NULL,
  canonical_url VARCHAR(255) NULL,
  og_title VARCHAR(255) NULL,
  og_description TEXT NULL,
  og_image VARCHAR(255) NULL,
  schema_markup TEXT NULL,
  meta_author VARCHAR(255) NULL,
  meta_viewport VARCHAR(255) NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### icp_info（ICP 备案信息表）

```sql
CREATE TABLE icp_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  icp_number VARCHAR(255) NULL,
  icp_url VARCHAR(255) NULL,
  website_name VARCHAR(255) NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### site_config（站点配置表）

```sql
CREATE TABLE site_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NULL,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### ai_configs（AI 模型配置表）

```sql
CREATE TABLE ai_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  model VARCHAR(50) NOT NULL,
  api_key VARCHAR(255) NULL,
  base_url VARCHAR(255) NULL,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INT DEFAULT 2048,
  is_active TINYINT(1) DEFAULT 0,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

#### ai_usage_logs（AI 使用日志表）

```sql
CREATE TABLE ai_usage_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_id INT NULL,
  model VARCHAR(50) NOT NULL,
  prompt_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  action VARCHAR(30) NOT NULL,
  created_at DATETIME(6) NOT NULL
);
```

#### email_codes（邮箱验证码表）

```sql
CREATE TABLE email_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL,
  used TINYINT DEFAULT 0,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL
);
```

### 关系说明

1. **User ↔ Post**: 一对多。删除用户时文章保留（SET NULL）。

2. **Category ↔ Post**: 一对多。删除分类被阻止（RESTRICT）。

3. **Post ↔ Tag**: 多对多。通过 `posts_tags` 中间表关联。删除文章或标签时关联记录自动删除（CASCADE）。

4. **Post ↔ Comment**: 一对多。删除文章时评论自动删除（CASCADE）。

5. **Comment ↔ Comment**: 自关联（parentId）。删除父评论时子评论保留（SET NULL）。

6. **Visitor ↔ VisitorLog**: 一对多。删除访客时日志保留（SET NULL）。

7. **User/Visitor ↔ Comment/GuestMessage**: 可选关联。通过 `user_id` 或 `visitor_id` 关联。

8. **AiConfig ↔ AiUsage**: 一对多。删除配置时日志保留（SET NULL）。

## 认证与授权

### JWT 认证流程

```
1. 用户登录
   POST /api/users/login
   ↓
2. 验证用户名和密码（bcrypt 比对）
   ↓
3. 生成 JWT Token
   {
     sub: userId,
     iat: timestamp,
     exp: timestamp
   }
   ↓
4. 返回 Token 给客户端
   ↓
5. 客户端在后续请求中携带 Token
   Authorization: Bearer <token>
   ↓
6. JwtAuthGuard 验证 Token
   ↓
7. 提取用户信息并附加到请求对象
```

### 守卫系统

**JwtAuthGuard**: 验证 JWT token 有效性，提取 `sub` 作为用户 ID 写入 `request.user`。

**SuperAdminGuard**: 验证当前用户 role=1（超级管理员），用于 data-transfer 等敏感接口。

### 使用方式

```typescript
@Controller('posts')
export class PostController {
  @Get('page')
  @UseGuards(JwtAuthGuard) // 需要认证
  paginate() {}

  @Get()
  findAll() {} // 无需认证，公开接口
}

@Controller('data-transfer')
@UseGuards(JwtAuthGuard, SuperAdminGuard) // 需要超级管理员
export class DataTransferController {}
```

### @Bypass 装饰器

标记在方法上，使该方法的响应跳过 `TransformInterceptor` 的统一包装（用于文件下载等直接流式响应的场景）。

```typescript
@Get('export')
@Bypass()
exportAll(@Res() res: Response) {
  // 响应不会被包装为 { code, message, data }
}
```

## API 设计

### RESTful 规范

- **GET**: 获取资源
- **POST**: 创建资源（部分模块也用于更新，当请求体含 id 时）
- **PUT**: 完整更新资源或更新特定字段（状态、置顶等）
- **PATCH**: 部分更新资源（category、tag 模块）
- **DELETE**: 删除资源

### URL 命名规范

- 使用名词复数形式: `/api/posts`, `/api/users`
- 使用连字符分隔: `/api/friend-links`, `/api/guest-messages`
- 特定操作使用动词路径: `/api/posts/:id/status`, `/api/users/change-password`

### 响应格式

统一响应格式（由 TransformInterceptor 自动包装）：

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

`@Bypass()` 装饰器可跳过此包装。

### 分页格式

```typescript
interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
```

## 错误处理

### 异常处理

使用 NestJS 内置异常类进行错误处理：

- `BadRequestException`: 400 请求参数错误
- `UnauthorizedException`: 401 未授权
- `NotFoundException`: 404 资源不存在

### 数据验证

使用 `class-validator` 和 `class-transformer` 进行 DTO 验证：

```typescript
export class CreatePostDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  content: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;
}
```

## 日志系统

### 日志级别

- **ERROR**: 错误日志
- **WARN**: 警告日志
- **INFO**: 信息日志
- **DEBUG**: 调试日志

### 日志记录

使用 NestJS 内置 Logger：

- Controller 层: 请求路由日志
- Service 层: 业务操作日志（如数据导入导出）
- 异常自动记录

## 性能优化

### 数据库优化

1. **索引优化**: 为常用查询字段（status、isPublished、外键）添加索引
2. **查询优化**: 使用 QueryBuilder 构建精确查询
3. **关联查询**: 使用 `leftJoinAndSelect` 一次性加载关联数据
4. **分页查询**: 使用 `paginateQueryBuilderForAdmin` 统一分页

### 代码优化

1. **异步处理**: 使用 `async/await` 处理异步操作
2. **批量操作**: 数据导入使用事务批量写入
3. **流式传输**: 文件下载和导出使用 Stream 避免内存溢出

## 安全考虑

1. **密码加密**: 使用 bcrypt 加密密码
2. **SQL 注入防护**: 使用 TypeORM 的参数化查询
3. **JWT 认证**: 所有管理接口需要有效 token
4. **角色控制**: 超级管理员接口需要 role=1
5. **文件上传**: 限制文件大小（1GB），校验 ZIP 文件签名
6. **XSS 防护**: 输入验证（class-validator）
7. **HTTPS**: 生产环境使用 HTTPS

## 扩展性

### 水平扩展

- 无状态设计（JWT 认证），支持多实例部署
- 使用负载均衡器分发请求

### 功能扩展

- 模块化设计，新增功能只需添加模块并在 AppModule 中注册
- 公共模块（common、shared）提供可复用的守卫、拦截器、分页工具
