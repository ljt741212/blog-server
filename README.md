<p align="center">
  <a href="http://www.cx330.cloud/" target="_blank">
    <img src="https://img.shields.io/badge/🌐-www.cx330.cloud-blue?style=for-the-badge" alt="Blog" />
  </a>
  <a href="https://github.com/ljt741212/blog-client" target="_blank">
    <img src="https://img.shields.io/badge/📦-前端仓库-blue?style=for-the-badge" alt="Frontend" />
  </a>
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&style=for-the-badge" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&style=for-the-badge" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Docker-✓-2496ED?logo=docker&style=for-the-badge" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" />
</p>

<h1 align="center">CX330 Blog — 后端服务</h1>

<p align="center">
  <b>基于 NestJS + TypeORM + MySQL 的全功能博客后端，RESTful API</b><br/>
  认证 · AI 写作 · OSS 上传 · 邮箱登录 · 数据导入导出 · SSE 实时推送
</p>

<p align="center">
  <a href="http://www.cx330.cloud/" target="_blank"><b>🏠 线上博客</b></a> ·
  <a href="https://github.com/ljt741212/blog-client" target="_blank"><b>📦 前端仓库</b></a> ·
  <a href="./docs/API.md"><b>📖 API 文档</b></a> ·
  <a href="./docs/ARCHITECTURE.md"><b>🏗️ 架构设计</b></a> ·
  <a href="./docs/DATABASE.md"><b>🗄️ 数据库</b></a> ·
  <a href="./docs/DEPLOY.md"><b>🚀 部署</b></a>
</p>

<p align="center">
  ⭐ 如果这个项目对你有帮助，欢迎 Star / Fork / Watch
</p>

---

## 📋 目录

- [功能模块](#-功能模块)
- [项目结构](#-项目结构)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [环境变量](#-环境变量)
- [部署](#-部署)
- [文档](#-文档)

---

## 📦 功能模块

> 共 16 个功能模块，18 张数据表，100+ API 接口

### 核心模块

| 模块               | 路由                          | 功能                                                      |
| ------------------ | ----------------------------- | --------------------------------------------------------- |
| 🔐 **用户认证**    | `/api/users`                  | JWT 登录 · 邮箱验证码登录 · 密码修改 · 个人信息           |
| 📝 **文章管理**    | `/api/posts`                  | 增删改查 · 发布/草稿/归档 · 置顶 · 浏览量/点赞 · Markdown |
| 🏷️ **分类 & 标签** | `/api/categories` `/api/tags` | 无限层级分类 · 标签管理 · 状态控制                        |

### 互动模块

| 模块            | 路由                  | 功能                                                  |
| --------------- | --------------------- | ----------------------------------------------------- |
| 💬 **评论系统** | `/api/comments`       | 文章评论 · 嵌套回复 · 审核（待审/通过/拒绝）          |
| 📋 **留言板**   | `/api/guest-messages` | 访客留言 · 管理员回复 · 审核                          |
| 📊 **访客统计** | `/api/visitor`        | 访问记录 · 心跳上报 · **SSE 实时在线人数** · 数据看板 |

### 内容 & 配置

| 模块               | 路由                                                                  | 功能                                  |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------- |
| 📁 **文件上传**    | `/api/oss`                                                            | 阿里云 OSS 上传 · 签名 URL · 文件管理 |
| 🔗 **友链管理**    | `/api/friend-links`                                                   | 友情链接增删改查 · 排序               |
| 📢 **公告 & 日志** | `/api/announcements` `/api/changelogs`                                | 站点公告 · 更新日志 · 发布管理        |
| ⚙️ **站点配置**    | `/api/site-config` `/api/setting` `/api/seo-settings` `/api/icp-info` | 全局配置 · SEO · ICP 备案 · 个人信息  |

### 高级功能

| 模块            | 路由                 | 功能                                                                                      |
| --------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| 🤖 **AI 助手**  | `/api/ai`            | **流式对话 (SSE)** · 多模型（OpenAI / DeepSeek / Anthropic）· API Key 加密存储 · 用量统计 |
| 📦 **数据迁移** | `/api/data-transfer` | 全量 ZIP 导出/导入 · WordPress XML 导入 · JSON 备份                                       |

---

## 📁 项目结构

```
blog-server/
├── src/
│   ├── common/              # 公共工具：装饰器、守卫、拦截器、过滤器、分页
│   ├── config/              # 应用配置（数据库、JWT、OSS、邮件、AI）
│   ├── modules/             # 业务模块（16 个）
│   │   ├── ai/              #   🤖 AI 对话 + 多模型
│   │   ├── announcement/    #   📢 站点公告
│   │   ├── category/        #   🏷️ 文章分类
│   │   ├── changelog/       #   📝 更新日志
│   │   ├── comment/         #   💬 文章评论
│   │   ├── data-transfer/   #   📦 数据导入导出
│   │   ├── email/           #   📧 邮件发送
│   │   ├── friend-link/     #   🔗 友情链接
│   │   ├── guest-message/   #   📋 访客留言
│   │   ├── icp-info/        #   📋 ICP 备案
│   │   ├── oss/             #   📁 阿里云 OSS
│   │   ├── post/            #   📝 文章管理
│   │   ├── seo-setting/     #   🔍 SEO 配置
│   │   ├── setting/         #   ⚙️ 站点设置
│   │   ├── site-config/     #   ⚙️ 全局配置
│   │   ├── tag/             #   🏷️ 标签管理
│   │   ├── user/            #   🔐 用户认证
│   │   └── visitor/         #   📊 访客统计 + SSE
│   ├── shared/              # 共享模块（Auth、Database、JWT）
│   ├── migrations/          # TypeORM 数据库迁移
│   └── scripts/             # 脚本（种子数据等）
├── docs/                    # 📖 完整文档
├── Dockerfile               # 多阶段构建
├── docker-compose.yml       # MySQL + App 一键部署
└── .github/workflows/       # CI/CD（GitHub Actions）
```

---

## 🛠️ 技术栈

| 类别         | 技术选型                                      | 说明                                 |
| ------------ | --------------------------------------------- | ------------------------------------ |
| **框架**     | NestJS 11 + Express                           | 企业级 Node.js 框架，模块化架构      |
| **语言**     | TypeScript 5                                  | 类型安全                             |
| **ORM**      | TypeORM                                       | 支持 Migration、Repository 模式      |
| **数据库**   | MySQL 8                                       | 18 张表，utf8mb4 字符集              |
| **认证**     | JWT + Passport + bcrypt                       | 无状态认证 + 密码哈希                |
| **文件存储** | 阿里云 OSS                                    | 对象存储 + 签名 URL                  |
| **邮件**     | Nodemailer                                    | QQ 邮箱 SMTP，验证码登录             |
| **验证**     | class-validator + class-transformer           | DTO 自动校验                         |
| **AI**       | SSE 流式响应                                  | OpenAI / DeepSeek / Anthropic 多模型 |
| **文档**     | Swagger                                       | 开发环境自动生成                     |
| **工程化**   | pnpm · ESLint · Prettier · Husky · commitlint | 代码规范 + Git Hooks                 |
| **部署**     | Docker · GitHub Actions · Self-hosted Runner  | CI/CD 自动部署                       |

---

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18
- **pnpm** >= 8
- **MySQL** >= 8

### 本地开发

```bash
# 1. 克隆
git clone https://github.com/ljt741212/blog-server.git
cd blog-server

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填写必填项：数据库密码、JWT 密钥

# 4. 创建数据库
mysql -u root -p -e "CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5. 运行迁移
pnpm migration:run

# 6. 启动
pnpm start:dev
```

启动后访问：

- **API 服务**：http://localhost:3004
- **Swagger 文档**：http://localhost:3004/api
- **健康检查**：http://localhost:3004/api/

### 可用命令

```bash
pnpm start:dev           # 开发模式（热重载）
pnpm build               # 生产构建
pnpm start:prod          # 生产启动
pnpm lint                # ESLint 检查 + 修复
pnpm format              # Prettier 格式化
pnpm test                # 单元测试
pnpm migration:run       # 执行数据库迁移
pnpm migration:generate  # 根据实体自动生成迁移
pnpm seed                # 初始化管理员账号
```

---

## 🔧 环境变量

### 必填

| 变量          | 说明           | 示例                      |
| ------------- | -------------- | ------------------------- |
| `DB_PASSWORD` | MySQL 密码     | `your_password`           |
| `JWT_SECRET`  | JWT 签名密钥   | `openssl rand -hex 64`    |
| `CORS_ORIGIN` | 允许的前端域名 | `https://www.cx330.cloud` |

### 可选（功能增强）

| 类别 | 变量                                                                  | 说明                       |
| ---- | --------------------------------------------------------------------- | -------------------------- |
| 邮箱 | `EMAIL_HOST` `EMAIL_PORT` `EMAIL_USER` `EMAIL_PASS`                   | QQ 邮箱 SMTP（验证码登录） |
| OSS  | `OSS_REGION` `OSS_ACCESS_KEY_ID` `OSS_ACCESS_KEY_SECRET` `OSS_BUCKET` | 阿里云 OSS（文件上传）     |
| 种子 | `SEED_ADMIN_USERNAME` `SEED_ADMIN_EMAIL` `SEED_ADMIN_PASSWORD`        | 初始管理员                 |
| AI   | `ENCRYPTION_KEY`                                                      | AI API Key 加密密钥        |

> 完整配置见 [`.env.example`](./.env.example) 和 [部署文档](./docs/DEPLOY.md)

---

## 🚢 部署

```bash
# Docker Compose 一键部署（MySQL + App）
docker compose up -d

# 或者单独构建镜像
docker build -t blog-server:latest .
```

### CI/CD 流水线

```
GitHub push main → Actions → Self-hosted Runner
  → git fetch → docker build → compose up
  → migration:run → seed-admin → prune
```

> 详细说明见 [部署文档](./docs/DEPLOY.md) — 包含 Docker、Nginx 反向代理、SSL 配置、故障排查

---

## 📖 文档

| 文档                               | 内容                              |
| ---------------------------------- | --------------------------------- |
| [API 文档](./docs/API.md)          | 全部接口，含请求/响应示例         |
| [架构设计](./docs/ARCHITECTURE.md) | 模块划分 · 认证流程 · 性能优化    |
| [数据库设计](./docs/DATABASE.md)   | 18 张表结构 · 关系 · 枚举         |
| [部署文档](./docs/DEPLOY.md)       | Docker · CI/CD · Nginx · 故障排查 |

---

## 📄 License

MIT — 自由使用、修改、分发。
