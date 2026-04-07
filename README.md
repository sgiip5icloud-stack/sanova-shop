# SANOVA Shop — E-Commerce Website

Website bán hàng cho SANOVA Reed Diffuser, target thị trường Philippines.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v4 + wouter + TanStack Query
- **Backend:** Express.js + TypeScript (tsx)
- **Database:** PostgreSQL + Drizzle ORM
- **Deploy:** Docker Compose

---

## 🚀 Cách chạy trên Local

### Yêu cầu
- Node.js 20+
- PostgreSQL 16+ (hoặc Docker)

### Bước 1: Khởi động PostgreSQL

**Cách A — Dùng Docker (khuyên dùng):**
```bash
docker compose up postgres -d
```

**Cách B — PostgreSQL sẵn có:**
Tạo database `sanova_db` và cập nhật `DATABASE_URL` trong file `.env`.

### Bước 2: Cài dependencies
```bash
npm install
cd client && npm install && cd ..
```

### Bước 3: Tạo bảng & seed data
```bash
npx drizzle-kit push
npx tsx server/seed.ts
```

### Bước 4: Chạy dev server
```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:8080/api
- Admin panel: http://localhost:5173/admin (password: `sanova-admin-2024`)

---

## 🐳 Deploy bằng Docker Compose

```bash
# Build và chạy toàn bộ (PostgreSQL + App)
docker compose up --build -d

# Tạo bảng và seed data
docker compose exec app npx drizzle-kit push
docker compose exec app npx tsx server/seed.ts
```

Website chạy tại: http://localhost:8080

---

## 🌐 Deploy lên Server với tên miền

### 1. Trên VPS (Ubuntu)
```bash
# Cài Docker
curl -fsSL https://get.docker.com | sh

# Clone project lên server
git clone <your-repo> sanova-shop
cd sanova-shop

# Chạy
docker compose up --build -d
docker compose exec app npx drizzle-kit push
docker compose exec app npx tsx server/seed.ts
```

### 2. Cấu hình Nginx reverse proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. SSL với Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📁 Cấu trúc Project

```
sanova-shop/
├── server/              # Express API
│   ├── index.ts         # Entry point
│   ├── db.ts            # Database connection
│   ├── schema.ts        # Drizzle schema (tất cả bảng)
│   ├── seed.ts          # Seed data sản phẩm + KOL
│   └── routes/          # API routes
│       ├── products.ts
│       ├── auth.ts
│       ├── cart.ts
│       ├── orders.ts
│       └── kol-videos.ts
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/       # Các trang (home, shop, product, cart, checkout...)
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Auth & Cart hooks
│   │   └── lib/         # Utilities (api, format, product-images)
│   └── vite.config.ts
├── assets/              # Ảnh sản phẩm
├── docker-compose.yml
├── Dockerfile
└── .env
```

## Tính năng

- Trang chủ với hero banner, featured products, KOL reviews, benefits
- Trang shop với filter theo scent & pack
- Trang chi tiết sản phẩm với variants, tabs mô tả
- Giỏ hàng (localStorage) + Checkout (COD, Bank, GCash)
- Đăng ký / Đăng nhập / Xem đơn hàng
- Admin panel quản lý KOL videos
- Nút "Buy on Shopee" link ra Shopee PH
- Responsive trên mobile
