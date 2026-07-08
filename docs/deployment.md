# Deployment Guide

## 1. Server requirements
- Node.js 18+ LTS (recommend 20 or 22)
- MySQL 8.0+ (utf8mb4)
- A process manager (PM2 recommended) or a container runtime
- A reverse proxy with TLS (Nginx / Caddy / Cloudflare)

## 2. Environment
Set production env (see `.env.example`). Critical for production:
```
NODE_ENV=production
APP_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
JWT_SECRET=<64+ char random>
JWT_REFRESH_SECRET=<64+ char random>
SESSION_SECRET=<64+ char random>
DB_HOST=... DB_PASSWORD=...
ZARINPAL_SANDBOX=false
ZARINPAL_MERCHANT_ID=<real merchant id>
MAIL_TRANSPORT=smtp
MAIL_HOST=... MAIL_USER=... MAIL_PASS=...
```
Generate secrets with `openssl rand -hex 48`.

## 3. Database
```sql
CREATE DATABASE prime_one CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'primeone'@'%' IDENTIFIED BY '...';
GRANT ALL ON prime_one.* TO 'primeone'@'%';
```
```bash
npm run migrate
npm run seed      # only for first install / staging; skip on prod redeploys
```

## 4. Build & start
```bash
npm ci --omit=dev        # install prod deps only
npm run build:css        # compile Tailwind
npm start                # node src/server.js
```
With PM2:
```bash
pm2 start src/server.js --name prime-one -i 2
pm2 save && pm2 startup
```

## 5. Reverse proxy (Nginx example)
```nginx
server {
  listen 443 ssl http2;
  server_name your-domain.com;
  # ssl_certificate ...

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  # Cache static aggressively
  location ~* \.(css|js|png|jpg|jpeg|webp|svg|woff2)$ {
    proxy_pass http://127.0.0.1:3000;
    expires 7d; add_header Cache-Control "public, immutable";
  }
  client_max_body_size 12m;   # allow image uploads
}
```

## 6. TLS / cookies
In production, `access_token` / `refresh_token` cookies are set with
`secure: true` and `sameSite: 'lax'`. Ensure TLS terminates before the app and
that `X-Forwarded-Proto` is trusted (the app sets `trust proxy = 1`).

## 7. Uploads
`uploads/` is written at runtime. On multi-instance deployments, use shared
storage (NFS, S3 via a mounted bucket, or a dedicated upload microservice) and
update `UPLOAD_DIR` accordingly.

## 8. Backups
- **DB**: schedule `mysqldump --single-transaction prime_one | gzip` (Phase 1
  has no in-app backup UI yet).
- **Uploads**: sync the `uploads/` directory to object storage.

## 9. Health & monitoring
- `GET /api/health` for liveness/readiness probes.
- PM2 + a log aggregator for Winston logs.

## 10. Updates
```bash
git pull
npm ci --omit=dev
npm run migrate      # apply new migrations
npm run build:css
pm2 reload prime-one
```
