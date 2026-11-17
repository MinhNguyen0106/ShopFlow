# SỔ TAY VẬN HÀNH HỆ THỐNG SHOPFLOW (PRODUCTION RUNBOOK)
## HƯỚNG DẪN TRIỂN KHAI, GIÁM SÁT & BẢO TRÌ MÔI TRƯỜNG PRODUCTION

> **Phiên bản tài liệu:** 1.0.0 (Release Candidate)  
> **Cập nhật lần cuối:** 17/11/2026  
> **Phạm vi áp dụng:** Hạ tầng máy chủ Production của nền tảng ShopFlow  
> **Tài liệu liên quan:** [docs/00_INDEX.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/00_INDEX.md) • [docs/02_ARCHITECTURE_AND_FLOWS.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/02_ARCHITECTURE_AND_FLOWS.md) • [docs/08_DISASTER_RECOVERY.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/08_DISASTER_RECOVERY.md)

---

## 1. TỔNG QUAN KIẾN TRÚC HẠ TẦNG PRODUCTION

Môi trường Production của ShopFlow được đóng gói và điều phối thông qua cụm 5 containers độc lập, phân tách mạng nội bộ và cổng ra vào bảo mật:

```
                          Internet (HTTPS / Port 443)
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │  shopflow_prod_nginx (Gateway) │ (Port 80/443, SSL/TLS, Rate Limiter)
                      └───────────────┬────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 │                                         │
                 ▼                                         ▼
   ┌───────────────────────────┐             ┌───────────────────────────┐
   │ shopflow_prod_frontend    │             │ shopflow_prod_backend     │
   │ Next.js 14 Standalone     │             │ Express.js Clean Arch     │
   │ (Port 3000 nội bộ)        │             │ (Port 5000 nội bộ)        │
   └───────────────────────────┘             └─────────────┬─────────────┘
                                                           │
                                ┌──────────────────────────┴──────────────────────────┐
                                │                                                     │
                                ▼                                                     ▼
                  ┌───────────────────────────┐                         ┌───────────────────────────┐
                  │ shopflow_prod_postgres    │                         │ shopflow_prod_redis       │
                  │ PostgreSQL 15 Alpine      │                         │ Redis 7 Alpine            │
                  │ (Port 5432 nội bộ, ACID)  │                         │ (Port 6379, Caching & Q)  │
                  └───────────────────────────┘                         └───────────────────────────┘
```

### Thông Số Khuyến Nghị Máy Chủ:
- **Hệ điều hành:** Ubuntu 22.04 LTS / 24.04 LTS (x86_64)
- **Tài nguyên tối thiểu:** 2 vCPU, 4GB RAM, 50GB NVMe SSD
- **Tài nguyên tiêu chuẩn:** 4 vCPU, 8GB RAM, 100GB NVMe SSD
- **Phần mềm yêu cầu:** Docker Engine 24.0+, Docker Compose v2.20+, Git, UFW Firewall

---

## 2. BẢNG BIẾN MÔI TRƯỜNG BẮT BUỘC (`.env.production`)

Trước khi khởi chạy hệ thống, tạo tệp `.env.production` tại thư mục gốc với các thông số cấu hình:

| Tên Biến | Ý Nghĩa Nghiệp Vụ | Quy Cách & Lưu Ý Bảo Mật |
| :--- | :--- | :--- |
| `NODE_ENV` | Môi trường thực thi | Bắt buộc gán `production` |
| `POSTGRES_DB` | Tên cơ sở dữ liệu | `shopflow_production` |
| `POSTGRES_USER` | Tên tài khoản DB | Không dùng `postgres`, khuyến nghị `shopflow_admin` |
| `POSTGRES_PASSWORD` | Mật khẩu DB | Chuỗi ngẫu nhiên >= 24 ký tự (A-Z, a-z, 0-9, ký tự đặc biệt) |
| `DATABASE_URL` | Chuỗi kết nối DB | `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable` |
| `REDIS_PASSWORD` | Mật khẩu Redis | Chuỗi bảo mật ngẫu nhiên >= 32 ký tự |
| `REDIS_URL` | Chuỗi kết nối Redis | `redis://:${REDIS_PASSWORD}@redis:6379` |
| `JWT_SECRET` | Khóa ký phiên JWT | Chuỗi entropy cao ngẫu nhiên tối thiểu 64 ký tự hex |
| `ENCRYPTION_KEY` | Khóa mã hóa AES-256-GCM | Bắt buộc đúng 64 ký tự hex (32 bytes) dùng mã hóa Meta Page Tokens |
| `FACEBOOK_APP_ID` | App ID Meta Developers | ID ứng dụng Meta đã được phê duyệt permissions |
| `FACEBOOK_APP_SECRET`| Khóa bí mật Meta | Dùng để xác thực HMAC-SHA256 chữ ký Webhook |
| `FACEBOOK_VERIFY_TOKEN`| Mã xác thực Webhook | Chuỗi token ngẫu nhiên khai báo trên Meta Webhooks Dashboard |
| `GEMINI_API_KEY` | Khóa API Google Gemini | Dùng trích xuất thực thể đơn hàng (OrderParserService) |
| `CLOUDINARY_URL` | Cấu hình lưu trữ Media | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` |
| `NEXT_PUBLIC_API_URL` | URL Gateway công khai | `https://api.yourdomain.vn` |

---

## 3. QUY TRÌNH TRIỂN KHAI LẦN ĐẦU (INITIAL DEPLOYMENT)

### Bước 1: Chuẩn bị máy chủ và sao chép mã nguồn
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git curl
sudo systemctl enable --now docker

git clone https://github.com/MinhNguyen0106/ShopFlow.git /opt/shopflow
cd /opt/shopflow
```

### Bước 2: Thiết lập cấu hình biến môi trường
```bash
cp .env.docker.example .env.production
nano .env.production  # Điền đầy đủ các giá trị production thật
chmod 600 .env.production
```

### Bước 3: Chạy Database Migrations
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npm run db:migrate
```

### Bước 4: Khởi động toàn bộ cụm container
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### Bước 5: Kiểm tra trạng thái hoạt động (Healthcheck Sanity Test)
```bash
# Kiểm tra tình trạng 5 container
docker compose -f docker-compose.prod.yml ps

# Kiểm tra Backend Health API
curl -f http://localhost:5000/health
# Kết quả mong đợi: {"status":"ok","timestamp":"...","uptime":...}

# Kiểm tra Frontend Next.js
curl -I http://localhost:3000/
# Kết quả mong đợi: HTTP/1.1 200 OK
```

---

## 4. GIÁM SÁT TÀI NGUYÊN & QUẢN LÝ LOGS

### 1. Xem nhật ký thời gian thực (Realtime Logging)
```bash
# Xem log toàn bộ hệ thống
docker compose -f docker-compose.prod.yml logs -f --tail=100

# Xem log riêng Backend Express (theo dõi Webhook & BullMQ)
docker compose -f docker-compose.prod.yml logs -f --tail=100 backend

# Xem log Web Nginx Gateway
docker compose -f docker-compose.prod.yml logs -f --tail=100 nginx_gateway
```

### 2. Giám sát tiêu hao tài nguyên CPU & RAM
```bash
docker stats --no-stream
```
*Ngưỡng cảnh báo:* Nếu Backend vượt 1.2GB RAM hoặc Redis vượt 200MB RAM, cần kiểm tra rò rỉ bộ nhớ hoặc cấu hình nén.

---

## 5. BẢO TRÌ ĐỊNH KỲ & XOAY VÒNG SECRETS

### 1. Xoay vòng khóa bí mật (Secret Rotation)
- **JWT Secret:** Cập nhật `JWT_SECRET` trong `.env.production`. Người dùng hiện tại sẽ cần đăng nhập lại phiên mới.
- **Meta App Secret:** Khi đổi App Secret trên Meta Developers Portal, cập nhật biến `FACEBOOK_APP_SECRET` và chạy:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production restart backend
  ```
- **AES-256 Key:** Nếu xoay vòng `ENCRYPTION_KEY`, bắt buộc chạy script re-encrypt toàn bộ Page Access Tokens trước khi thay thế khóa.

### 2. Cắt dọn Docker Logs & Images rác
```bash
# Dọn dẹp images không sử dụng
docker image prune -af --filter "until=168h"

# Dọn dẹp cache build
docker builder prune -af
```

---

## 6. SỔ TAY PHÂN GIẢI SỰ CỐ NHANH (INCIDENT PLAYBOOK)

### Sự cố 1: Backend trả lời HTTP 500 hoặc mất kết nối DB
- **Triệu chứng:** Người dùng gặp lỗi "Internal Server Error", logs báo `Connection terminated unexpectedly` hoặc `Too many clients`.
- **Cách xử lý:**
  1. Kiểm tra trạng thái container Postgres: `docker compose -f docker-compose.prod.yml ps postgres`
  2. Xem dung lượng ổ cứng: `df -h` (Nếu disk 100%, giải phóng file log).
  3. Kiểm tra số lượng kết nối đang mở:
     ```bash
     docker exec -it shopflow_prod_postgres psql -U shopflow_admin -d shopflow_production -c "SELECT count(*) FROM pg_stat_activity;"
     ```
  4. Khởi động lại backend an toàn: `docker compose -f docker-compose.prod.yml restart backend`.

### Sự cố 2: Webhook Facebook bị từ chối `400 Bad Request` hoặc `401 Unauthorized`
- **Triệu chứng:** Khách bình luận trên Fanpage nhưng hệ thống không ẩn SĐT, không phản hồi tự động.
- **Cách xử lý:**
  1. Kiểm tra chữ ký HMAC trong logs: `docker compose -f docker-compose.prod.yml logs backend | grep -i "signature"`
  2. Xác minh `FACEBOOK_APP_SECRET` trong `.env.production` có trùng khớp với App Secret trên Meta Dashboard không.
  3. Kiểm tra Raw Body Buffer middleware không bị can thiệp bởi body parser khác.

### Sự cố 3: Hàng đợi BullMQ bị nghẽn (Worker Stalled)
- **Triệu chứng:** Bài viết đặt lịch không được xuất bản đúng giờ vàng hoặc tin nhắn trả lời chậm trễ.
- **Cách xử lý:**
  1. Kiểm tra Redis connection: `docker exec -it shopflow_prod_redis redis-cli ping`
  2. Kiểm tra bộ nhớ Redis: `docker exec -it shopflow_prod_redis redis-cli info memory`
  3. Khởi động lại worker: `docker compose -f docker-compose.prod.yml restart backend`.
