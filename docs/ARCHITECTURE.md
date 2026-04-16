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
│  │ 路由层   │  │ 中间件层  │  │ 守卫层   │              │
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
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  MySQL   │  │ 阿里云OSS │  │  Redis   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 分层架构

项目采用经典的三层架构：

1. **表现层 (Presentation Layer)**
   - Controllers: 处理 HTTP 请求和响应
   - DTOs: 数据传输对象，定义请求和响应的数据结构
   - Guards: 路由守卫，处理认证和授权

2. **业务逻辑层 (Business Logic Layer)**
   - Services: 业务逻辑处理
   - Entities: 领域实体模型
   - Interceptors: 拦截器，处理响应转换、日志等

3. **数据访问层 (Data Access Layer)**
   - TypeORM: ORM 框架
   - Repositories: 数据访问抽象
   - Migrations: 数据库迁移

## 技术栈

### 核心框架

- **NestJS**: 基于 Express/Fastify 的 Node.js 框架
  - 模块化设计
  - 依赖注入
  - 装饰器支持
  - TypeScript 原生支持

### 数据库

- **TypeORM**: ORM 框架
  - 实体关系映射
  - 数据库迁移
  - 查询构建器
  - 事务支持

- **MySQL**: 关系型数据库
  - 主数据存储
  - ACID 事务支持

### 认证与安全

- **JWT (JSON Web Token)**: 无状态认证
- **Passport**: 认证中间件
- **bcryptjs**: 密码加密

### 文件存储

- **阿里云 OSS**: 对象存储服务
  - 文件上传
  - 文件访问
  - CDN 加速

### 开发工具

- **TypeScript**: 类型安全的 JavaScript
- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **Husky**: Git hooks 管理
- **Jest**: 单元测试框架

## 模块设计

### 模块划分原则

1. **单一职责**: 每个模块只负责一个业务领域
2. **高内聚低耦合**: 模块内部紧密相关，模块间依赖最小
3. **可扩展性**: 易于添加新功能和模块

### 核心模块

#### 1. 用户模块 (User Module)

**职责**:
- 用户注册和登录
- 用户信息管理
- 密码管理
- JWT token 生成和验证

**关键文件**:
- `user.controller.ts`: 处理用户相关 HTTP 请求
- `user.service.ts`: 用户业务逻辑
- `user.entity.ts`: 用户实体定义
- `user.dto.ts`: 用户数据传输对象

#### 2. 文章模块 (Post Module)

**职责**:
- 文章的 CRUD 操作
- 文章状态管理（草稿/发布）
- 文章置顶功能
- 浏览量统计
- 点赞功能

**关键文件**:
- `post.controller.ts`: 文章 API 控制器
- `post.service.ts`: 文章业务逻辑
- `post.entity.ts`: 文章实体
- `post.dto.ts`: 文章 DTO

#### 3. 分类模块 (Category Module)

**职责**:
- 分类的 CRUD 操作
- 分类状态管理
- 分类与文章的关联

#### 4. 标签模块 (Tag Module)

**职责**:
- 标签的 CRUD 操作
- 标签与文章的多对多关系
- 标签颜色管理

#### 5. 评论模块 (Comment Module)

**职责**:
- 评论的创建和管理
- 评论审核机制
- 评论回复（父子关系）
- 评论状态管理

#### 6. 访客模块 (Visitor Module)

**职责**:
- 访客信息记录
- 访问日志记录
- 访客统计分析

#### 7. 文件上传模块 (OSS Module)

**职责**:
- 文件上传到 OSS
- 文件访问 URL 生成
- 文件下载

### 公共模块

#### 1. Common Module

**包含**:
- Decorators: 自定义装饰器（如 `@CurrentUser`, `@Bypass`）
- Guards: 路由守卫（JWT 认证守卫）
- Interceptors: 拦截器（响应转换拦截器）
- Pagination: 分页工具
- Constants: 常量定义
- Models: 通用数据模型

#### 2. Shared Module

**包含**:
- Database Module: 数据库配置和连接
- Entities Module: 实体注册

## 数据库设计

### 设计原则

1. **规范化**: 遵循数据库设计范式，减少数据冗余
2. **索引优化**: 为常用查询字段添加索引
3. **外键约束**: 保证数据完整性
4. **软删除**: 使用 `deletedAt` 字段实现软删除

### 核心表结构

#### User (用户表)

```sql
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  avatar VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME NULL
);
```

#### Post (文章表)

```sql
CREATE TABLE post (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(500),
  cover VARCHAR(255),
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  isTop BOOLEAN DEFAULT FALSE,
  status ENUM('draft', 'published') DEFAULT 'draft',
  categoryId INT,
  authorId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME NULL,
  FOREIGN KEY (categoryId) REFERENCES category(id),
  FOREIGN KEY (authorId) REFERENCES user(id)
);
```

#### Category (分类表)

```sql
CREATE TABLE category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME NULL
);
```

#### Tag (标签表)

```sql
CREATE TABLE tag (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME NULL
);
```

#### PostTag (文章标签关联表)

```sql
CREATE TABLE post_tag (
  postId INT NOT NULL,
  tagId INT NOT NULL,
  PRIMARY KEY (postId, tagId),
  FOREIGN KEY (postId) REFERENCES post(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tag(id) ON DELETE CASCADE
);
```

#### Comment (评论表)

```sql
CREATE TABLE comment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  postId INT NOT NULL,
  parentId INT NULL,
  visitorId VARCHAR(100),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME NULL,
  FOREIGN KEY (postId) REFERENCES post(id) ON DELETE CASCADE,
  FOREIGN KEY (parentId) REFERENCES comment(id) ON DELETE CASCADE
);
```

#### Visitor (访客表)

```sql
CREATE TABLE visitor (
  id VARCHAR(100) PRIMARY KEY,
  fingerprint VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### VisitorLog (访客访问日志表)

```sql
CREATE TABLE visitor_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visitorId VARCHAR(100) NOT NULL,
  url VARCHAR(500),
  referrer VARCHAR(500),
  userAgent VARCHAR(500),
  ip VARCHAR(50),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visitorId) REFERENCES visitor(id) ON DELETE CASCADE
);
```

### 关系说明

1. **User ↔ Post**: 一对多（一个用户可写多篇文章）
2. **Category ↔ Post**: 一对多（一个分类包含多篇文章）
3. **Post ↔ Tag**: 多对多（一篇文章可有多个标签，一个标签可属于多篇文章）
4. **Post ↔ Comment**: 一对多（一篇文章可有多个评论）
5. **Comment ↔ Comment**: 自关联（评论可回复评论）
6. **Visitor ↔ VisitorLog**: 一对多（一个访客可有多次访问记录）

## 认证与授权

### JWT 认证流程

```
1. 用户登录
   POST /api/users/login
   ↓
2. 验证用户名和密码
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

### JWT 守卫实现

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    
    if (!token) {
      throw new UnauthorizedException('未提供登录凭证');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = { id: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException('登录已失效');
    }
  }
}
```

### 使用方式

```typescript
@Controller('posts')
export class PostController {
  @Post()
  @UseGuards(JwtAuthGuard)  // 使用守卫保护路由
  create(@Body() dto: CreatePostDto) {
    // 需要认证才能访问
  }
}
```

## API 设计

### RESTful 规范

遵循 RESTful API 设计规范：

- **GET**: 获取资源
- **POST**: 创建资源
- **PUT**: 完整更新资源
- **PATCH**: 部分更新资源
- **DELETE**: 删除资源

### URL 命名规范

- 使用名词复数形式: `/api/posts`, `/api/users`
- 使用连字符分隔: `/api/friend-links`
- 嵌套资源: `/api/posts/:id/comments`

### 响应格式

统一响应格式：

```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

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

### 全局异常过滤器

使用 NestJS 的异常过滤器统一处理错误：

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 统一错误响应格式
  }
}
```

### 错误码定义

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `422`: 数据验证失败
- `500`: 服务器内部错误

### 数据验证

使用 `class-validator` 进行数据验证：

```typescript
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
```

## 日志系统

### 日志级别

- **ERROR**: 错误日志
- **WARN**: 警告日志
- **INFO**: 信息日志
- **DEBUG**: 调试日志

### 日志记录

- 请求日志: 记录所有 HTTP 请求
- 错误日志: 记录异常信息
- 业务日志: 记录关键业务操作

### 日志格式

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "context": "UserService",
  "userId": 1
}
```

## 性能优化

### 数据库优化

1. **索引优化**: 为常用查询字段添加索引
2. **查询优化**: 使用 `select` 指定查询字段
3. **关联查询**: 合理使用 `relations` 避免 N+1 问题
4. **分页查询**: 使用分页避免一次性加载大量数据

### 缓存策略

- Redis 缓存（可选）
- 查询结果缓存
- 静态资源缓存

### 代码优化

1. **异步处理**: 使用 `async/await` 处理异步操作
2. **批量操作**: 使用批量插入/更新减少数据库交互
3. **懒加载**: 合理使用关联查询的懒加载

## 安全考虑

1. **密码加密**: 使用 bcrypt 加密密码
2. **SQL 注入防护**: 使用 TypeORM 的参数化查询
3. **XSS 防护**: 输入验证和输出转义
4. **CSRF 防护**: 使用 CSRF token（如需要）
5. **速率限制**: API 请求频率限制（如需要）
6. **HTTPS**: 生产环境使用 HTTPS

## 扩展性

### 水平扩展

- 无状态设计，支持多实例部署
- 使用负载均衡器分发请求
- 数据库读写分离（如需要）

### 功能扩展

- 模块化设计，易于添加新功能
- 插件化架构（如需要）
- 微服务拆分（如需要）

## 监控与运维

### 健康检查

- 提供健康检查接口
- 数据库连接检查
- 外部服务依赖检查

### 性能监控

- API 响应时间监控
- 数据库查询性能监控
- 错误率监控

### 日志收集

- 集中式日志收集
- 日志分析和告警
