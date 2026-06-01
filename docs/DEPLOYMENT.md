# 部署文档

本文档详细说明博客后端系统基于 Docker + GitHub CI/CD 的生产环境部署流程。

## 架构概述

```
推送代码到 GitHub main 分支
     │
     ▼
GitHub Actions
  ├─ CI: lint → test → build（代码质量门禁）
  └─ Deploy: SSH 到服务器
       ├─ git pull（拉取最新代码）
       ├─ docker compose up -d --build（本地构建镜像 + 启动容器）
       │     ├─ 复用 Docker 层缓存，只重新编译变更代码
       │     └─ MySQL / 依赖层不变则秒级跳过
       └─ 容器启动 → 等 MySQL → 跑迁移 → seed → 启动
```

> 不需要推送到任何 Docker 注册表，也不需要服务器拉取镜像。服务器本地根据 Dockerfile 直接构建，层缓存命中后每次只编译增量代码。

## 目录

- [环境要求](#环境要求)
- [服务器初始化](#服务器初始化)
- [GitHub 配置](#github-配置)
- [首次部署](#首次部署)
- [Nginx 反向代理与 SSL](#nginx-反向代理与-ssl)
- [日常运维](#日常运维)
- [故障排查](#故障排查)

---

## 环境要求

### 服务器

| 项目       | 要求                        |
| ---------- | --------------------------- |
| 操作系统   | Ubuntu 22.04 LTS            |
| CPU / 内存 | 2 核 2 GB（最低）           |
| 磁盘       | 20 GB+                      |
| 公网 IP    | 已分配                      |
| 安全组     | 开放 22、80、443、3004 端口 |
| 软件       | 仅需安装 Docker             |

### 本地

- Git
- GitHub 仓库的 push 权限

---

## 服务器初始化

以下操作在服务器上执行，只需做一次。

### 1. 安装 Docker

```bash
curl -fsSL https://get.docker.com | bash

# 验证
docker --version
```

### 2. 配置 Docker 镜像加速（国内服务器必须）

```bash
sudo mkdir -p /etc/docker
echo '{"registry-mirrors": ["https://docker.m.daocloud.io"]}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

### 3. 克隆仓库

```bash
cd /var/www
git clone https://github.com/ljt741212/blog-server.git blog-server
cd blog-server
```

### 4. 生成部署专用 SSH 密钥

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_rsa -N ""
cat ~/.ssh/github_actions_rsa.pub >> ~/.ssh/authorized_keys
```

**重要** — 将密钥转为 PEM 格式（兼容 GitHub Actions）：

```bash
ssh-keygen -p -m PEM -f ~/.ssh/github_actions_rsa
cat ~/.ssh/github_actions_rsa
```

复制输出的整段内容（`-----BEGIN RSA PRIVATE KEY-----` 到 `-----END RSA PRIVATE KEY-----`），作为下一步的 `SSH_KEY`。

### 5. 确认 SSH 权限

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## GitHub 配置

在 GitHub 仓库 **Settings → Secrets and variables → Actions** 中添加以下 Secrets：

| Secret Name   | 值                        | 说明                   |
| ------------- | ------------------------- | ---------------------- |
| `SSH_HOST`    | `175.178.156.57`          | 服务器公网 IP          |
| `SSH_USER`    | `root`                    | SSH 用户名             |
| `SSH_KEY`     | （上一步 cat 输出的私钥） | 完整粘贴，含开头结尾行 |
| `SSH_PORT`    | `22`                      | SSH 端口               |
| `DEPLOY_PATH` | `/var/www/blog-server`    | 项目在服务器上的路径   |
| `ENV_FILE`    | （base64 编码的 .env）    | 生产环境变量（见下方） |

### 生成 ENV_FILE

在本地，将 `.env.example` 复制为 `.env`，按以下模板填入真实值：

```
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=你的数据库密码
DB_DATABASE=blog_db
DB_SYNCHRONIZE=false
DB_LOGGING=error

JWT_SECRET=openssl rand -hex 64 生成的随机字符串
PORT=3004
NODE_ENV=production
CORS_ORIGIN=http://www.cx330.cloud

EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=你的邮箱@qq.com
EMAIL_PASS=你的SMTP授权码
EMAIL_FROM=你的邮箱@qq.com

SEED_ADMIN_USERNAME=admin
SEED_ADMIN_EMAIL=你的邮箱
SEED_ADMIN_PASSWORD=你的管理员密码

OSS_REGION=oss-cn-beijing
OSS_ACCESS_KEY_ID=你的阿里云AK
OSS_ACCESS_KEY_SECRET=你的阿里云SK
OSS_BUCKET=你的OSS Bucket
```

**注意**: `DB_HOST` 必须写 `mysql`（Docker 内部网络的服务名），不能写 `127.0.0.1`。

在 **PowerShell** 中执行编码：

```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((Get-Content .env -Raw)))
```

将输出的字符串填入 `ENV_FILE` Secret。

### 开启仓库 Packages 权限

**Settings → Actions → General → Workflow permissions** → 选择 **Read and write permissions** → Save。

---

## 首次部署

### 1. 合并代码到 main

```bash
git checkout main
git merge feature/v1.0/ljt
git push origin main
```

### 2. 观察 CI/CD 运行

打开 GitHub 仓库 **Actions** 页，查看流水线执行状态。

### 3. CI/CD 自动执行的步骤

CI 阶段（GitHub Actions 上）：

- `pnpm install` + lint + test + build（代码质量门禁）

部署阶段（服务器上）：

- `git pull` 拉取最新代码
- `docker compose up -d --build` 本地构建镜像并启动
- 首次：从 Secret 解码写入 `.env` 文件
- 首次：拉取 `mysql:8.0` 和 `node:22-alpine` 基础镜像（走 DaoCloud 加速）
- App entrypoint 自动等 MySQL → 跑迁移 → seed 管理员 → 启动服务

### 4. 验证

```bash
# 在服务器上检查容器状态
docker compose -f /var/www/blog-server/docker-compose.yml ps

# 查看日志
docker logs -f blog-server

# 测试接口
curl http://localhost:3004/api/health
```

返回 `{"status":"ok","timestamp":...}` 即部署成功。

---

## Nginx 反向代理与 SSL

应用运行在 `3004` 端口，需要 Nginx 反代到 80/443 端口并配置 SSL。

### 1. 安装 Nginx

```bash
sudo apt install nginx -y
```

### 2. 配置

```bash
sudo vim /etc/nginx/sites-available/blog-server
```

```nginx
server {
    listen 80;
    server_name www.cx330.cloud cx330.cloud;

    location / {
        proxy_pass http://127.0.0.1:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 上传文件大小限制
        client_max_body_size 50m;
    }
}
```

### 3. 启用并重载

```bash
sudo ln -s /etc/nginx/sites-available/blog-server /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default    # 删除默认站点
sudo nginx -t                                    # 测试配置
sudo systemctl restart nginx
```

### 4. 配置 SSL（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d www.cx330.cloud
sudo certbot renew --dry-run   # 验证自动续期
```

完成后 Nginx 配置会自动加上 SSL。

**安全组记得开放 80 和 443 端口。**

---

## 日常运维

### 更新部署

修改代码后：

```bash
git add .
git commit -m "feat: xxx"
git push origin main
```

CI/CD 全自动完成。无需登录服务器。

### 查看日志

```bash
# 实时日志
docker logs -f blog-server

# 最近 100 行
docker logs --tail 100 blog-server
```

### 重启服务

```bash
cd /var/www/blog-server
docker compose restart app
```

### 数据库备份

```bash
# 备份
docker exec blog-mysql mysqldump -u root -p blog_db > backup_$(date +%Y%m%d).sql

# 恢复
docker exec -i blog-mysql mysql -u root -p blog_db < backup.sql
```

建议加 crontab 自动备份：

```bash
sudo crontab -e

# 每天凌晨 3 点备份
0 3 * * * docker exec blog-mysql mysqldump -u root -p你的密码 blog_db > /var/backups/blog_$(date +\%Y\%m\%d).sql
```

### 手动跑迁移

```bash
docker exec blog-server node ./node_modules/typeorm/cli.js migration:run -d ./dist/config/data-source.js
```

### 容器状态

```bash
cd /var/www/blog-server
docker compose ps
```

---

## 自动化清单

以下步骤由 Docker + CI/CD 自动完成，**无需手动操作**：

- [x] 安装 Node.js 环境 → 容器内置
- [x] 安装 MySQL 数据库 → Docker Compose 启动
- [x] 创建数据库 → MySQL 容器 `MYSQL_DATABASE` 环境变量
- [x] 建表 → entrypoint 自动跑 TypeORM 迁移
- [x] 创建管理员 → entrypoint 自动跑 seed 脚本
- [x] 安装 pnpm 依赖 → Docker 多阶段构建
- [x] 编译 TypeScript → Docker build 阶段
- [x] 进程管理（崩溃重启） → Docker `restart: always`
- [x] 代码更新部署 → GitHub Actions push 触发

---

## 项目文件说明

| 文件                          | 用途                                                  |
| ----------------------------- | ----------------------------------------------------- |
| `Dockerfile`                  | 多阶段构建：builder 编译 TS → production 仅含生产依赖 |
| `docker-compose.yml`          | app + MySQL 8.0 编排，健康检查，数据卷持久化          |
| `docker-entrypoint.sh`        | 容器启动脚本：等 MySQL → 跑迁移 → seed → 启动应用     |
| `.dockerignore`               | 排除 node_modules、dist、.git 等不必要文件            |
| `.github/workflows/ci-cd.yml` | CI/CD 流水线定义                                      |

---

## 故障排查

### CI Build 阶段失败

**Docker Hub 超时**: `dial tcp ... i/o timeout`

→ 检查镜像加速是否生效。必要时更换镜像源。

**pnpm install 失败**: 某个包下载超时

→ 重试一次。`pnpm fetch` 对网络稳定性要求高。

### Deploy 阶段失败

**SSH 连接失败**: `handshake failed: ssh: unable to authenticate`

→ 检查 `SSH_KEY` 是否为 PEM 格式（`-----BEGIN RSA PRIVATE KEY-----` 开头），以及 `authorized_keys` 是否包含对应公钥。

**ENV_FILE base64 解码失败**: `base64: invalid input`

→ 重新在 PowerShell 中执行 `[Convert]::ToBase64String(...)` 编码，更新 Secret 值。

**MySQL 容器无法启动**:

→ 查看日志：`docker logs blog-mysql`。常见原因：数据卷权限问题，或密码不符合 MySQL 策略。

### 应用启动后 502

→ 检查容器是否在运行：`docker ps | grep blog-server`
→ 查看应用日志：`docker logs blog-server`
→ 检查 Nginx 配置中 proxy_pass 指向 `127.0.0.1:3004`
