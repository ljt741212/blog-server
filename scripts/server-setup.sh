#!/bin/bash
set -e

# ============================================================
# blog-server 服务器首次初始化脚本
# 用法: 将此脚本复制到服务器上运行
#   scp scripts/server-setup.sh root@<ip>:/tmp/
#   ssh root@<ip> bash /tmp/server-setup.sh
#
# 或者 SSH 过去后直接运行:
#   curl -fsSL https://raw.githubusercontent.com/<user>/<repo>/main/scripts/server-setup.sh | bash -s -- your-domain.com
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC}  $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

DOMAIN="${1}"
if [ -z "$DOMAIN" ]; then
  read -rp "请输入你的博客域名 (例如 blog.example.com): " DOMAIN
  [ -z "$DOMAIN" ] && err "域名不能为空"
fi

APP_DIR="/opt/blog-server"

# ---------- 1. 安装 Docker ----------
log "检查 Docker ..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | bash
  systemctl enable docker --now
  log "Docker 安装完成"
else
  log "Docker 已安装: $(docker --version)"
fi

# ---------- 2. 安装 Nginx ----------
log "检查 Nginx ..."
if ! command -v nginx &>/dev/null; then
  if command -v apt-get &>/dev/null; then
    apt-get update -qq && apt-get install -y -qq nginx
  elif command -v yum &>/dev/null; then
    yum install -y nginx
  else
    err "未识别的包管理器，请手动安装 nginx"
  fi
  systemctl enable nginx --now
  log "Nginx 安装完成"
else
  log "Nginx 已安装: $(nginx -v 2>&1)"
fi

# ---------- 3. 创建目录 + 写入 docker-compose ----------
log "创建应用目录: $APP_DIR"
mkdir -p "$APP_DIR"

cat > "$APP_DIR/docker-compose.yml" << 'COMPOSE_EOF'
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
        ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - blog_network

  app:
    image: ghcr.io/ljt741212/blog-server:latest
    container_name: blog-server
    restart: always
    ports:
      - "3004:3004"
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
COMPOSE_EOF

log "docker-compose.yml 已写入"

# ---------- 4. 生成 .env ----------
if [ ! -f "$APP_DIR/.env" ]; then
  JWT_SECRET=$(openssl rand -hex 64)
  DB_PASSWORD=$(openssl rand -hex 16)

  cat > "$APP_DIR/.env" << ENV_EOF
# 数据库
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=blog_db
DB_SYNCHRONIZE=false
DB_LOGGING=error

# JWT
JWT_SECRET=${JWT_SECRET}

# 应用
PORT=3004
NODE_ENV=production

# CORS — 填你的前端域名（多个用逗号分隔）
CORS_ORIGIN=https://${DOMAIN}

# 邮件 (SMTP) — 请修改为实际值
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# 种子管理员 — 上线后请删除此段
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_EMAIL=admin@localhost.com
SEED_ADMIN_PASSWORD=

# OSS (可选)
OSS_REGION=
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET=
ENV_EOF

  warn "已生成 $APP_DIR/.env，请编辑填入邮箱和密码等敏感信息后重新运行此脚本"
  log "编辑: vi $APP_DIR/.env"
  log "然后重新运行: bash /tmp/server-setup.sh $DOMAIN"
  exit 0
fi

log ".env 已存在，跳过生成"

# ---------- 5. 配置 Nginx ----------
log "配置 Nginx ..."
cat > "/etc/nginx/sites-available/blog-server" << NGINX_EOF
server {
    listen 80;
    server_name ${DOMAIN};

    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3004;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX_EOF

# 启用站点
if [ ! -L /etc/nginx/sites-enabled/blog-server ]; then
  ln -sf /etc/nginx/sites-available/blog-server /etc/nginx/sites-enabled/blog-server
fi
# 移除默认站点（避免冲突）
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
log "Nginx 配置完成"

# ---------- 6. SSL 证书 ----------
log "检查 SSL 证书 ..."
if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
  if command -v certbot &>/dev/null; then
    log "正在申请 SSL 证书 ..."
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@${DOMAIN}" --redirect || {
      warn "证书申请失败（可能是 DNS 未解析），请稍后手动运行: certbot --nginx -d $DOMAIN"
    }
  else
    warn "certbot 未安装，跳过 SSL。安装方法:"
    warn "  apt-get install -y certbot python3-certbot-nginx"
  fi
else
  log "SSL 证书已存在"
fi

# ---------- 7. 防火墙 ----------
if command -v ufw &>/dev/null && ufw status | grep -q inactive; then
  log "配置防火墙 ..."
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  echo "y" | ufw enable
  log "防火墙已启用 (22, 80, 443)"
fi

# ---------- 8. 拉取镜像并启动 ----------
log "登录 GHCR 并拉取镜像 ..."
cd "$APP_DIR"

echo "请手动登录 GHCR（需要 GitHub Token）:"
echo "  docker login ghcr.io -u <你的GitHub用户名>"

read -rp "是否已有 GitHub Token 并继续? (y/n) " yn
case $yn in
  [Yy]* )
    # 拉取并启动（如果登录成功）
    docker compose pull 2>/dev/null || warn "拉取失败，可能未登录或镜像不存在"
    docker compose up -d 2>/dev/null || warn "启动失败，请检查 .env 和 docker login"
    ;;
  * )
    warn "跳过拉取，请稍后手动执行:"
    warn "  cd $APP_DIR"
    warn "  docker login ghcr.io"
    warn "  docker compose pull"
    warn "  docker compose up -d"
    ;;
esac

# ---------- 9. 汇总 ----------
echo ""
echo "========================================"
echo -e "  ${GREEN}服务器初始化完成${NC}"
echo "========================================"
echo "  域名:      https://${DOMAIN}"
echo "  应用目录:  ${APP_DIR}"
echo "  .env:      ${APP_DIR}/.env (请确保已填入邮箱/密码)"
echo ""
echo "  首次部署后的收尾操作:"
echo "  1. 编辑 .env: vi ${APP_DIR}/.env"
echo "  2. 登录 GHCR: docker login ghcr.io"
echo "  3. 拉取启动:  cd ${APP_DIR} && docker compose up -d"
echo "  4. 运行迁移:  docker compose exec -T app node node_modules/typeorm/cli.js migration:run -d dist/config/data-source.js"
echo "  5. 检查日志:  docker compose logs -f app"
echo "  6. 删除 seed 环境变量（SEED_ADMIN_*），防止重启时误创建"
echo "========================================"
