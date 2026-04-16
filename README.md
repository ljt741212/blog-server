# Blog Server

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 项目简介

这是一个基于 [NestJS](https://nestjs.com/) 框架开发的博客系统后端服务。项目使用 TypeScript 开发，采用模块化设计，集成了多种现代化技术栈。本系统提供了完整的博客功能，包括文章管理、用户管理、评论系统、访客统计等核心功能。

## 主要功能

- ✅ **用户认证与授权** - 基于 JWT 的身份认证系统
- ✅ **文章管理** - 完整的文章 CRUD 操作，支持分类、标签、置顶等功能
- ✅ **评论系统** - 文章评论管理，支持审核机制
- ✅ **分类和标签管理** - 灵活的文章分类和标签系统
- ✅ **访客统计** - 访客访问记录和统计分析
- ✅ **文件上传** - 基于阿里云 OSS 的文件上传服务
- ✅ **友链管理** - 友情链接管理功能
- ✅ **留言板** - 访客留言功能
- ✅ **更新日志** - 系统更新日志管理
- ✅ **SEO 设置** - SEO 相关配置管理
- ✅ **系统设置** - 系统基础配置管理

## 技术栈

### 核心框架
- **NestJS** ^11.0.1 - 渐进式 Node.js 框架，提供完整的 MVC 架构支持
- **TypeScript** ^5.7.3 - 强类型的 JavaScript 超集
- **Express** - 底层 HTTP 服务器框架

### 数据库
- **TypeORM** ^0.3.0 - 强大的 ORM 框架，支持多种数据库
- **MySQL2** ^3.0.0 - MySQL 数据库驱动

### 认证与安全
- **@nestjs/jwt** ^10.0.0 - JWT 认证模块
- **@nestjs/passport** ^10.0.0 - Passport 身份认证中间件
- **passport-jwt** ^4.0.1 - JWT 策略
- **bcryptjs** ^2.4.3 - 密码加密

### 数据验证与转换
- **class-validator** ^0.14.0 - 基于装饰器的数据验证
- **class-transformer** ^0.5.1 - 对象转换工具

### 文件存储
- **ali-oss** ^6.23.0 - 阿里云 OSS 对象存储服务

### API 文档
- **@nestjs/swagger** ^11.0.7 - API 文档自动生成工具

### 工具库
- **lodash** ^4.17.21 - JavaScript 工具库
- **nestjs-typeorm-paginate** ^4.1.0 - 分页工具

## 项目结构

```
server/
├── src/
│   ├── main.ts                 # 应用入口文件
│   ├── app.module.ts           # 根模块
│   ├── app.controller.ts       # 根控制器
│   ├── app.service.ts          # 根服务
│   ├── config/                 # 配置文件
│   │   ├── index.ts
│   │   ├── database.config.ts  # 数据库配置
│   │   ├── oss.config.ts       # OSS 配置
│   │   └── data-source.ts      # TypeORM 数据源
│   ├── modules/                # 业务模块
│   │   ├── user/               # 用户模块
│   │   ├── post/               # 文章模块
│   │   ├── category/           # 分类模块
│   │   ├── tag/                # 标签模块
│   │   ├── comment/            # 评论模块
│   │   ├── visitor/            # 访客模块
│   │   ├── oss/                # 文件上传模块
│   │   ├── friend-link/        # 友链模块
│   │   ├── guest-message/      # 留言模块
│   │   ├── changelog/          # 更新日志模块
│   │   ├── setting/            # 设置模块
│   │   ├── seo-setting/        # SEO 设置模块
│   │   └── icp-info/           # ICP 信息模块
│   ├── common/                 # 公共模块
│   │   ├── decorators/         # 装饰器
│   │   ├── guards/             # 守卫
│   │   ├── interceptors/       # 拦截器
│   │   ├── pagination/         # 分页工具
│   │   ├── constants/          # 常量
│   │   └── model/              # 数据模型
│   ├── shared/                 # 共享模块
│   │   └── database/           # 数据库模块
│   ├── migrations/             # 数据库迁移文件
│   └── global/                 # 全局工具
├── test/                       # 测试文件
├── .env.example                # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 系统要求

- Node.js >= 16.x
- MySQL >= 8.0
- npm >= 7.x 或 pnpm >= 8.x

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd Blog-project/server
```

2. **安装依赖**

```bash
npm install
# 或
pnpm install
```

3. **配置环境变量**

复制 `.env.example` 文件为 `.env`，并修改相应配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下参数：

```env
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=blog_db
DB_SYNCHRONIZE=false
DB_LOGGING=error

# 应用配置
PORT=3004
NODE_ENV=development

# JWT 配置（需要在代码中配置）
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# OSS 配置（可选）
OSS_REGION=your_region
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket
OSS_ENDPOINT=your_endpoint
OSS_PUBLIC_BASE_URL=your_public_base_url
OSS_DEFAULT_DIR=uploads
OSS_SIGN_EXPIRES=600
OSS_MAX_FILE_SIZE_MB=10
OSS_ALLOWED_MIME_PREFIXES=image/
```

4. **创建数据库**

```sql
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **运行数据库迁移**

```bash
npm run migration:run
```

6. **启动开发服务器**

```bash
npm run start:dev
```

应用将在 `http://localhost:3004` 启动，API 前缀为 `/api`。

## 可用脚本

```bash
# 开发
npm run start:dev          # 启动开发服务器（热重载）

# 生产
npm run build              # 构建项目
npm run start:prod         # 启动生产服务器

# 代码质量
npm run format             # 格式化代码
npm run lint               # 代码检查并自动修复

# 测试
npm run test               # 运行单元测试
npm run test:watch         # 监听模式运行测试
npm run test:cov           # 生成测试覆盖率报告
npm run test:e2e           # 运行端到端测试

# 数据库迁移
npm run migration:create   # 创建新的迁移文件
npm run migration:generate # 根据实体变更生成迁移文件
npm run migration:run      # 运行迁移
npm run migration:revert   # 回滚迁移
npm run schema:sync        # 同步数据库架构（开发环境）
npm run schema:drop        # 删除数据库架构（危险操作）
```

## API 文档

启动应用后，访问以下地址查看 Swagger API 文档：

```
http://localhost:3004/api
```

> 注意：如果项目已集成 Swagger，可以通过上述地址访问。否则需要先配置 Swagger。

## 主要 API 端点

### 用户相关 (`/api/users`)
- `POST /api/users/login` - 用户登录
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/change-password` - 修改密码
- `GET /api/users/page` - 分页查询用户（需认证）
- `POST /api/users` - 创建用户（需认证）
- `PUT /api/users/:id` - 更新用户（需认证）
- `DELETE /api/users/:id` - 删除用户（需认证）

### 文章相关 (`/api/posts`)
- `GET /api/posts` - 获取所有文章
- `GET /api/posts/page` - 分页查询文章
- `GET /api/posts/:id` - 获取文章详情
- `POST /api/posts` - 创建文章（需认证）
- `PUT /api/posts/:id/status` - 更新文章状态（需认证）
- `PUT /api/posts/:id/views` - 增加浏览量
- `PUT /api/posts/:id/likes` - 增加点赞数
- `PUT /api/posts/:id/top` - 设置/取消置顶（需认证）
- `DELETE /api/posts/:id` - 删除文章（需认证）

### 分类相关 (`/api/categories`)
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/page` - 分页查询分类
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类（需认证）
- `PATCH /api/categories/:id` - 更新分类（需认证）
- `PUT /api/categories/:id/status` - 更新分类状态（需认证）
- `DELETE /api/categories/:id` - 删除分类（需认证）

### 标签相关 (`/api/tags`)
- `GET /api/tags` - 获取所有标签
- `GET /api/tags/page` - 分页查询标签
- `GET /api/tags/:id` - 获取标签详情
- `POST /api/tags` - 创建标签（需认证）
- `PATCH /api/tags/:id` - 更新标签（需认证）
- `DELETE /api/tags/:id` - 删除标签（需认证）

### 评论相关 (`/api/comments`)
- `POST /api/comments` - 创建评论
- `GET /api/comments/page` - 分页查询评论
- `GET /api/comments/by-post` - 根据文章 ID 查询评论
- `PUT /api/comments/:id/status` - 更新评论状态（需认证）
- `DELETE /api/comments/:id` - 删除评论（需认证）

### 访客相关 (`/api/visitor`)
- `POST /api/visitor/visit` - 记录访客访问
- `GET /api/visitor` - 获取所有访客（需认证）
- `GET /api/visitor/dashboard` - 获取访客统计（需认证）

### 文件上传相关 (`/api/oss`)
- `POST /api/oss/upload` - 上传文件（需认证）
- `GET /api/oss/sign-url` - 获取签名 URL（需认证）
- `GET /api/oss/download` - 下载文件（需认证）

更多 API 详情请参考 [API 文档](./docs/API.md)。

## 认证说明

大部分管理接口需要 JWT 认证。认证方式：

1. 通过 `/api/users/login` 接口登录获取 token
2. 在请求头中添加 `Authorization: Bearer <token>`

示例：

```bash
curl -H "Authorization: Bearer your_token_here" http://localhost:3004/api/users/me
```

## 数据库设计

主要数据表包括：

- `user` - 用户表
- `post` - 文章表
- `category` - 分类表
- `tag` - 标签表
- `comment` - 评论表
- `visitor` - 访客表
- `visitor_log` - 访客访问日志表
- `friend_link` - 友链表
- `guest_message` - 留言表
- `changelog` - 更新日志表
- `setting` - 设置表
- `seo_setting` - SEO 设置表
- `icp_info` - ICP 信息表

详细数据库设计请参考 [数据库文档](./docs/DATABASE.md)。

## 开发指南

### 代码规范

项目遵循以下代码规范：

- 使用 TypeScript 严格模式
- 遵循 NestJS 最佳实践
- 使用 ESLint 和 Prettier 进行代码格式化
- 使用 Husky 进行 Git hooks 管理

### 添加新模块

1. 使用 NestJS CLI 生成模块：

```bash
nest g module modules/your-module
nest g controller modules/your-module
nest g service modules/your-module
```

2. 创建实体文件 `your-module.entity.ts`
3. 创建 DTO 文件 `your-module.dto.ts`
4. 在 `app.module.ts` 中注册新模块

### 数据库迁移

创建迁移文件：

```bash
npm run migration:create ./src/migrations/your-migration-name
```

根据实体变更生成迁移：

```bash
npm run migration:generate ./src/migrations/update-table
```

运行迁移：

```bash
npm run migration:run
```

## 部署

### 生产环境构建

```bash
npm run build
npm run start:prod
```

### Docker 部署

（待补充 Dockerfile 和 docker-compose.yml）

### 环境变量

生产环境需要配置以下环境变量：

- `NODE_ENV=production`
- `DB_SYNCHRONIZE=false`（重要：生产环境必须为 false）
- 其他必要的数据库和 OSS 配置

详细部署说明请参考 [部署文档](./docs/DEPLOYMENT.md)。

## 常见问题

### 1. 数据库连接失败

检查 `.env` 文件中的数据库配置是否正确，确保数据库服务已启动。

### 2. JWT 认证失败

确保请求头中包含正确的 `Authorization` 字段，格式为 `Bearer <token>`。

### 3. 文件上传失败

检查 OSS 配置是否正确，确保有足够的权限访问 OSS 服务。

## 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 UNLICENSED 许可证。

## 作者

linzai

## 相关链接

- [NestJS 官方文档](https://docs.nestjs.com/)
- [TypeORM 文档](https://typeorm.io/)
- [Swagger 文档](https://swagger.io/)
