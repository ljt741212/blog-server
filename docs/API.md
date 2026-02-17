# API 文档

本文档详细说明了博客后端系统的所有 API 接口。

## 基础信息

- **Base URL**: `http://localhost:3004/api`
- **API 前缀**: `/api`
- **认证方式**: JWT Bearer Token

## 响应格式

所有 API 响应都遵循统一的格式：

```typescript
{
  code: number;        // 状态码，200 表示成功
  message: string;     // 响应消息
  data: any;          // 响应数据
}
```

## 认证

需要认证的接口需要在请求头中添加：

```
Authorization: Bearer <token>
```

## API 列表

### 1. 用户模块 (`/api/users`)

#### 1.1 用户登录

**接口**: `POST /api/users/login`

**描述**: 用户登录，获取 JWT token

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com"
    }
  }
}
```

#### 1.2 获取当前用户信息

**接口**: `GET /api/users/me`

**描述**: 获取当前登录用户信息

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "avatar": "avatar_url"
  }
}
```

#### 1.3 修改密码

**接口**: `PUT /api/users/change-password`

**描述**: 修改当前用户密码（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

#### 1.4 分页查询用户

**接口**: `GET /api/users/page`

**描述**: 分页查询用户列表（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 10）

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [],
    "meta": {
      "totalItems": 100,
      "itemCount": 10,
      "itemsPerPage": 10,
      "totalPages": 10,
      "currentPage": 1
    }
  }
}
```

#### 1.5 创建用户

**接口**: `POST /api/users`

**描述**: 创建新用户（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "avatar": "string"
}
```

#### 1.6 更新用户

**接口**: `PUT /api/users/:id`

**描述**: 更新用户信息（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 用户 ID

**请求体**:
```json
{
  "username": "string",
  "email": "string",
  "avatar": "string"
}
```

#### 1.7 删除用户

**接口**: `DELETE /api/users/:id`

**描述**: 删除用户（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 用户 ID

---

### 2. 文章模块 (`/api/posts`)

#### 2.1 获取所有文章

**接口**: `GET /api/posts`

**描述**: 获取所有已发布的文章列表

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "title": "文章标题",
      "content": "文章内容",
      "summary": "文章摘要",
      "cover": "封面图片URL",
      "views": 100,
      "likes": 10,
      "isTop": false,
      "status": "published",
      "category": {},
      "tags": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2.2 分页查询文章

**接口**: `GET /api/posts/page`

**描述**: 分页查询文章（管理员视图）

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 10）
- `status`: 文章状态（可选）
- `categoryId`: 分类 ID（可选）
- `keyword`: 搜索关键词（可选）

**响应**: 分页数据格式

#### 2.3 获取文章详情

**接口**: `GET /api/posts/:id`

**描述**: 根据 ID 获取文章详情

**路径参数**: `id` - 文章 ID

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "文章标题",
    "content": "文章完整内容",
    "summary": "文章摘要",
    "cover": "封面图片URL",
    "views": 100,
    "likes": 10,
    "isTop": false,
    "status": "published",
    "category": {
      "id": 1,
      "name": "分类名称"
    },
    "tags": [
      {
        "id": 1,
        "name": "标签名称"
      }
    ],
    "author": {
      "id": 1,
      "username": "作者"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2.4 创建/更新文章

**接口**: `POST /api/posts`

**描述**: 创建或更新文章（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "id": 1,                    // 可选，存在则更新，不存在则创建
  "title": "文章标题",
  "content": "文章内容",
  "summary": "文章摘要",
  "cover": "封面图片URL",
  "categoryId": 1,
  "tagIds": [1, 2, 3],
  "status": "draft",          // draft | published
  "isTop": false
}
```

#### 2.5 更新文章状态

**接口**: `PUT /api/posts/:id/status`

**描述**: 更新文章发布状态（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 文章 ID

**请求体**:
```json
{
  "status": "published"       // draft | published
}
```

#### 2.6 增加浏览量

**接口**: `PUT /api/posts/:id/views`

**描述**: 增加文章浏览量

**路径参数**: `id` - 文章 ID

#### 2.7 增加点赞数

**接口**: `PUT /api/posts/:id/likes`

**描述**: 增加文章点赞数

**路径参数**: `id` - 文章 ID

#### 2.8 设置/取消置顶

**接口**: `PUT /api/posts/:id/top`

**描述**: 设置或取消文章置顶（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 文章 ID

**请求体**:
```json
{
  "isTop": true
}
```

#### 2.9 删除文章

**接口**: `DELETE /api/posts/:id`

**描述**: 删除文章（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 文章 ID

---

### 3. 分类模块 (`/api/categories`)

#### 3.1 获取所有分类

**接口**: `GET /api/categories`

**描述**: 获取所有分类列表

#### 3.2 分页查询分类

**接口**: `GET /api/categories/page`

**描述**: 分页查询分类（需认证）

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `status`: 状态筛选

#### 3.3 获取分类详情

**接口**: `GET /api/categories/:id`

**描述**: 根据 ID 获取分类详情

#### 3.4 创建分类

**接口**: `POST /api/categories`

**描述**: 创建分类（需认证）

**请求体**:
```json
{
  "name": "分类名称",
  "description": "分类描述",
  "status": "active"
}
```

#### 3.5 更新分类

**接口**: `PATCH /api/categories/:id`

**描述**: 更新分类信息（需认证）

#### 3.6 更新分类状态

**接口**: `PUT /api/categories/:id/status`

**描述**: 更新分类状态（需认证）

**请求体**:
```json
{
  "status": "active"          // active | inactive
}
```

#### 3.7 删除分类

**接口**: `DELETE /api/categories/:id`

**描述**: 删除分类（需认证）

---

### 4. 标签模块 (`/api/tags`)

#### 4.1 获取所有标签

**接口**: `GET /api/tags`

**描述**: 获取所有标签列表

#### 4.2 分页查询标签

**接口**: `GET /api/tags/page`

**描述**: 分页查询标签（需认证）

#### 4.3 获取标签详情

**接口**: `GET /api/tags/:id`

**描述**: 根据 ID 获取标签详情

#### 4.4 创建标签

**接口**: `POST /api/tags`

**描述**: 创建标签（需认证）

**请求体**:
```json
{
  "name": "标签名称",
  "color": "#ff0000"
}
```

#### 4.5 更新标签

**接口**: `PATCH /api/tags/:id`

**描述**: 更新标签信息（需认证）

#### 4.6 删除标签

**接口**: `DELETE /api/tags/:id`

**描述**: 删除标签（需认证）

---

### 5. 评论模块 (`/api/comments`)

#### 5.1 创建评论

**接口**: `POST /api/comments`

**描述**: 创建文章评论

**请求体**:
```json
{
  "postId": 1,
  "content": "评论内容",
  "parentId": null,          // 可选，回复的评论 ID
  "visitorId": "visitor_id"   // 可选，访客 ID
}
```

#### 5.2 分页查询评论

**接口**: `GET /api/comments/page`

**描述**: 分页查询评论（管理员视图）

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `status`: 状态筛选

#### 5.3 根据文章查询评论

**接口**: `GET /api/comments/by-post`

**描述**: 根据文章 ID 查询评论列表

**查询参数**:
- `postId`: 文章 ID

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "content": "评论内容",
      "status": "approved",
      "visitor": {
        "id": "visitor_id",
        "nickname": "访客昵称"
      },
      "parentId": null,
      "replies": [],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 5.4 更新评论状态

**接口**: `PUT /api/comments/:id/status`

**描述**: 更新评论审核状态（需认证）

**请求体**:
```json
{
  "status": "approved"        // pending | approved | rejected
}
```

#### 5.5 删除评论

**接口**: `DELETE /api/comments/:id`

**描述**: 删除评论（需认证）

---

### 6. 访客模块 (`/api/visitor`)

#### 6.1 记录访客访问

**接口**: `POST /api/visitor/visit`

**描述**: 记录访客访问信息

**请求头**: 
- `x-visitor-id` 或 `visitor-id`: 访客 ID（可选）

**请求体**:
```json
{
  "visitorId": "visitor_id",
  "url": "/posts/1",
  "referrer": "https://example.com",
  "userAgent": "Mozilla/5.0..."
}
```

#### 6.2 获取所有访客

**接口**: `GET /api/visitor`

**描述**: 获取所有访客列表（需认证）

#### 6.3 获取访客统计

**接口**: `GET /api/visitor/dashboard`

**描述**: 获取访客统计数据（需认证）

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalVisitors": 1000,
    "todayVisitors": 50,
    "totalViews": 5000,
    "todayViews": 200
  }
}
```

---

### 7. 文件上传模块 (`/api/oss`)

#### 7.1 上传文件

**接口**: `POST /api/oss/upload`

**描述**: 上传文件到 OSS（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求类型**: `multipart/form-data`

**表单字段**:
- `file`: 文件
- `dir`: 上传目录（可选，默认: uploads）

**响应**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://oss.example.com/uploads/file.jpg",
    "key": "uploads/file.jpg"
  }
}
```

#### 7.2 获取签名 URL

**接口**: `GET /api/oss/sign-url`

**描述**: 获取 OSS 文件的签名 URL（需认证）

**查询参数**:
- `key`: 文件 key
- `expires`: 过期时间（秒，可选，默认: 600）

#### 7.3 下载文件

**接口**: `GET /api/oss/download`

**描述**: 下载 OSS 文件（需认证）

**查询参数**:
- `key`: 文件 key

---

### 8. 友链模块 (`/api/friend-links`)

#### 8.1 获取所有友链

**接口**: `GET /api/friend-links`

**描述**: 获取所有友链列表

#### 8.2 创建友链

**接口**: `POST /api/friend-links`

**描述**: 创建友链（需认证）

**请求体**:
```json
{
  "name": "友链名称",
  "url": "https://example.com",
  "logo": "logo_url",
  "description": "友链描述",
  "status": "active"
}
```

#### 8.3 更新友链

**接口**: `PUT /api/friend-links/:id`

**描述**: 更新友链信息（需认证）

#### 8.4 删除友链

**接口**: `DELETE /api/friend-links/:id`

**描述**: 删除友链（需认证）

---

### 9. 留言模块 (`/api/guest-messages`)

#### 9.1 创建留言

**接口**: `POST /api/guest-messages`

**描述**: 创建访客留言

**请求体**:
```json
{
  "content": "留言内容",
  "visitorId": "visitor_id",
  "nickname": "访客昵称"
}
```

#### 9.2 获取所有留言

**接口**: `GET /api/guest-messages`

**描述**: 获取所有留言列表

#### 9.3 删除留言

**接口**: `DELETE /api/guest-messages/:id`

**描述**: 删除留言（需认证）

---

### 10. 更新日志模块 (`/api/changelogs`)

#### 10.1 获取所有更新日志

**接口**: `GET /api/changelogs`

**描述**: 获取所有更新日志列表

#### 10.2 创建更新日志

**接口**: `POST /api/changelogs`

**描述**: 创建更新日志（需认证）

**请求体**:
```json
{
  "version": "1.0.0",
  "content": "更新内容",
  "releaseDate": "2024-01-01"
}
```

---

### 11. 设置模块 (`/api/settings`)

#### 11.1 获取设置

**接口**: `GET /api/settings`

**描述**: 获取系统设置

#### 11.2 更新设置

**接口**: `PUT /api/settings`

**描述**: 更新系统设置（需认证）

---

### 12. SEO 设置模块 (`/api/seo-settings`)

#### 12.1 获取 SEO 设置

**接口**: `GET /api/seo-settings`

**描述**: 获取 SEO 设置

#### 12.2 更新 SEO 设置

**接口**: `PUT /api/seo-settings`

**描述**: 更新 SEO 设置（需认证）

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

## 注意事项

1. 所有时间字段使用 ISO 8601 格式
2. 分页查询默认页码为 1，每页数量为 10
3. 需要认证的接口必须携带有效的 JWT token
4. 文件上传大小限制由 OSS 配置决定
5. 评论和留言可能需要审核后才能显示
