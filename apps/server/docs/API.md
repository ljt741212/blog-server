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
  code: number; // 状态码，200 表示成功
  message: string; // 响应消息
  data: any; // 响应数据
}
```

分页接口的 `data` 格式：

```typescript
{
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

## 认证

需要认证的接口需要在请求头中添加：

```
Authorization: Bearer <token>
```

---

## API 列表

### 1. 用户模块 (`/api/users`)

#### 1.1 用户登录

**接口**: `POST /api/users/login`

**描述**: 用户登录，获取 JWT token（无需认证）

**请求体**:

```json
{
  "username": "string",
  "password": "string"
}
```

---

#### 1.2 发送邮箱验证码

**接口**: `POST /api/users/send-email-code`

**描述**: 发送邮箱验证码用于邮箱登录（无需认证）

**请求体**:

```json
{
  "email": "user@example.com"
}
```

| 字段  | 类型   | 必填 | 说明             |
| ----- | ------ | ---- | ---------------- |
| email | string | 是   | 接收验证码的邮箱 |

**注意**: 验证码有效期 5 分钟，同一邮箱 60 秒内只能发送一次。

---

#### 1.3 邮箱验证码登录

**接口**: `POST /api/users/email-login`

**描述**: 使用邮箱和验证码登录（无需认证）

**请求体**:

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

| 字段  | 类型   | 必填 | 说明   |
| ----- | ------ | ---- | ------ |
| email | string | 是   | 邮箱   |
| code  | string | 是   | 验证码 |

---

#### 1.4 获取当前用户信息

**接口**: `GET /api/users/me`

**描述**: 获取当前登录用户信息（可选认证，携带 token 返回完整信息）

**请求头**: `Authorization: Bearer <token>`（可选）

---

#### 1.5 获取超级管理员

**接口**: `GET /api/users/super-admin`

**描述**: 获取超级管理员信息（需认证）

**请求头**: `Authorization: Bearer <token>`

---

#### 1.6 修改密码

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

---

#### 1.7 分页查询用户

**接口**: `GET /api/users/page`

**描述**: 分页查询用户列表（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `current`: 页码（默认: 1）
- `pageSize`: 每页数量（默认: 10）
- `searchValue`: 搜索关键词（可选）

---

#### 1.8 获取用户详情

**接口**: `GET /api/users/:id`

**描述**: 根据 ID 获取用户详情（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 用户 ID

---

#### 1.9 创建用户

**接口**: `POST /api/users`

**描述**: 创建新用户（需认证）。如果请求体中 `id > 0`，则转为更新操作。

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "nickname": "string",
  "phone": "string",
  "wechat": "string",
  "avatar": "string",
  "bio": "string",
  "github": "string",
  "gender": 0,
  "role": 0
}
```

| 字段     | 类型   | 必填 | 说明                         |
| -------- | ------ | ---- | ---------------------------- |
| username | string | 是   | 用户名                       |
| password | string | 是   | 密码（至少 4 位）            |
| email    | string | 是   | 邮箱                         |
| nickname | string | 否   | 昵称                         |
| phone    | string | 否   | 手机号                       |
| wechat   | string | 否   | 微信号                       |
| avatar   | string | 否   | 头像 URL                     |
| bio      | string | 否   | 简介                         |
| github   | string | 否   | GitHub 账号                  |
| gender   | number | 否   | 性别：0-女，1-男             |
| role     | number | 否   | 角色：0-管理员，1-超级管理员 |

---

#### 1.10 更新用户

**接口**: `PUT /api/users/:id`

**描述**: 更新用户信息（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 用户 ID

**请求体**: 同创建用户（所有字段可选）

---

#### 1.11 删除用户

**接口**: `DELETE /api/users/:id`

**描述**: 删除用户（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 用户 ID

---

#### 1.12 删除用户（POST 方式）

**接口**: `POST /api/users/:id/delete`

**描述**: 删除用户，功能同 DELETE（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 用户 ID

---

### 2. 文章模块 (`/api/posts`)

#### 2.1 获取所有已发布文章

**接口**: `GET /api/posts`

**描述**: 获取所有已发布文章列表（无需认证，仅返回 status=published）

**响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "1",
      "title": "文章标题",
      "content": "文章内容",
      "summary": "文章摘要",
      "coverImage": "封面图片URL",
      "publishTime": "2024-01-01T00:00:00.000Z",
      "views": 100,
      "likes": 10,
      "category": {
        "id": 1,
        "name": "分类名称",
        "description": "分类描述"
      },
      "tags": [{ "id": 1, "name": "标签名称", "description": "标签描述" }],
      "author": {
        "id": 1,
        "username": "作者",
        "nickname": "昵称",
        "avatar": "头像URL",
        "bio": "简介"
      },
      "status": "published",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 2.2 分页查询文章（管理）

**接口**: `GET /api/posts/page`

**描述**: 分页查询文章列表，包含所有状态（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `current`: 页码（默认: 1）
- `pageSize`: 每页数量（默认: 10）
- `searchValue`: 搜索关键词（标题/摘要，可选）
- `status`: 文章状态筛选（可选）

---

#### 2.3 获取文章详情

**接口**: `GET /api/posts/:id`

**描述**: 根据 ID 获取已发布文章详情（无需认证，仅返回 status=published）

**路径参数**: `id` - 文章 ID

---

#### 2.4 创建/更新文章

**接口**: `POST /api/posts`

**描述**: 创建或更新文章（需认证）。如果请求体中 `id > 0`，则更新已有文章。

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "id": 1,
  "title": "文章标题",
  "content": "文章内容",
  "summary": "文章摘要",
  "coverImage": "封面图片URL",
  "categoryId": 1,
  "tagIds": [1, 2, 3],
  "status": "draft",
  "publishTime": "2024-01-01T00:00:00.000Z"
}
```

| 字段        | 类型     | 必填 | 说明                         |
| ----------- | -------- | ---- | ---------------------------- |
| id          | number   | 否   | 文章 ID，存在则更新          |
| title       | string   | 是   | 标题（最大 200 字符）        |
| content     | string   | 是   | 内容                         |
| summary     | string   | 否   | 摘要（最大 500 字符）        |
| coverImage  | string   | 否   | 封面图片 URL                 |
| categoryId  | number   | 是   | 分类 ID                      |
| tagIds      | number[] | 否   | 标签 ID 数组                 |
| status      | string   | 否   | draft / published / archived |
| publishTime | string   | 否   | 发布时间（ISO 8601）         |

---

#### 2.5 更新文章状态

**接口**: `PUT /api/posts/:id/status`

**描述**: 更新文章发布状态（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 文章 ID

**请求体**:

```json
{
  "status": "published"
}
```

`status` 取值: `draft` / `published` / `archived`

---

#### 2.6 增加浏览量

**接口**: `PUT /api/posts/:id/views`

**描述**: 增加文章浏览量（无需认证）

**路径参数**: `id` - 文章 ID

---

#### 2.7 增加点赞数

**接口**: `PUT /api/posts/:id/likes`

**描述**: 增加文章点赞数（无需认证）

**路径参数**: `id` - 文章 ID

---

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

---

#### 2.9 删除文章

**接口**: `DELETE /api/posts/:id`

**描述**: 删除文章（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 文章 ID

---

### 3. 分类模块 (`/api/categories`)

#### 3.1 获取所有分类

**接口**: `GET /api/categories`

**描述**: 获取所有分类列表（无需认证）

---

#### 3.2 分页查询分类

**接口**: `GET /api/categories/page`

**描述**: 分页查询分类（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `current`: 页码
- `pageSize`: 每页数量
- `status`: 状态筛选（0-禁用，1-启用）

---

#### 3.3 获取分类详情

**接口**: `GET /api/categories/:id`

**描述**: 根据 ID 获取分类详情（无需认证）

---

#### 3.4 创建/更新分类

**接口**: `POST /api/categories`

**描述**: 创建或更新分类（需认证）。如果请求体中 `id > 0`，则更新已有分类。

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "id": 1,
  "name": "分类名称",
  "description": "分类描述",
  "status": 1
}
```

| 字段        | 类型   | 必填 | 说明                |
| ----------- | ------ | ---- | ------------------- |
| id          | number | 否   | 分类 ID，存在则更新 |
| name        | string | 是   | 分类名称            |
| description | string | 否   | 分类描述            |
| status      | number | 否   | 0-禁用，1-启用      |

---

#### 3.5 部分更新分类

**接口**: `PATCH /api/categories/:id`

**描述**: 部分更新分类信息（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 分类 ID

---

#### 3.6 更新分类状态

**接口**: `PUT /api/categories/:id/status`

**描述**: 更新分类启用/禁用状态（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "status": 1
}
```

`status` 取值: `0`（禁用）/ `1`（启用）

---

#### 3.7 删除分类

**接口**: `DELETE /api/categories/:id`

**描述**: 删除分类（需认证）

**请求头**: `Authorization: Bearer <token>`

---

### 4. 标签模块 (`/api/tags`)

#### 4.1 获取所有标签

**接口**: `GET /api/tags`

**描述**: 获取所有标签列表（无需认证）

---

#### 4.2 分页查询标签

**接口**: `GET /api/tags/page`

**描述**: 分页查询标签（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `current`: 页码
- `pageSize`: 每页数量
- `status`: 状态筛选（0-禁用，1-启用）

---

#### 4.3 获取标签详情

**接口**: `GET /api/tags/:id`

**描述**: 根据 ID 获取标签详情（无需认证）

---

#### 4.4 创建/更新标签

**接口**: `POST /api/tags`

**描述**: 创建或更新标签（需认证）。如果请求体中 `id > 0`，则更新已有标签。

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "id": 1,
  "name": "标签名称",
  "description": "标签描述",
  "status": 1
}
```

| 字段        | 类型   | 必填 | 说明                |
| ----------- | ------ | ---- | ------------------- |
| id          | number | 否   | 标签 ID，存在则更新 |
| name        | string | 是   | 标签名称            |
| description | string | 否   | 标签描述            |
| status      | number | 否   | 0-禁用，1-启用      |

---

#### 4.5 部分更新标签

**接口**: `PATCH /api/tags/:id`

**描述**: 部分更新标签信息（需认证）

**请求头**: `Authorization: Bearer <token>`

**路径参数**: `id` - 标签 ID

---

#### 4.6 删除标签

**接口**: `DELETE /api/tags/:id`

**描述**: 删除标签（需认证）

**请求头**: `Authorization: Bearer <token>`

---

### 5. 评论模块 (`/api/comments`)

#### 5.1 创建评论

**接口**: `POST /api/comments`

**描述**: 创建文章评论（无需认证，登录用户或访客均可）

**请求体**:

```json
{
  "content": "评论内容",
  "postId": 1,
  "parentId": null,
  "userId": 1,
  "visitorId": "visitor_id"
}
```

| 字段      | 类型   | 必填 | 说明                       |
| --------- | ------ | ---- | -------------------------- |
| content   | string | 是   | 评论内容（最大 5000 字符） |
| postId    | number | 是   | 所属文章 ID                |
| parentId  | number | 否   | 父评论 ID（回复时使用）    |
| userId    | number | 否   | 评论用户 ID（登录用户）    |
| visitorId | string | 否   | 访客 ID（游客）            |

---

#### 5.2 分页查询评论（管理）

**接口**: `GET /api/comments/page`

**描述**: 分页查询评论列表（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `current`: 页码
- `pageSize`: 每页数量
- `postId`: 文章 ID 筛选（可选）
- `status`: 状态筛选（可选）
- `searchValue`: 搜索关键词（可选）

---

#### 5.3 根据文章查询评论

**接口**: `GET /api/comments/by-post`

**描述**: 根据文章 ID 查询评论列表（无需认证）

**查询参数**:

- `postId`: 文章 ID（必填）
- `current`: 页码
- `pageSize`: 每页数量
- `approvedOnly`: 是否仅返回已审核评论（可选，默认 false）

---

#### 5.4 更新评论状态

**接口**: `PUT /api/comments/:id/status`

**描述**: 更新评论审核状态（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "status": "approved"
}
```

`status` 取值: `pending` / `approved` / `rejected`

---

#### 5.5 删除评论

**接口**: `DELETE /api/comments/:id`

**描述**: 删除评论（需认证）

**请求头**: `Authorization: Bearer <token>`

---

### 6. 访客模块 (`/api/visitor`)

#### 6.1 记录访客访问

**接口**: `POST /api/visitor/visit`

**描述**: 记录访客访问信息，创建访问日志并更新在线时间（无需认证）

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

---

#### 6.2 心跳

**接口**: `POST /api/visitor/heartbeat`

**描述**: 更新访客在线时间，不创建访问日志。前端可定时调用以保持在线状态（无需认证）

**请求头**:

- `x-visitor-id` 或 `visitor-id`: 访客 ID（可选）

**请求体**: 同 6.1

---

#### 6.3 获取所有访客

**接口**: `GET /api/visitor`

**描述**: 获取所有访客列表（需认证）

**请求头**: `Authorization: Bearer <token>`

---

#### 6.4 在线访客流（SSE）

**接口**: `GET /api/visitor/online/stream`

**描述**: 通过 SSE（Server-Sent Events）实时推送在线访客数据（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `minutes`: 统计最近 N 分钟内在线的访客（默认: 5）

**响应类型**: `text/event-stream`

---

#### 6.5 访客统计

**接口**: `GET /api/visitor/dashboard`

**描述**: 获取访客仪表板统计数据（需认证）

**请求头**: `Authorization: Bearer <token>`

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

**描述**: 上传文件到阿里云 OSS（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求类型**: `multipart/form-data`

**表单字段**:

- `file`: 文件
- `dir`: 上传目录（可选）

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

---

#### 7.2 获取签名 URL

**接口**: `GET /api/oss/sign-url`

**描述**: 获取 OSS 文件的签名访问 URL（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `key`: 文件 key（必填）
- `expires`: 过期时间，秒（可选，默认: 600）

---

#### 7.3 下载文件

**接口**: `GET /api/oss/download`

**描述**: 下载 OSS 文件（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `key`: 文件 key（必填）

**响应类型**: 文件流（`application/octet-stream` 或文件实际类型）

---

### 8. 友链模块 (`/api/friend-links`)

#### 8.1 获取所有友链

**接口**: `GET /api/friend-links`

**描述**: 获取所有友链列表（无需认证）

---

#### 8.2 创建友链

**接口**: `POST /api/friend-links`

**描述**: 创建友链（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "name": "友链名称",
  "url": "https://example.com",
  "description": "友链描述"
}
```

| 字段        | 类型   | 必填 | 说明     |
| ----------- | ------ | ---- | -------- |
| name        | string | 是   | 友链名称 |
| url         | string | 是   | 友链 URL |
| description | string | 否   | 友链描述 |

---

#### 8.3 更新友链

**接口**: `PUT /api/friend-links/:id`

**描述**: 更新友链信息（需认证）

**请求头**: `Authorization: Bearer <token>`

---

#### 8.4 删除友链

**接口**: `DELETE /api/friend-links/:id`

**描述**: 删除友链（需认证）

**请求头**: `Authorization: Bearer <token>`

---

### 9. 留言模块 (`/api/guest-messages`)

#### 9.1 创建留言

**接口**: `POST /api/guest-messages`

**描述**: 创建访客留言（无需认证）

**请求体**:

```json
{
  "content": "留言内容",
  "nickname": "访客昵称",
  "email": "visitor@example.com",
  "userId": 1,
  "visitorId": 1
}
```

| 字段      | 类型   | 必填 | 说明                      |
| --------- | ------ | ---- | ------------------------- |
| content   | string | 是   | 留言内容                  |
| nickname  | string | 否   | 留言者昵称                |
| email     | string | 否   | 留言者邮箱                |
| userId    | number | 否   | 用户 ID（登录用户留言时） |
| visitorId | number | 否   | 访客 ID（游客留言时）     |

---

#### 9.2 获取留言列表

**接口**: `GET /api/guest-messages`

**描述**: 获取留言列表（无需认证）

**查询参数**:

- `current`: 页码
- `pageSize`: 每页数量
- `approvedOnly`: 是否仅返回已审核留言（可选，默认 false）

---

#### 9.3 分页查询留言（管理）

**接口**: `GET /api/guest-messages/page`

**描述**: 分页查询所有留言（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `current`: 页码
- `pageSize`: 每页数量
- `status`: 状态筛选（可选）
- `searchValue`: 搜索关键词（可选）

---

#### 9.4 更新留言状态

**接口**: `PUT /api/guest-messages/:id/status`

**描述**: 更新留言审核状态（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "status": "approved"
}
```

`status` 取值: `pending` / `approved` / `rejected`

---

#### 9.5 删除留言

**接口**: `DELETE /api/guest-messages/:id`

**描述**: 删除留言（需认证）

**请求头**: `Authorization: Bearer <token>`

---

### 10. 公告模块 (`/api/announcements`)

#### 10.1 获取所有公告

**接口**: `GET /api/announcements`

**描述**: 获取所有已发布公告列表（无需认证）

---

#### 10.2 分页查询公告（管理）

**接口**: `GET /api/announcements/page`

**描述**: 分页查询公告列表，包含所有状态（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `current`: 页码
- `pageSize`: 每页数量
- `status`: 状态筛选（可选）

---

#### 10.3 获取公告详情

**接口**: `GET /api/announcements/:id`

**描述**: 根据 ID 获取已发布公告详情（无需认证）

---

#### 10.4 创建/更新公告

**接口**: `POST /api/announcements`

**描述**: 创建或更新公告（需认证）。如果请求体中 `id > 0`，则更新已有公告。

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "id": 1,
  "title": "公告标题",
  "content": "公告内容",
  "status": "published",
  "isTop": false
}
```

| 字段    | 类型    | 必填 | 说明                         |
| ------- | ------- | ---- | ---------------------------- |
| id      | number  | 否   | 公告 ID，存在则更新          |
| title   | string  | 是   | 标题（最大 200 字符）        |
| content | string  | 是   | 内容                         |
| status  | string  | 否   | draft / published / archived |
| isTop   | boolean | 否   | 是否置顶                     |

---

#### 10.5 删除公告

**接口**: `DELETE /api/announcements/:id`

**描述**: 删除公告（需认证）

**请求头**: `Authorization: Bearer <token>`

---

### 11. 更新日志模块 (`/api/changelogs`)

#### 11.1 获取所有更新日志

**接口**: `GET /api/changelogs`

**描述**: 获取所有已发布更新日志列表（无需认证）

---

#### 11.2 分页查询更新日志（管理）

**接口**: `GET /api/changelogs/page`

**描述**: 分页查询更新日志列表，包含所有发布状态（需认证）

**请求头**: `Authorization: Bearer <token>`

**查询参数**:

- `current`: 页码
- `pageSize`: 每页数量
- `type`: 类型筛选（可选）
- `isPublished`: 发布状态筛选（可选）
- `searchValue`: 搜索关键词（可选）

---

#### 11.3 获取更新日志详情

**接口**: `GET /api/changelogs/:id`

**描述**: 根据 ID 获取已发布更新日志详情（无需认证）

---

#### 11.4 创建/更新日志

**接口**: `POST /api/changelogs`

**描述**: 创建或更新更新日志（需认证）。如果请求体中 `id > 0`，则更新已有记录。

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "id": 1,
  "version": "1.0.0",
  "title": "更新标题",
  "content": "更新内容",
  "type": "feature",
  "releaseDate": "2024-01-01",
  "isPublished": true
}
```

| 字段        | 类型    | 必填 | 说明                                      |
| ----------- | ------- | ---- | ----------------------------------------- |
| id          | number  | 否   | 日志 ID，存在则更新                       |
| version     | string  | 是   | 版本号（最大 50 字符）                    |
| title       | string  | 是   | 更新标题（最大 200 字符）                 |
| content     | string  | 是   | 更新内容                                  |
| type        | string  | 否   | feature / improvement / bugfix / security |
| releaseDate | string  | 是   | 发布日期（YYYY-MM-DD）                    |
| isPublished | boolean | 否   | 是否发布                                  |

---

#### 11.5 更新发布状态

**接口**: `POST /api/changelogs/:id/status`

**描述**: 更新日志发布状态（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "isPublished": true
}
```

---

#### 11.6 删除更新日志

**接口**: `DELETE /api/changelogs/:id`

**描述**: 删除更新日志（需认证）

**请求头**: `Authorization: Bearer <token>`

---

### 12. 设置模块 (`/api/setting`)

#### 12.1 获取所有设置

**接口**: `GET /api/setting`

**描述**: 获取聚合设置（包含 SEO、友链、ICP 信息）（需认证）

**请求头**: `Authorization: Bearer <token>`

---

#### 12.2 更新设置

**接口**: `PUT /api/setting`

**描述**: 批量更新设置（包含 SEO、友链、ICP 信息）（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "seo": {
    "title": "网站标题",
    "description": "网站描述",
    "keywords": "关键词",
    "sitemap_url": "sitemap URL",
    "robots": "robots 配置",
    "canonical_url": "canonical URL",
    "og_title": "OG 标题",
    "og_description": "OG 描述",
    "og_image": "OG 图片 URL",
    "schema_markup": "schema 标记",
    "meta_author": "Meta 作者",
    "meta_viewport": "Meta 视口"
  },
  "links": [
    {
      "name": "友链名称",
      "url": "https://example.com",
      "description": "友链描述"
    }
  ],
  "icp": {
    "icp_number": "ICP 备案号",
    "icp_url": "ICP 查询 URL",
    "website_name": "网站名称"
  }
}
```

> **注意**: `links` 为可选字段。如果提供 `links`，将**替换**所有友链（事务性操作）。如果不提供，则保持现有友链不变。

---

### 13. SEO 设置模块 (`/api/seo-settings`)

#### 13.1 获取最新 SEO 设置

**接口**: `GET /api/seo-settings/latest`

**描述**: 获取最新一条 SEO 设置（无需认证）

---

#### 13.2 创建 SEO 设置

**接口**: `POST /api/seo-settings`

**描述**: 创建新的 SEO 设置记录（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**: 同 Setting 模块中的 `seo` 字段

---

### 14. ICP 备案信息模块 (`/api/icp-info`)

#### 14.1 获取最新 ICP 信息

**接口**: `GET /api/icp-info/latest`

**描述**: 获取最新一条 ICP 备案信息（无需认证）

---

#### 14.2 创建 ICP 信息

**接口**: `POST /api/icp-info`

**描述**: 创建新的 ICP 备案信息记录（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "icp_number": "ICP 备案号",
  "icp_url": "ICP 查询 URL",
  "website_name": "网站名称"
}
```

---

### 15. 数据导入导出模块 (`/api/data-transfer`)

> **权限要求**: 该模块所有接口需要**超级管理员**权限（role=1）

#### 15.1 导出数据

**接口**: `GET /api/data-transfer/export`

**描述**: 导出所有业务数据为 ZIP 压缩包（需超级管理员认证）

**请求头**: `Authorization: Bearer <token>`

**响应类型**: ZIP 文件下载

---

#### 15.2 导入数据

**接口**: `POST /api/data-transfer/import`

**描述**: 从 ZIP 压缩包导入数据（需超级管理员认证）

**请求头**: `Authorization: Bearer <token>`

**请求类型**: `multipart/form-data`

**表单字段**:

- `file`: ZIP 文件（最大 1GB）

**查询参数**:

- `mode`: 导入模式，仅支持 `truncate`（清空后导入）

---

### 16. 站点配置模块 (`/api/site-config`)

#### 16.1 获取站点配置

**接口**: `GET /api/site-config`

**描述**: 获取博客站点全局配置（无需认证）

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "siteName": "My Blog",
    "logo": "https://oss.example.com/logo.png",
    "favicon": "https://oss.example.com/favicon.ico"
  }
}
```

---

#### 16.2 更新站点配置

**接口**: `PUT /api/site-config`

**描述**: 更新站点配置（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "siteName": "My Blog",
  "logo": "https://oss.example.com/logo.png",
  "favicon": "https://oss.example.com/favicon.ico",
  "footer": "© 2026 My Blog"
}
```

---

### 17. AI 模块 (`/api/ai`)

#### 17.1 AI 对话

**接口**: `POST /api/ai/chat`

**描述**: 发起 AI 对话，返回流式 SSE 响应（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "messages": [{ "role": "user", "content": "你好" }],
  "configId": 1
}
```

| 字段     | 类型   | 必填 | 说明           |
| -------- | ------ | ---- | -------------- |
| messages | array  | 是   | 对话消息列表   |
| configId | number | 否   | 使用的 AI 配置 |

---

#### 17.2 获取 AI 配置列表

**接口**: `GET /api/ai/configs`

**描述**: 获取所有 AI 模型配置（需认证）

**请求头**: `Authorization: Bearer <token>`

---

#### 17.3 创建/更新配置

**接口**: `POST /api/ai/configs/save`

**描述**: 创建或更新 AI 配置（需认证）

**请求头**: `Authorization: Bearer <token>`

**请求体**:

```json
{
  "id": 1,
  "name": "GPT-4",
  "provider": "openai",
  "model": "gpt-4",
  "apiKey": "sk-xxx",
  "baseUrl": "https://api.openai.com/v1",
  "temperature": 0.7,
  "maxTokens": 4096,
  "isActive": true
}
```

| 字段        | 类型    | 必填 | 说明                     |
| ----------- | ------- | ---- | ------------------------ |
| id          | number  | 否   | 配置 ID，存在则更新      |
| name        | string  | 是   | 配置名称                 |
| provider    | string  | 是   | 提供商（如 openai）      |
| model       | string  | 是   | 模型标识                 |
| apiKey      | string  | 是   | API 密钥                 |
| baseUrl     | string  | 否   | API 基础 URL             |
| temperature | number  | 否   | 温度参数（0-2，默认0.7） |
| maxTokens   | number  | 否   | 最大 token（默认2048）   |
| isActive    | boolean | 否   | 是否启用                 |

---

#### 17.4 删除配置

**接口**: `DELETE /api/ai/configs/:id`

**描述**: 删除 AI 配置（需认证）

**请求头**: `Authorization: Bearer <token>`

---

#### 17.5 切换启用状态

**接口**: `PATCH /api/ai/configs/:id/activate`

**描述**: 切换 AI 配置的启用/禁用状态（需认证）

**请求头**: `Authorization: Bearer <token>`

---

#### 17.6 使用统计

**接口**: `GET /api/ai/usage`

**描述**: 查询 AI API 调用统计（需认证）

**请求头**: `Authorization: Bearer <token>`

---

## 枚举值说明

### Post.status / Announcement.status

- `draft`: 草稿
- `published`: 已发布
- `archived`: 已归档

### Category.status / Tag.status

- `0`: 禁用
- `1`: 启用

### Comment.status / GuestMessage.status

- `pending`: 待审核
- `approved`: 已通过
- `rejected`: 已拒绝

### Changelog.type

- `feature`: 新功能
- `improvement`: 改进
- `bugfix`: 缺陷修复
- `security`: 安全更新

### User.role

- `0`: 管理员
- `1`: 超级管理员

### User.gender

- `0`: 女
- `1`: 男

---

## 错误码说明

| 错误码 | 说明             |
| ------ | ---------------- |
| 200    | 请求成功         |
| 400    | 请求参数错误     |
| 401    | 未授权，需要登录 |
| 403    | 禁止访问         |
| 404    | 资源不存在       |
| 500    | 服务器内部错误   |

## 注意事项

1. 所有时间字段使用 ISO 8601 格式
2. 分页查询参数: `current`（页码）默认 1，`pageSize`（每页数量）默认 10
3. 需要认证的接口必须携带有效的 JWT token
4. 文件上传大小限制由 OSS 配置决定
5. 评论和留言需要审核后才能在前端公开显示
6. 超级管理员接口（data-transfer 等）需要 `role=1`
7. 公共文章/公告/更新日志接口仅返回已发布状态的数据
