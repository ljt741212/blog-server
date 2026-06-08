# blog-server 部署文档

## 架构概览

```
GitHub (ljt741212/blog-server)
    │
    │ push to main
    ▼
GitHub Actions ──► Self-hosted Runner (腾讯云 Lighthouse 广州)
                      │
                      ├─ git fetch (从 /opt/blog-repo 本地仓库)
                      ├─ docker build (blog-server:latest)
                      ├─ docker compose up -d
                      ├─ migration:run
                      └─ seed-admin
```

**服务器**：腾讯云 Lighthouse，广州，Ubuntu 22.04  
**容器端口**：3004  
**反向代理**：Nginx `/api/` → localhost:3004

---

## 服务器配置

### Docker 环境

- Docker 26.1.4 + Docker Compose v2.27.1
- Docker Hub 镜像加速器（解决跨境下载问题）：

```json
// /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.xuanyuan.me",
    "https://docker.1ms.run",
    "https://docker.m.daocloud.io",
    "https://docker.nju.edu.cn",
    "https://mirror.ccs.tencentyun.com"
  ],
  "max-concurrent-downloads": 3,
  "max-download-attempts": 10
}
```

### 目录结构

```
/opt/
├── blog-server/           # docker compose 部署目录
│   ├── docker-compose.yml
│   └── .env               # 环境变量（数据库密码、JWT 密钥等）
│
└── blog-repo/             # 源码仓库（Runner 构建用）
    └── ...                # git clone 的完整项目
```

### docker-compose.yml

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: blog-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_DATABASE:-blog_db}
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test:
        [
          'CMD',
          'mysqladmin',
          'ping',
          '-h',
          'localhost',
          '-u',
          'root',
          '-p${DB_PASSWORD}',
        ]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - blog_network

  app:
    image: blog-server:latest # 本地构建的镜像，不使用远程 registry
    container_name: blog-server
    restart: always
    ports:
      - '3004:3004'
    environment:
      DB_HOST: mysql
      DB_PORT: ${DB_PORT:-3306}
      DB_USERNAME: ${DB_USERNAME:-root}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_DATABASE: ${DB_DATABASE:-blog_db}
      DB_SYNCHRONIZE: ${DB_SYNCHRONIZE:-false}
      DB_LOGGING: ${DB_LOGGING:-error}
      JWT_SECRET: ${JWT_SECRET}
      PORT: ${PORT:-3004}
      NODE_ENV: ${NODE_ENV:-production}
      CORS_ORIGIN: ${CORS_ORIGIN}
      EMAIL_HOST: ${EMAIL_HOST}
      EMAIL_PORT: ${EMAIL_PORT:-465}
      EMAIL_SECURE: ${EMAIL_SECURE:-true}
      EMAIL_USER: ${EMAIL_USER}
      EMAIL_PASS: ${EMAIL_PASS}
      EMAIL_FROM: ${EMAIL_FROM}
      OSS_REGION: ${OSS_REGION}
      OSS_ACCESS_KEY_ID: ${OSS_ACCESS_KEY_ID}
      OSS_ACCESS_KEY_SECRET: ${OSS_ACCESS_KEY_SECRET}
      OSS_BUCKET: ${OSS_BUCKET}
      SEED_ADMIN_USERNAME: ${SEED_ADMIN_USERNAME}
      SEED_ADMIN_EMAIL: ${SEED_ADMIN_EMAIL}
      SEED_ADMIN_PASSWORD: ${SEED_ADMIN_PASSWORD}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - blog_network

volumes:
  mysql_data:

networks:
  blog_network:
```

### .env 配置项

**数据库**：

| 变量             | 说明                                 | 默认值                   |
| ---------------- | ------------------------------------ | ------------------------ |
| `DB_HOST`        | MySQL 主机                           | `mysql`（Docker 服务名） |
| `DB_PORT`        | MySQL 端口                           | `3306`                   |
| `DB_USERNAME`    | MySQL 用户名                         | `root`                   |
| `DB_PASSWORD`    | MySQL root 密码                      | 必填                     |
| `DB_DATABASE`    | 数据库名                             | `blog_db`                |
| `DB_SYNCHRONIZE` | 自动同步表结构（生产应设为 `false`） | `false`                  |
| `DB_LOGGING`     | 数据库日志级别                       | `error`                  |

**应用**：

| 变量          | 说明            | 默认值                         |
| ------------- | --------------- | ------------------------------ |
| `JWT_SECRET`  | JWT 签名密钥    | 必填（`openssl rand -hex 64`） |
| `PORT`        | 应用端口        | `3004`                         |
| `NODE_ENV`    | 运行环境        | `production`                   |
| `CORS_ORIGIN` | CORS 允许的域名 | `https://your-domain.com`      |

**邮箱（QQ 邮箱 SMTP）**：

| 变量           | 说明         | 默认值                    |
| -------------- | ------------ | ------------------------- |
| `EMAIL_HOST`   | SMTP 服务器  | `smtp.qq.com`             |
| `EMAIL_PORT`   | SMTP 端口    | `465`                     |
| `EMAIL_SECURE` | 是否启用 SSL | `true`                    |
| `EMAIL_USER`   | 发件邮箱     | 必填                      |
| `EMAIL_PASS`   | SMTP 授权码  | 必填（QQ 邮箱设置中获取） |
| `EMAIL_FROM`   | 发件人地址   | 同 EMAIL_USER             |

**阿里云 OSS**：

| 变量                    | 说明             | 示例             |
| ----------------------- | ---------------- | ---------------- |
| `OSS_REGION`            | OSS 区域         | `oss-cn-beijing` |
| `OSS_ACCESS_KEY_ID`     | AccessKey ID     | 必填             |
| `OSS_ACCESS_KEY_SECRET` | AccessKey Secret | 必填             |
| `OSS_BUCKET`            | Bucket 名称      | `my-blog`        |

**初始化种子数据**：

| 变量                  | 说明             | 默认值  |
| --------------------- | ---------------- | ------- |
| `SEED_ADMIN_USERNAME` | 初始管理员用户名 | `admin` |
| `SEED_ADMIN_EMAIL`    | 初始管理员邮箱   | 必填    |
| `SEED_ADMIN_PASSWORD` | 初始管理员密码   | 必填    |

**AI 加密**：

| 变量             | 说明                | 默认值                         |
| ---------------- | ------------------- | ------------------------------ |
| `ENCRYPTION_KEY` | AI API 密钥加密密钥 | 必填（`openssl rand -hex 32`） |

---

## Self-hosted Runner

### 为什么用自托管 Runner

服务器到 GitHub 的国际带宽极低（~25KB/s），无法通过 GitHub-hosted Runner 推送/拉取 Docker 镜像。在服务器本地运行 Runner，构建镜像时不产生跨境流量。

### 容器启动命令

```bash
docker run -d --name github-runner \
  --network host \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /opt/blog-server:/opt/blog-server \
  -v /opt/blog-repo:/opt/blog-repo \
  -e RUNNER_NAME=blog-runner \
  -e RUNNER_TOKEN=<registration_token> \
  -e REPO_URL=https://github.com/ljt741212/blog-server \
  myoung34/github-runner:latest
```

**关键配置说明：**

- `--network host`：共享主机网络栈，避免容器内无法访问 GitHub 的问题
- `-v /var/run/docker.sock`：允许容器内执行 Docker 命令（Docker-in-Docker）
- `-v /opt/blog-server`：docker compose 目录
- `-v /opt/blog-repo`：源码目录，避免 workflow 内 `git clone` 跨境超时
- Runner 镜像 `myoung34/github-runner` 通过 Docker Hub 镜像加速器下载

### 获取 Registration Token

Runner token 有效期 1 小时，过期后需要重新获取：

```bash
curl -s -X POST \
  -H "Authorization: token <github_pat>" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/ljt741212/blog-server/actions/runners/registration-token"
```

### 首次初始化 /opt/blog-repo

```bash
cd /opt
git clone --depth 1 https://github.com/ljt741212/blog-server.git blog-repo
```

GitHub 可能间歇性不可达，如果 clone 超时就重试，一般总能成功。

---

## CI/CD Workflow

### 触发条件

```yaml
on:
  push:
    branches: [main] # 推送到 main 分支
  workflow_dispatch: # 手动触发
```

### 部署流程（deploy.yml）

```
Step 1: Checkout
  → cd /opt/blog-repo
  → git fetch origin main
  → git reset --hard origin/main
  → 如果 GitHub 不可达，此步骤会失败，需重试

Step 2: Build and deploy
  → cd /opt/blog-repo
  → docker build -t blog-server:latest .
  → cd /opt/blog-server
  → docker compose up -d --remove-orphans
  → sleep 15（等待 app 启动）
  → docker compose exec app migration:run   （数据库迁移）
  → docker compose exec app seed-admin      （创建管理员）
  → docker image prune -f                   （清理旧镜像）
  → docker compose ps + logs                （输出状态）
```

### 不使用 actions/checkout 的原因

`actions/checkout@v4` 需要 Runner 从 GitHub 下载 action 本身，再执行 `git clone`。两步都依赖国际网络，容易超时。改用本地仓库 `/opt/blog-repo` + `git fetch` 只拉取增量，大幅降低失败率。

---

## Dockerfile

### 多阶段构建

```
Stage 1 (builder): node:22-alpine
  → pnpm fetch (利用 lockfile 缓存)
  → pnpm install (devDependencies, 构建用)
  → nest build + tsc-alias

Stage 2 (runner): node:22-alpine
  → pnpm install --prod (仅生产依赖)
  → 复制 dist/ 和 database/ 目录
  → CMD ["node", "dist/main.js"]
```

### TypeScript 编译注意事项

- `tsconfig.json` 中 `rootDir: "src"` 意味着输出结构不包含 `src/` 前缀
- 编译后：`src/main.ts` → `dist/main.js`（不是 `dist/src/main.js`）
- 如果修改了 tsconfig，务必同步检查 Dockerfile CMD、package.json `start:prod`、数据源路径

---

## 部署验证

### 1. 检查容器状态

```bash
docker ps --filter name=blog-server
docker logs blog-server --tail 20
```

正常日志末尾应为：`Nest application successfully started`

### 2. 测试 API

```bash
# 健康检查（替换为你的服务器 IP）
curl http://<服务器IP>:3004/api/

# 登录
curl -X POST http://<服务器IP>:3004/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<密码>"}'

# 带 token 访问受保护接口
curl http://<服务器IP>:3004/api/users/me \
  -H "Authorization: Bearer <token>"
```

### 3. 通过域名测试（如已配置）

```bash
curl https://your-domain.com/api/
```

### 4. 查看 GitHub Actions 日志

访问 https://github.com/ljt741212/blog-server/actions ，点击最新的 workflow run。

---

## 故障排查

### 容器重启循环

```bash
docker logs blog-server --tail 50
```

常见原因：

- `MODULE_NOT_FOUND`：依赖缺失，检查 `package.json` 中是否缺少运行时依赖（`@types/xxx` 只是类型声明，运行时需要对应的包名）
- 路径错误：`dist/src/main.js` vs `dist/main.js`，确认 tsconfig.json 的 `rootDir` 设置
- 数据库连接失败：检查 `DB_HOST` 是否为 `mysql`（容器内网络通过 service name 访问）

### Runner 不接任务

```bash
docker logs github-runner --tail 10
```

- 确认 Runner 连接到 GitHub：日志中应有 `Listening for Jobs`
- 如果 Runner 离线，检查 token 是否过期，重新注册

### git fetch 失败

服务器到 GitHub 间歇性不可达。等几分钟后手动重试即可：

```bash
cd /opt/blog-repo && git fetch origin main
```

或者在 GitHub Actions 页面手动 Re-run job。

### 数据库迁移失败

```bash
# 查看迁移状态
docker compose exec app node node_modules/typeorm/cli.js migration:show -d dist/config/data-source.js

# 手动运行迁移
docker compose exec app node node_modules/typeorm/cli.js migration:run -d dist/config/data-source.js
```
