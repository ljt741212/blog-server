# blog-server 部署文档

## 架构概览

```
GitHub (push to main)
    │
    ▼
GitHub Actions (ubuntu-latest)
    │
    ├─ docker build -f apps/server/Dockerfile → push to ACR（阿里云容器镜像仓库）
    ├─ docker pull mysql:8.0              → push to ACR
    ├─ docker pull redis:7-alpine         → push to ACR
    ├─ scp apps/server/docker-compose.yml → /opt/blog-server/
    │
    └─ SSH to 阿里云 Lighthouse
         ├─ docker login ACR
         ├─ sed 替换 compose 中 app 镜像 tag 为本次 sha
         ├─ docker compose pull → docker compose up -d
         ├─ docker restart blog-nginx（Nginx 反向代理同步刷新上游 IP）
         ├─ migration:run → seed-admin
         └─ docker image prune -f
```

| 组件         | 说明                                               |
| ------------ | -------------------------------------------------- |
| **代码仓库** | GitHub                                             |
| **CI/CD**    | GitHub Actions (`ubuntu-latest`)                   |
| **镜像仓库** | 阿里云 ACR（个人版）                               |
| **服务器**   | 阿里云轻量应用服务器（Lighthouse）                 |
| **容器编排** | Docker Compose：MySQL + Redis + App                |
| **反向代理** | Nginx（独立容器 `blog-nginx`，SSL 终止、路径转发） |

---

## 服务器初始化

### 操作系统

CentOS 8.2+。以下命令以 root 身份执行。

### 1. 修复 CentOS 8 EOL 仓库源

CentOS 8 已停止维护，需要切换为阿里云镜像：

```bash
sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*
sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://mirrors.aliyun.com|g' /etc/yum.repos.d/CentOS-*
# 修复 epel 仓库的 failovermethod 兼容性问题
sed -i 's/failovermethod=priority//g' /etc/yum.repos.d/CentOS-epel.repo 2>/dev/null
dnf clean all && dnf makecache
```

### 2. 安装 Docker（阿里云镜像）

```bash
# 安装工具
dnf install -y yum-utils

# 添加 Docker CE 仓库（阿里云镜像）
yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 安装 Docker
dnf install -y --nogpgcheck docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# 启动并设置开机自启
systemctl start docker
systemctl enable docker
```

### 3. 配置 Docker

`/etc/docker/daemon.json`：

```json
{
  "registry-mirrors": ["https://registry.cn-shanghai.aliyuncs.com"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
systemctl restart docker
```

### 4. 安装 Git

```bash
dnf install -y git
```

### 5. 防火墙

在阿里云控制台 → 轻量应用服务器 → 防火墙中开放：

| 端口 | 协议 | 说明     |
| ---- | ---- | -------- |
| 22   | TCP  | SSH      |
| 3004 | TCP  | 应用端口 |

---

## 部署目录

```
/opt/blog-server/
├── docker-compose.yml
└── .env
```

---

## docker-compose.yml

> 部署时使用：复制本文件到服务器 `/opt/blog-server/docker-compose.yml`，镜像中的 `<your-acr-registry>` 替换为实际 ACR 地址。

```yaml
services:
  mysql:
    image: <your-acr-registry>/blog-server/mysql:8.0
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

  redis:
    image: <your-acr-registry>/blog-server/redis:7-alpine
    container_name: blog-redis
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - blog_network
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: <your-acr-registry>/blog-server/server:latest
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
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      OSS_REGION: ${OSS_REGION}
      OSS_ACCESS_KEY_ID: ${OSS_ACCESS_KEY_ID}
      OSS_ACCESS_KEY_SECRET: ${OSS_ACCESS_KEY_SECRET}
      OSS_BUCKET: ${OSS_BUCKET}
      SEED_ADMIN_USERNAME: ${SEED_ADMIN_USERNAME}
      SEED_ADMIN_EMAIL: ${SEED_ADMIN_EMAIL}
      SEED_ADMIN_PASSWORD: ${SEED_ADMIN_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - blog_network

volumes:
  mysql_data:
  redis_data:

networks:
  blog_network:
```

> **注意**：`<your-acr-registry>` 替换为实际 ACR 地址，格式为 `crpi-<id>.<region>.personal.cr.aliyuncs.com`（登录 ACR 控制台「访问凭证」页查看）。

---

## .env 配置

部署前在 `/opt/blog-server/.env` 中填入以下变量：

### 数据库

| 变量             | 说明            | 默认值                                       |
| ---------------- | --------------- | -------------------------------------------- |
| `DB_HOST`        | MySQL 主机      | `mysql`（Docker 服务名，**不是 localhost**） |
| `DB_PORT`        | MySQL 端口      | `3306`                                       |
| `DB_USERNAME`    | MySQL 用户名    | `root`                                       |
| `DB_PASSWORD`    | MySQL root 密码 | **必填**                                     |
| `DB_DATABASE`    | 数据库名        | `blog_db`                                    |
| `DB_SYNCHRONIZE` | 自动同步表结构  | `false`（生产环境必须设为 false）            |
| `DB_LOGGING`     | SQL 日志级别    | `error`                                      |

### 应用

| 变量          | 说明                | 备注                                  |
| ------------- | ------------------- | ------------------------------------- |
| `JWT_SECRET`  | JWT 签名密钥        | **必填**，`openssl rand -hex 64` 生成 |
| `PORT`        | 应用端口            | `3004`                                |
| `NODE_ENV`    | 运行环境            | `production`                          |
| `CORS_ORIGIN` | CORS 允许的前端域名 | **必填**                              |

### 邮箱（SMTP）

| 变量           | 说明         | 默认值                         |
| -------------- | ------------ | ------------------------------ |
| `EMAIL_HOST`   | SMTP 服务器  | `smtp.qq.com`                  |
| `EMAIL_PORT`   | SMTP 端口    | `465`                          |
| `EMAIL_SECURE` | 启用 SSL     | `true`                         |
| `EMAIL_USER`   | 发件邮箱地址 | **必填**                       |
| `EMAIL_PASS`   | SMTP 授权码  | **必填**                       |
| `EMAIL_FROM`   | 发件人地址   | **必填**（缺失会导致启动警告） |

### 阿里云 OSS

| 变量                    | 说明             | 备注                          |
| ----------------------- | ---------------- | ----------------------------- |
| `OSS_REGION`            | OSS 区域         | **必填**，如 `oss-cn-beijing` |
| `OSS_ACCESS_KEY_ID`     | AccessKey ID     | **必填**                      |
| `OSS_ACCESS_KEY_SECRET` | AccessKey Secret | **必填**                      |
| `OSS_BUCKET`            | Bucket 名称      | **必填**                      |

> **重要**：四个 OSS 变量**缺一不可**。应用启动时 `OssService` 会校验，任一为空都会抛出 `BadRequestException: OSS 环境变量未配置完整` 导致容器重启循环。暂不使用时填占位值即可。

### 初始管理员

| 变量                  | 说明   | 默认值   |
| --------------------- | ------ | -------- |
| `SEED_ADMIN_USERNAME` | 用户名 | `admin`  |
| `SEED_ADMIN_EMAIL`    | 邮箱   | **必填** |
| `SEED_ADMIN_PASSWORD` | 密码   | **必填** |

### AI 加密

| 变量             | 说明                | 备注                                  |
| ---------------- | ------------------- | ------------------------------------- |
| `ENCRYPTION_KEY` | AI API 密钥加密密钥 | **必填**，`openssl rand -hex 32` 生成 |

### 缓存（Redis）

| 变量         | 说明       | 备注                                            |
| ------------ | ---------- | ----------------------------------------------- |
| `REDIS_HOST` | Redis 主机 | Docker 内使用服务名 `redis`，**不是 localhost** |
| `REDIS_PORT` | Redis 端口 | 默认 `6379`                                     |

> Redis 用于 AI Agent 的 LangGraph checkpoint（会话续聊、记忆持久化）。

---

## CI/CD 配置

### GitHub Secrets

在仓库 `Settings → Secrets and variables → Actions` 中添加：

| Secret            | 说明                                     |
| ----------------- | ---------------------------------------- |
| `SSH_HOST`        | 服务器公网 IP                            |
| `SSH_USER`        | SSH 用户名（`root`）                     |
| `SSH_PRIVATE_KEY` | SSH 私钥（RSA 4096-bit PKCS#8 PEM 格式） |
| `ACR_USERNAME`    | 阿里云 ACR 用户名                        |
| `ACR_PASSWORD`    | 阿里云 ACR 密码                          |

### SSH 密钥生成

**必须使用 RSA 4096-bit PKCS#8 PEM 格式**。appleboy/ssh-action 底层 drone-ssh 不支持 ED25519 的 OpenSSH 格式。

```bash
# 生成密钥对
ssh-keygen -t rsa -b 4096 -m PEM -f ~/.ssh/deploy_key -N ""

# 转换为 PKCS#8 格式（兼容性最好）
ssh-keygen -p -m PKCS8 -f ~/.ssh/deploy_key -N ""

# 上传公钥到服务器
ssh-copy-id -i ~/.ssh/deploy_key.pub root@<server-ip>

# 查看私钥（复制到 GitHub Secret SSH_PRIVATE_KEY）
cat ~/.ssh/deploy_key
```

密钥格式应为 `-----BEGIN PRIVATE KEY-----` 开头（PKCS#8）或 `-----BEGIN RSA PRIVATE KEY-----` 开头（PKCS#1）。

### Workflow（.github/workflows/deploy.yml）

```yaml
name: Deploy

on:
  push:
    branches: [main]
    paths-ignore:
      - 'README.md'
      - 'docs/**'
      - 'LICENSE'
  workflow_dispatch:

env:
  REGISTRY: <your-acr-registry>
  NAMESPACE: blog-server

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login to ACR
        run: echo "${{ secrets.ACR_PASSWORD }}" | docker login ${{ env.REGISTRY }} -u ${{ secrets.ACR_USERNAME }} --password-stdin

      - name: Build and push blog-server（monorepo 顶层构建，Dockerfile 在 apps/server/）
        run: |
          docker build -f apps/server/Dockerfile -t ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/server:${{ github.sha }} .
          docker push ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/server:${{ github.sha }}
          docker tag ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/server:${{ github.sha }} ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/server:latest
          docker push ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/server:latest

      - name: Sync mysql:8.0 to ACR
        run: |
          docker pull mysql:8.0
          docker tag mysql:8.0 ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/mysql:8.0
          docker push ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/mysql:8.0

      - name: Sync redis:7-alpine to ACR
        run: |
          docker pull redis:7-alpine
          docker tag redis:7-alpine ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/redis:7-alpine
          docker push ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/redis:7-alpine

      - name: Copy compose file to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: apps/server/docker-compose.yml
          target: /opt/blog-server/
          strip_components: 2

      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          command_timeout: '15m'
          script: |
            set -e
            echo "${{ secrets.ACR_PASSWORD }}" | docker login ${{ env.REGISTRY }} -u ${{ secrets.ACR_USERNAME }} --password-stdin

            cd /opt/blog-server

            # 注意：必须用 .*/server:.* 精确匹配 app 镜像，不能误伤 mysql / redis
            sed -i "s|image: .*/server:.*|image: ${{ env.REGISTRY }}/${{ env.NAMESPACE }}/server:${{ github.sha }}|" docker-compose.yml

            docker compose pull app
            docker compose up -d --remove-orphans
            docker restart blog-nginx
            docker compose exec -T app node node_modules/typeorm/cli.js migration:run -d dist/config/data-source.js
            docker compose exec -T app node dist/scripts/seed-admin.js || echo "seed skipped"
            docker image prune -f
            docker compose ps
            docker compose logs --tail 30
```

> **关键点**：
>
> - `docker build -f apps/server/Dockerfile`：monorepo 顶层构建，Dockerfile 使用 `apps/server/dist` 等绝对路径拷贝产物
> - `scp` 步骤将最新 `docker-compose.yml` 推到服务器（`strip_components: 2` 脱掉 `apps/server/` 前缀）
> - `sed` 替换镜像时，模式 `.*/server:.*` 只匹配 app 的 `/server:` 标签行，不会误伤 MySQL 的 `/mysql:` 或 Redis 的 `/redis:`
> - `docker restart blog-nginx`：Nginx 反向代理容器与 app 容器同 network，app 重建换 IP 后必须重启 Nginx 才能恢复上游解析，否则 502

---

## Dockerfile

项目使用多阶段构建，monorepo 顶层构建但只打包 `apps/server` 与 `packages/ai-agent` 的产物。

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

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

COPY .npmrc ./
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/packages/ai-agent/package.json ./packages/ai-agent/package.json

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/database ./apps/server/database
COPY --from=builder /app/packages/ai-agent/dist ./packages/ai-agent/dist
COPY --from=builder /app/apps/server/scripts/docker-entrypoint.sh ./apps/server/scripts/docker-entrypoint.sh

EXPOSE 3004

WORKDIR /app/apps/server
RUN chmod +x scripts/docker-entrypoint.sh
ENTRYPOINT ["scripts/docker-entrypoint.sh"]
```

> `docker-entrypoint.sh` 在启动应用前自动执行 `migration:run`，避免新镜像部署后表结构未更新导致 500。

`.npmrc` 文件内容：

```
registry=https://registry.npmmirror.com/
```

---

## 部署流程（首次）

### 1. 服务器初始化

按上方「服务器初始化」章节完成 Docker 和 Git 安装。

### 2. 创建部署目录和文件

```bash
mkdir -p /opt/blog-server
```

将上方 `docker-compose.yml` 的内容写入 `/opt/blog-server/docker-compose.yml`，将 `.env` 各变量按实际情况填入 `/opt/blog-server/.env`。

### 3. 配置 GitHub Secrets

按上方「GitHub Secrets」章节配置 5 个 Secret。

### 4. 推送代码触发部署

将代码推送到 GitHub `main` 分支，GitHub Actions 自动执行：

1. 构建 Docker 镜像（`apps/server/Dockerfile`，包含 `apps/server` + `packages/ai-agent` 产物）并推送到 ACR
2. 同步 `mysql:8.0` 与 `redis:7-alpine` 镜像到 ACR
3. `scp` 最新的 `apps/server/docker-compose.yml` 到 `/opt/blog-server/`
4. SSH 登录服务器
5. `sed` 替换 compose 中 app 镜像 tag 为本次 commit sha
6. `docker compose pull` → `docker compose up -d`
7. `docker restart blog-nginx`（Nginx 反向代理刷新上游 IP，避免 502）
8. 运行数据库迁移 + 执行管理员账号种子
9. `docker image prune -f` 清理悬空镜像

### 5. 验证

```bash
# 检查容器状态
cd /opt/blog-server && docker compose ps

# 检查应用日志
docker logs blog-server --tail 20
# 应有 "Nest application successfully started"

# 测试 API
curl http://<server-ip>:3004/api/
# 应返回 {"data":"Hello World!","code":200,"message":"success"}
```

---

## 日常部署

每次 push 到 `main` 分支即可自动触发部署，无需手动操作。也可在 GitHub Actions 页面手动触发（`workflow_dispatch`）。

如需回滚，修改 docker-compose.yml 中 app 的 image 为之前的版本号，然后：

```bash
cd /opt/blog-server && docker compose up -d
```

---

## 故障排查

### 容器重启循环：`OSS 环境变量未配置完整`

`OSS_REGION`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`、`OSS_BUCKET` 任一为空都会触发。检查 `/opt/blog-server/.env` 确保四个变量都有值。

### 数据库迁移失败：`Duplicate column name`

InitSchema 对应的建表语句包含了所有列，后续新增的迁移如果重复添加已存在的列会报此错误。**排查方法**：对比 InitSchema 的建表 SQL 和报错的迁移 SQL，如果列已在 InitSchema 中存在，则删除该迁移文件。

### MySQL 健康检查失败

```bash
# 查看 MySQL 日志
docker logs blog-mysql --tail 30

# 新部署时可清空数据卷重来
cd /opt/blog-server
docker compose down -v
docker compose up -d
```

> **警告**：`down -v` 会删除数据库数据。仅在新部署或确认可丢弃数据时使用。

### sed 替换镜像错误

**症状**：MySQL / Redis 容器输出 NestJS 日志（几个容器跑了同一 app 镜像）。

**原因**：sed 模式写得太宽（如 `.*blog-server.*`）会同时匹配 `/mysql:` / `/redis:` / `/server:`。

**修复**：使用 `.*/server:.*` 精确匹配 app 镜像行。已修复到 deploy.yml 中。

### SSH 认证失败

**症状**：`ssh.ParsePrivateKey: ssh: no key found`。

**原因**：drone-ssh 不支持 ED25519 的 OpenSSH 格式密钥。

**修复**：使用 RSA 4096-bit PKCS#8 PEM 格式（`-----BEGIN PRIVATE KEY-----`）。

### Docker 镜像拉取慢

- 确保 `/etc/docker/daemon.json` 配置了 `registry-mirrors`
- `systemctl restart docker` 确保配置生效
- ACR 香港跨地域拉取约需 2-3 分钟，属正常现象

### npm 包安装慢

确保项目根目录有 `.npmrc` 且 Dockerfile 正确 COPY 到镜像中。如果没有，`pnpm fetch` 直连 `registry.npmjs.org`，速度极慢（每个包 >10s）。
