# blog-server 部署文档

## 架构概览

```
GitHub (ljt741212/blog-server)
    │
    │ push to main
    ▼
GitHub Actions ──► Self-hosted Runner (阿里云 Lighthouse 上海)
                      │
                      ├─ git fetch (从 /opt/blog-repo 本地仓库)
                      ├─ docker build (blog-server:latest，含 .npmrc 国内镜像)
                      ├─ docker compose up -d
                      ├─ migration:run
                      └─ seed-admin
```

**服务器**：阿里云 Lighthouse，上海，CentOS 8.2  
**公网 IP**：`<your-server-ip>`  
**容器端口**：3004  
**反向代理**：Nginx `:80` → `127.0.0.1:3004`

---

## 服务器初始化

### 1. 系统基础配置

CentOS 8 已 EOL，需要先修复仓库源：

```bash
# 修复 CentOS 8 EOL 仓库
sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*
sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*

# 更新 CA 证书（解决 SSL 连接问题）
dnf update -y ca-certificates openssl curl
```

配置国内 DNS（加快域名解析）：

```bash
cat > /etc/resolv.conf << 'EOF'
nameserver 223.5.5.5
nameserver 223.6.6.6
nameserver 114.114.114.114
EOF
```

### 2. 安装基础软件

```bash
# Docker
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable docker --now

# Nginx
dnf install -y nginx
systemctl enable nginx --now

# Git
dnf install -y git

# Certbot（SSL 证书）
dnf install -y epel-release
dnf install -y certbot python3-certbot-nginx
```

### 3. 配置 Docker 镜像加速器

> **关键**：国内服务器无法直接访问 Docker Hub（registry-1.docker.io），必须配置镜像加速器。

`/etc/docker/daemon.json`：

```json
{
  "registry-mirrors": [
    "https://docker.xuanyuan.me",
    "https://docker.1ms.run",
    "https://docker.m.daocloud.io",
    "https://docker.nju.edu.cn",
    "https://mirror.ccs.tencentyun.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

配置后重启 Docker：

```bash
systemctl restart docker
```

> **说明**：这些镜像代理同时支持 Docker Hub 官方镜像和社区镜像。`docker pull myoung34/github-runner` 之类的社区镜像也会自动通过代理拉取。腾讯云镜像 `mirror.ccs.tencentyun.com` 作为官方镜像的兜底，前面的社区代理负责社区镜像。

### 4. npm 国内镜像

构建 Docker 镜像时需要下载 npm 包，在项目根目录创建 `.npmrc`：

```
registry=https://registry.npmmirror.com/
```

Dockerfile 需要将 `.npmrc` 复制到镜像中（见下方 Dockerfile 配置）。

---

## 目录结构

```
/opt/
├── blog-server/           # docker compose 部署目录
│   ├── docker-compose.yml
│   └── .env               # 环境变量
│
├── blog-repo/             # 源码仓库（Runner 构建用）
│   ├── .npmrc             # npm 国内镜像配置
│   └── ...                # git clone 的完整项目
│
└── actions-runner/        # GitHub Runner 工作目录
```

---

## docker-compose.yml

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
    image: blog-server:latest # 本地构建，不使用远程 registry
    container_name: blog-server
    restart: always
    ports:
      - '3004:3004'
    environment:
      DB_HOST: mysql # Docker 内部网络走 service name，不是 localhost
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

---

## .env 配置项

### 数据库

| 变量             | 说明                               | 默认值                                           |
| ---------------- | ---------------------------------- | ------------------------------------------------ |
| `DB_HOST`        | MySQL 主机                         | **`mysql`**（Docker 服务名，**不是 localhost**） |
| `DB_PORT`        | MySQL 端口                         | `3306`                                           |
| `DB_USERNAME`    | MySQL 用户名                       | `root`                                           |
| `DB_PASSWORD`    | MySQL root 密码                    | 必填                                             |
| `DB_DATABASE`    | 数据库名                           | `blog_db`                                        |
| `DB_SYNCHRONIZE` | 自动同步表结构（生产必须 `false`） | `false`                                          |
| `DB_LOGGING`     | 数据库日志级别                     | `error`                                          |

> **警告**：`DB_HOST` 在 Docker 环境下必须是 `mysql`（docker-compose 的 service name），不是 `localhost`。写成 `localhost` 会导致容器无法连接数据库。

### 应用

| 变量          | 说明            | 备注                         |
| ------------- | --------------- | ---------------------------- |
| `JWT_SECRET`  | JWT 签名密钥    | 必填，`openssl rand -hex 64` |
| `PORT`        | 应用端口        | `3004`                       |
| `NODE_ENV`    | 运行环境        | `production`                 |
| `CORS_ORIGIN` | CORS 允许的域名 | 必填                         |

### 邮箱（QQ 邮箱 SMTP）

| 变量           | 说明         | 默认值                                              |
| -------------- | ------------ | --------------------------------------------------- |
| `EMAIL_HOST`   | SMTP 服务器  | `smtp.qq.com`                                       |
| `EMAIL_PORT`   | SMTP 端口    | `465`                                               |
| `EMAIL_SECURE` | 是否启用 SSL | `true`                                              |
| `EMAIL_USER`   | 发件邮箱     | 必填                                                |
| `EMAIL_PASS`   | SMTP 授权码  | 必填                                                |
| `EMAIL_FROM`   | 发件人地址   | 必填（docker-compose 中引用了此变量，缺失会报警告） |

### 阿里云 OSS（必填）

| 变量                    | 说明             | 备注                          |
| ----------------------- | ---------------- | ----------------------------- |
| `OSS_REGION`            | OSS 区域         | **必填**，如 `oss-cn-beijing` |
| `OSS_ACCESS_KEY_ID`     | AccessKey ID     | **必填**                      |
| `OSS_ACCESS_KEY_SECRET` | AccessKey Secret | **必填**                      |
| `OSS_BUCKET`            | Bucket 名称      | **必填**                      |

> **重要**：OSS 配置项**必须全部填写**，即使暂时不用 OSS 功能也要填占位值。应用启动时 `OssService` 构造函数会校验四个配置项是否为空，任一为空都会抛出 `BadRequestException: OSS 环境变量未配置完整` 导致容器反复重启。不要留空。

### 种子管理员

| 变量                  | 说明             | 默认值  |
| --------------------- | ---------------- | ------- |
| `SEED_ADMIN_USERNAME` | 初始管理员用户名 | `admin` |
| `SEED_ADMIN_EMAIL`    | 初始管理员邮箱   | 必填    |
| `SEED_ADMIN_PASSWORD` | 初始管理员密码   | 必填    |

### AI 加密

| 变量             | 说明                | 备注                         |
| ---------------- | ------------------- | ---------------------------- |
| `ENCRYPTION_KEY` | AI API 密钥加密密钥 | 必填，`openssl rand -hex 32` |

---

## Nginx 配置

CentOS 8 使用 `/etc/nginx/conf.d/` 目录。创建 `/etc/nginx/conf.d/blog-server.conf`：

```nginx
server {
    listen 80;
    server_name www.cx330.cloud cx330.cloud;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

验证并重载：

```bash
nginx -t && systemctl reload nginx
```

### SSL 证书

> **前置条件**：域名 DNS 已解析到服务器 IP，否则 certbot 验证会失败。

```bash
certbot --nginx -d www.cx330.cloud -d cx330.cloud
```

证书会自动续期（certbot 安装了 systemd timer）。

---

## Lighthouse 防火墙

在阿里云控制台 → 轻量应用服务器 → 防火墙，开放以下端口：

| 端口 | 协议 | 说明                     |
| ---- | ---- | ------------------------ |
| 22   | TCP  | SSH                      |
| 80   | TCP  | HTTP                     |
| 443  | TCP  | HTTPS                    |
| 3004 | TCP  | 应用端口（调试用，可选） |

---

## Dockerfile 国内适配

原始 Dockerfile 中的 `pnpm fetch` 会直接从 `registry.npmjs.org` 下载，在国内极慢（单个包耗时 10 秒以上）。需要添加 `.npmrc` 文件并复制到镜像中。

项目根目录创建 `.npmrc`：

```
registry=https://registry.npmmirror.com/
```

修改 Dockerfile，在 `pnpm fetch` 之前复制 `.npmrc`：

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 将 .npmrc 放在 pnpm-lock 之前，确保使用国内镜像
COPY .npmrc ./
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm fetch --frozen-lockfile

COPY . .
RUN pnpm install --frozen-lockfile --offline
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 生产阶段也需要 .npmrc
COPY .npmrc ./
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database

EXPOSE 3004

CMD ["node", "dist/main.js"]
```

> **注意**：`.npmrc` 已在 `.gitignore` 中，生产构建时 Dockerfile 需要的 `.npmrc` 必须存在于构建上下文中。可以将 `.npmrc` 加入 `.dockerignore` 的白名单，或直接在服务器上 `/opt/blog-repo/` 创建。

---

## Self-hosted Runner

### 为什么用自托管 Runner

国内服务器到 GitHub 的国际带宽极低且不稳定。GitHub-hosted Runner 无法直接访问国内服务器。在服务器本地运行 Runner，构建镜像时不产生跨境流量。

### 镜像说明

使用 `myoung34/github-runner` Docker 镜像（社区维护的 GitHub Actions Runner 镜像）。

> **注意**：这是 Docker Hub 社区镜像，不是官方镜像。阿里云镜像加速器（`registry.cn-hangzhou.aliyuncs.com`）只缓存 Docker Hub **官方镜像**，不会缓存此社区镜像。必须使用 `daemon.json` 中配置的社区代理（如 `docker.xuanyuan.me`、`docker.1ms.run`）来拉取。

### 容器启动命令

```bash
# 获取 runner 注册 token（有效期 1 小时）
REG_TOKEN=$(curl -s -X POST \
  -H "Authorization: token <github_pat>" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/ljt741212/blog-server/actions/runners/registration-token \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 启动 runner 容器
docker run -d \
  --name github-runner \
  --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /opt/blog-repo:/opt/blog-repo \
  -v /opt/blog-server:/opt/blog-server \
  -e REPO_URL=https://github.com/ljt741212/blog-server \
  -e RUNNER_TOKEN="$REG_TOKEN" \
  -e RUNNER_NAME="blog-server-runner" \
  -e RUNNER_LABELS="self-hosted" \
  -e RUNNER_WORKDIR="/tmp/runner/work" \
  myoung34/github-runner:latest
```

### 环境变量说明

| 变量             | 说明                          | 示例                                       |
| ---------------- | ----------------------------- | ------------------------------------------ |
| `REPO_URL`       | GitHub 仓库 URL               | `https://github.com/ljt741212/blog-server` |
| `RUNNER_TOKEN`   | Runner 注册 token             | 通过 GitHub API 获取，有效期 1 小时        |
| `RUNNER_NAME`    | Runner 名称（在 GitHub 显示） | `blog-server-runner`                       |
| `RUNNER_LABELS`  | Runner 标签                   | `self-hosted`                              |
| `RUNNER_WORKDIR` | Runner 工作目录               | `/tmp/runner/work`                         |

> **常见错误**：镜像使用的环境变量是 `REPO_URL`，**不是** `RUNNER_REPOSITORY_URL`。写错变量名会导致 `Invalid configuration provided for url` 错误。

### 获取 Registration Token

```bash
curl -s -X POST \
  -H "Authorization: token <github_pat>" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/ljt741212/blog-server/actions/runners/registration-token"
```

Token 有效期 1 小时。Runner 容器因故重建时需要重新获取 token。

### 验证 Runner 状态

```bash
docker logs github-runner --tail 10
```

正常日志末尾：

```
√ Connected to GitHub
√ Runner successfully added
√ Settings Saved
Current runner version: '2.335.1'
Listening for Jobs
```

### 首次初始化 /opt/blog-repo

```bash
cd /opt
git clone https://github.com/ljt741212/blog-server.git blog-repo
```

> GitHub 可能间歇性不可达，clone 超时重试即可。如果 HTTPS clone 反复失败，可以用 `ghp_xxx@github.com/...` 格式的 token URL 提升成功率。

---

## CI/CD Workflow

### 触发条件

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch: # 手动触发
```

### 部署流程（deploy.yml）

```
Step 1: Checkout
  → cd /opt/blog-repo
  → git fetch origin main
  → git reset --hard origin/main

Step 2: Build and deploy
  → docker build -t blog-server:latest .
  → cd /opt/blog-server && docker compose up -d --remove-orphans
  → sleep 15（等待 app 启动 + MySQL health check）
  → docker compose exec app migration:run
  → docker compose exec app seed-admin
  → docker image prune -f（清理旧镜像）
  → docker compose ps + logs（输出状态）
```

### 不使用 actions/checkout 的原因

`actions/checkout@v4` 需要 Runner 从 GitHub 下载 action 本身再 `git clone`，两步都依赖国际网络。改用本地仓库 `/opt/blog-repo` + `git fetch`，只拉增量，降低失败率。

---

## API 健康检查

```bash
# 直接访问应用
curl http://<your-server-ip>:3004/api/

# 通过 Nginx
curl http://<your-server-ip>/api/

# 返回
{"data":"Hello World!","code":200,"message":"success"}
```

### 完整验证

```bash
# 1. 容器状态
docker ps --filter name=blog-server

# 2. 应用日志（应有 "Nest application successfully started"）
docker logs blog-server --tail 20

# 3. Runner 状态
docker logs github-runner --tail 5
```

---

## 故障排查

### 容器重启循环：`OSS 环境变量未配置完整`

应用启动时校验 OSS 四个配置项（`OSS_REGION`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`、`OSS_BUCKET`）都必须有值，任意一个为空都会导致容器反复重启。

**解决**：检查 `/opt/blog-server/.env`，确保四个 OSS 配置项都有值。如暂不使用 OSS，填占位值即可：

```
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=placeholder
OSS_ACCESS_KEY_SECRET=placeholder
OSS_BUCKET=placeholder
```

### 数据库连接失败：`Access denied for user 'root'`

MySQL 密码变更后，旧的 Docker volume 中仍保存着旧密码。

**解决**：删除 MySQL 数据卷，用新密码重新初始化：

```bash
cd /opt/blog-server
docker compose down
docker volume rm blog-server_mysql_data
docker compose up -d
```

> **警告**：这会删除所有数据库数据。如果已有重要数据，请先备份。

### Docker 镜像拉取超时

`docker pull` 时报 `net/http: request canceled while waiting for connection`：

- 检查 `/etc/docker/daemon.json` 中 `registry-mirrors` 配置
- `systemctl restart docker` 确保配置生效
- 如果某个镜像源不可用，Docker Daemon 会自动尝试下一个

### Runner 不接任务

```bash
docker logs github-runner --tail 10
```

- 正常状态应显示 `Listening for Jobs`
- 如果配置错误，检查 `REPO_URL` 变量名是否正确（不是 `RUNNER_REPOSITORY_URL`）
- 如果 token 过期，删除容器，重新获取 token 并启动

### git fetch 失败

GitHub 间歇性不可达，等几分钟重试：

```bash
cd /opt/blog-repo && git fetch origin main
```

或在 GitHub Actions 页面手动 Re-run job。

### 数据库迁移失败

```bash
# 查看迁移状态
docker compose -f /opt/blog-server/docker-compose.yml exec app \
  node node_modules/typeorm/cli.js migration:show -d dist/config/data-source.js

# 手动运行迁移
docker compose -f /opt/blog-server/docker-compose.yml exec app \
  node node_modules/typeorm/cli.js migration:run -d dist/config/data-source.js
```

如果迁移报 `Duplicate column name` 错误，说明该列已存在（通常是之前 `DB_SYNCHRONIZE=true` 时自动创建了），可安全忽略，不影响运行。

### Docker 构建时 npm 包下载慢

确保项目根目录有 `.npmrc` 文件且 Dockerfile 正确复制了它。如果没有，`pnpm fetch` 会直连 `registry.npmjs.org`，每个包可能耗时 10 秒以上。

```
# .npmrc（项目根目录）
registry=https://registry.npmmirror.com/
```
