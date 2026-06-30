#!/bin/bash
set -e

# ==============================
# SANOVA SHOP — Deploy Script
# Chạy trên VPS Ubuntu 22.04+
# ==============================

echo "🚀 SANOVA Shop — Bắt đầu deploy..."
echo "=================================="

# ---- Bước 1: Cài Docker (nếu chưa có) ----
if ! command -v docker &> /dev/null; then
    echo "📦 Cài Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "✅ Docker đã cài xong. Nếu đây là lần đầu, hãy logout rồi login lại."
    echo "   Sau đó chạy lại script này."
    exit 0
else
    echo "✅ Docker đã có: $(docker --version)"
fi

# ---- Bước 2: Kiểm tra file .env ----
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        cp .env.production .env
        echo "⚠️  File .env đã tạo từ .env.production"
        echo "   HÃY SỬA MẬT KHẨU trong .env trước khi tiếp tục!"
        echo ""
        echo "   nano .env"
        echo ""
        echo "   Sau khi sửa xong, chạy lại: bash deploy.sh"
        exit 0
    else
        echo "❌ Không tìm thấy file .env hoặc .env.production"
        echo "   Tạo file .env với nội dung:"
        echo "   DB_USER=sanova"
        echo "   DB_PASSWORD=mat_khau_manh"
        echo "   DB_NAME=sanova_db"
        echo "   ADMIN_PASSWORD=mat_khau_admin"
        exit 1
    fi
fi

echo "✅ File .env đã có"

# Load env vars
set -a
source .env
set +a

# ---- Bước 3: Build và khởi động containers ----
echo "🔨 Build và khởi động Docker containers..."
docker compose -f docker-compose.prod.yml --env-file .env up --build -d

echo "⏳ Đợi PostgreSQL khởi động..."
sleep 5

# ---- Bước 4: Tạo bảng database ----
echo "📊 Tạo bảng database..."
docker compose -f docker-compose.prod.yml exec app npx drizzle-kit push

# ---- Bước 5: Seed data (chỉ lần đầu) ----
read -p "🌱 Bạn có muốn seed data mẫu? (y/n): " SEED_ANSWER
if [ "$SEED_ANSWER" = "y" ] || [ "$SEED_ANSWER" = "Y" ]; then
    docker compose -f docker-compose.prod.yml exec app npx tsx server/seed.ts
    echo "✅ Seed data thành công"
else
    echo "⏭️  Bỏ qua seed data"
fi

# ---- Bước 6: Kiểm tra ----
echo ""
echo "=================================="
echo "✅ Deploy thành công!"
echo "=================================="
echo ""
echo "🌐 Website:     http://$(hostname -I | awk '{print $1}'):8080"
echo "🔧 Admin panel:  http://$(hostname -I | awk '{print $1}'):8080/admin"
echo ""
echo "📋 Các bước tiếp theo:"
echo "   1. Cài Nginx reverse proxy (xem file nginx.conf)"
echo "   2. Cài SSL với Certbot"
echo "   3. Trỏ domain về IP server"
echo ""
echo "📋 Lệnh hữu ích:"
echo "   Xem logs:      docker compose -f docker-compose.prod.yml logs -f"
echo "   Restart:        docker compose -f docker-compose.prod.yml restart"
echo "   Dừng:           docker compose -f docker-compose.prod.yml down"
echo "   Cập nhật code:  git pull && bash deploy.sh"
