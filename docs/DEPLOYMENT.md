# 部署文档

本文档详细说明了博客后端系统的部署流程和配置说明。

## 目录

- [环境要求](#环境要求)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [环境变量配置](#环境变量配置)
- [数据库迁移](#数据库迁移)
- [Nginx 配置](#nginx-配置)
- [监控与维护](#监控与维护)
- [故障排查](#故障排查)

## 环境要求

### 系统要求

- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 7+) / Windows Server / macOS
- **Node.js**: >= 16.x (推荐使用 LTS 版本)
- **MySQL**: >= 8.0
- **内存**: >= 2GB (推荐 4GB+)
- **磁盘空间**: >= 10GB

### 软件依赖

- **npm**: >= 7.x 或 **pnpm**: >= 8.x
- **Git**: 用于代码版本控制
- **PM2**: 用于进程管理（生产环境推荐）

## 开发环境部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd Blog-project/server
```

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm（推荐）
pnpm install
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置开发环境参数：

```env
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=blog_db
DB_SYNCHRONIZE=true
DB_LOGGING=all

# 应用配置
PORT=3004
NODE_ENV=development

# JWT 配置
JWT_SECRET=your_development_jwt_secret
JWT_EXPIRES_IN=7d

# OSS 配置（可选，开发环境可以不配置）
OSS_REGION=your_region
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket
OSS_ENDPOINT=your_endpoint
OSS_PUBLIC_BASE_URL=your_public_base_url
```

### 4. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 退出
exit;
```

### 5. 运行数据库迁移

```bash
npm run migration:run
```

### 6. 启动开发服务器

```bash
npm run start:dev
```

应用将在 `http://localhost:3004` 启动。

### 7. 验证部署

访问以下地址验证部署：

- API 根路径: `http://localhost:3004/api`
- 健康检查: `http://localhost:3004/api` (如果已配置)

## 生产环境部署

### 1. 服务器准备

#### 1.1 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### 1.2 安装 Node.js

使用 NodeSource 安装 Node.js LTS 版本：

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version
npm --version
```

#### 1.3 安装 MySQL

```bash
# Ubuntu/Debian
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql

# CentOS/RHEL
sudo yum install mysql-server -y
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 安全配置
sudo mysql_secure_installation
```

#### 1.4 安装 PM2（进程管理）

```bash
sudo npm install -g pm2
```

### 2. 部署应用

#### 2.1 克隆项目

```bash
cd /var/www
sudo git clone <repository-url> blog-server
cd blog-server/server
```

#### 2.2 安装依赖

```bash
sudo npm install --production
# 或
sudo pnpm install --production
```

#### 2.3 配置环境变量

```bash
sudo cp .env.example .env
sudo nano .env
```

生产环境配置示例：

```env
# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=blog_user
DB_PASSWORD=strong_password_here
DB_DATABASE=blog_db
DB_SYNCHRONIZE=false
DB_LOGGING=error

# 应用配置
PORT=3004
NODE_ENV=production

# JWT 配置（使用强密钥）
JWT_SECRET=your_very_strong_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# OSS 配置
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_PUBLIC_BASE_URL=https://your-cdn-domain.com
OSS_DEFAULT_DIR=uploads
OSS_SIGN_EXPIRES=600
OSS_MAX_FILE_SIZE_MB=10
OSS_ALLOWED_MIME_PREFIXES=image/
```

**重要提示**:
- `DB_SYNCHRONIZE` 必须设置为 `false`
- `JWT_SECRET` 必须使用强密钥
- 数据库密码必须足够复杂

#### 2.4 创建数据库和用户

```bash
sudo mysql -u root -p
```

```sql
-- 创建数据库
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'strong_password_here';

-- 授权
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

#### 2.5 构建项目

```bash
npm run build
```

#### 2.6 运行数据库迁移

```bash
npm run migration:run
```

#### 2.7 使用 PM2 启动应用

```bash
# 启动应用
pm2 start dist/main.js --name blog-server

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status

# 查看日志
pm2 logs blog-server
```

### 3. 配置 Nginx 反向代理

#### 3.1 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 3.2 配置 Nginx

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/blog-server
```

配置内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS（如果使用 SSL）
    # return 301 https://$server_name$request_uri;

    # 如果暂时不使用 HTTPS，直接代理到后端
    location /api {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件（如果有）
    location / {
        root /var/www/blog-server/client/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：

```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/blog-server /etc/nginx/sites-enabled/

# CentOS/RHEL（配置文件路径可能不同）
sudo cp /etc/nginx/sites-available/blog-server /etc/nginx/conf.d/blog-server.conf
```

测试配置：

```bash
sudo nginx -t
```

重启 Nginx：

```bash
sudo systemctl restart nginx
```

#### 3.3 配置 SSL（可选但推荐）

使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

## Docker 部署

### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建项目
RUN pnpm run build

# 生产镜像
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装生产依赖
RUN npm install -g pnpm && pnpm install --production --frozen-lockfile

# 复制构建产物
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 3004

# 启动应用
CMD ["node", "dist/main.js"]
```

### 2. 创建 .dockerignore

```
node_modules
dist
.env
.env.local
.git
.gitignore
README.md
docs
test
coverage
*.log
```

### 3. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: blog-server
    ports:
      - "3004:3004"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USERNAME=blog_user
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=blog_db
      - DB_SYNCHRONIZE=false
      - JWT_SECRET=${JWT_SECRET}
      - OSS_ACCESS_KEY_ID=${OSS_ACCESS_KEY_ID}
      - OSS_ACCESS_KEY_SECRET=${OSS_ACCESS_KEY_SECRET}
      - OSS_BUCKET=${OSS_BUCKET}
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  db:
    image: mysql:8.0
    container_name: blog-db
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=blog_db
      - MYSQL_USER=blog_user
      - MYSQL_PASSWORD=${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

volumes:
  db_data:
```

### 4. 构建和运行

```bash
# 创建环境变量文件
cp .env.example .env
# 编辑 .env 文件

# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 运行数据库迁移
docker-compose exec app npm run migration:run
```

## 环境变量配置

### 必需配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DB_HOST` | 数据库主机 | `127.0.0.1` |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USERNAME` | 数据库用户名 | `blog_user` |
| `DB_PASSWORD` | 数据库密码 | `strong_password` |
| `DB_DATABASE` | 数据库名称 | `blog_db` |
| `DB_SYNCHRONIZE` | 是否自动同步（生产环境必须 false） | `false` |
| `PORT` | 应用端口 | `3004` |
| `NODE_ENV` | 环境模式 | `production` |
| `JWT_SECRET` | JWT 密钥 | `your_secret_key` |

### 可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DB_LOGGING` | 数据库日志级别 | `error` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `OSS_REGION` | OSS 区域 | - |
| `OSS_ACCESS_KEY_ID` | OSS Access Key ID | - |
| `OSS_ACCESS_KEY_SECRET` | OSS Access Key Secret | - |
| `OSS_BUCKET` | OSS 存储桶名称 | - |
| `OSS_ENDPOINT` | OSS 端点 | - |
| `OSS_PUBLIC_BASE_URL` | OSS 公共访问 URL | - |

## 数据库迁移

### 运行迁移

```bash
# 开发环境
npm run migration:run

# 生产环境（确保已构建）
npm run build
npm run migration:run
```

### 回滚迁移

```bash
npm run migration:revert
```

### 创建新迁移

```bash
# 创建空迁移文件
npm run migration:create ./src/migrations/your-migration-name

# 根据实体变更生成迁移
npm run migration:generate ./src/migrations/update-table
```

## Nginx 配置

### 基本配置

参考 [配置 Nginx 反向代理](#32-配置-nginx) 部分。

### 性能优化

```nginx
# 启用 gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

# 缓存静态资源
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 安全配置

```nginx
# 隐藏 Nginx 版本
server_tokens off;

# 安全头
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## 监控与维护

### PM2 监控

```bash
# 查看应用状态
pm2 status

# 查看详细信息
pm2 show blog-server

# 查看日志
pm2 logs blog-server --lines 100

# 监控面板
pm2 monit

# 重启应用
pm2 restart blog-server

# 停止应用
pm2 stop blog-server
```

### 日志管理

应用日志位置：
- PM2 日志: `~/.pm2/logs/`
- 应用日志: 根据配置（如 `/var/www/blog-server/logs/`）

日志轮转配置（使用 PM2 模块）：

```bash
# 安装 PM2 日志轮转模块
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 备份策略

#### 数据库备份

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="blog_db"
DB_USER="blog_user"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 删除 7 天前的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

设置执行权限：

```bash
sudo chmod +x /usr/local/bin/backup-db.sh
```

添加到 crontab（每天凌晨 2 点备份）：

```bash
sudo crontab -e
# 添加以下行
0 2 * * * /usr/local/bin/backup-db.sh
```

## 故障排查

### 常见问题

#### 1. 应用无法启动

**检查项**:
- 检查端口是否被占用: `lsof -i :3004`
- 检查环境变量配置是否正确
- 查看应用日志: `pm2 logs blog-server`

#### 2. 数据库连接失败

**检查项**:
- 确认数据库服务是否运行: `sudo systemctl status mysql`
- 检查数据库配置是否正确
- 检查数据库用户权限
- 检查防火墙设置

#### 3. 502 Bad Gateway

**检查项**:
- 确认后端应用是否运行: `pm2 status`
- 检查 Nginx 配置中的 proxy_pass 地址
- 查看 Nginx 错误日志: `sudo tail -f /var/log/nginx/error.log`

#### 4. 内存占用过高

**解决方案**:
- 检查是否有内存泄漏
- 使用 PM2 限制内存: `pm2 start dist/main.js --max-memory-restart 500M`
- 优化数据库查询
- 启用 Node.js 垃圾回收优化

#### 5. 迁移失败

**检查项**:
- 确认数据库连接正常
- 检查迁移文件语法
- 查看迁移日志
- 手动执行 SQL 检查

### 日志查看

```bash
# PM2 日志
pm2 logs blog-server

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# MySQL 日志
sudo tail -f /var/log/mysql/error.log
```

### 性能分析

```bash
# 使用 Node.js 性能分析
node --prof dist/main.js

# 使用 PM2 性能监控
pm2 monit
```

## 更新部署

### 更新流程

1. **备份数据库**
```bash
/usr/local/bin/backup-db.sh
```

2. **拉取最新代码**
```bash
cd /var/www/blog-server/server
git pull origin main
```

3. **安装依赖**
```bash
npm install --production
```

4. **运行数据库迁移**
```bash
npm run build
npm run migration:run
```

5. **重新构建**
```bash
npm run build
```

6. **重启应用**
```bash
pm2 restart blog-server
```

7. **验证部署**
```bash
curl http://localhost:3004/api
```

## 安全建议

1. **定期更新系统和依赖**
2. **使用强密码**
3. **配置防火墙**
4. **启用 HTTPS**
5. **限制数据库访问**
6. **定期备份数据**
7. **监控异常访问**
8. **使用环境变量存储敏感信息**
9. **定期审查日志**
10. **实施访问控制**

## 性能优化建议

1. **启用数据库索引**
2. **使用 Redis 缓存（如需要）**
3. **启用 Nginx 缓存**
4. **使用 CDN 加速静态资源**
5. **优化数据库查询**
6. **启用 HTTP/2**
7. **使用连接池**
8. **实施限流策略**
