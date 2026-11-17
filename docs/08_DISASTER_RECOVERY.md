# KẾ HOẠCH PHÒNG NGỪA & ỨNG CỨU THẢM HỌA (DISASTER RECOVERY PLAN)
## CHIẾN LƯỢC SAO LƯU DỮ LIỆU, ROLLBACK & KHÔI PHỤC DỊCH VỤ SHOPFLOW

> **Phiên bản tài liệu:** 1.0.0 (Release Candidate)  
> **Cập nhật lần cuối:** 17/11/2026  
> **Phạm vi áp dụng:** Toàn bộ dữ liệu PostgreSQL, hàng đợi Redis và cụm ứng dụng ShopFlow  
> **Tài liệu liên quan:** [docs/00_INDEX.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/00_INDEX.md) • [docs/07_PRODUCTION_RUNBOOK.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/07_PRODUCTION_RUNBOOK.md)

---

## 1. MỤC TIÊU PHỤC HỒI DỊCH VỤ (RECOVERY OBJECTIVES)

Nền tảng ShopFlow đặt ra các chỉ số cam kết chất lượng dịch vụ (SLA) và phục hồi sau thảm họa:

```
               Thời điểm Backup                       Thời điểm Thảm họa                     Phục hồi Hoàn tất
                     │                                       │                                       │
                     ▼                                       ▼                                       ▼
  ───[Dữ liệu an toàn]─────────[Dữ liệu mất mát]─────────────┼──────────[Dịch vụ gián đoạn]──────────┼───> Thời gian
                               └──────────┬──────────┘       └───────────────────┬───────────────────┘
                                          │                                      │
                                     RPO <= 1 giờ                           RTO <= 30 phút
```

| Chỉ Số Mục Tiêu | Giá Trị Cam Kết | Ý Nghĩa Kỹ Thuật |
| :--- | :---: | :--- |
| **RPO (Recovery Point Objective)** | **<= 1 giờ** | Độ trễ dữ liệu tối đa chấp nhận được giữa bản backup gần nhất và thời điểm thảm họa xảy ra. |
| **RTO (Recovery Time Objective)** | **<= 30 phút** | Khoảng thời gian tối đa để đưa toàn bộ cụm dịch vụ hoạt động bình thường trở lại. |
| **Data Integrity Level** | **100% ACID** | Đảm bảo tính nhất quán của bảng `orders`, `order_items`, `customers` và `page_members`. |

---

## 2. PHÂN LOẠI CẤP ĐỘ SỰ CỐ & THẢM HỌA

| Cấp độ | Phân loại | Tình huống thực tế | Hành động ưu tiên |
| :---: | :--- | :--- | :--- |
| **P0 (Critical)** | **Thảm họa máy chủ / Mất dữ liệu** | Máy chủ vật lý hỏng, ổ cứng NVMe lỗi, dữ liệu Postgres hỏng hoàn toàn. | Dựng máy chủ mới, kéo bản backup S3/Off-site, chạy `scripts/restore-db.sh`. |
| **P1 (High)** | **Triển khai phiên bản lỗi (Bad Deploy)** | Bản release mới gây crash container, lỗi API contract, hoặc rò rỉ bộ nhớ nghiêm trọng. | Rollback tức thời về Git SHA trước đó, kiểm tra health check. |
| **P2 (Medium)** | **Crash Redis / Nghẽn BullMQ** | Redis bị tràn bộ nhớ hoặc tiến trình Worker bị treo, đơn hàng chậm trễ. | Khởi động lại Redis, xóa hàng đợi DLQ hoặc scale worker. |

---

## 3. CHIẾN LƯỢC SAO LƯU TỰ ĐỘNG (AUTOMATED BACKUP STRATEGY)

### 1. Cơ sở Dữ liệu PostgreSQL
- **Công cụ:** `pg_dump` kết hợp nén `gzip`.
- **Lịch biểu tự động (Cronjob):**
  - **Full Backup:** Chạy hằng ngày vào lúc **02:00 sáng** (giờ thấp điểm).
  - **Incremental Snapshot:** Chạy mỗi **6 giờ** một lần (08:00, 14:00, 20:00).
- **Vị trí lưu trữ cục bộ:** `/var/backups/shopflow/postgres/`
- **Chính sách xoay vòng lưu trữ (Retention Policy):**
  - Lưu giữ bản backup cục bộ trong **30 ngày**.
  - Các bản cũ hơn 30 ngày sẽ được script dọn dẹp tự động.
- **Sao lưu Off-Site (Secondary Storage):**
  - Tự động mã hóa và đồng bộ lên Cloud Storage (AWS S3 / Wasabi / Google Drive) qua `rclone`.

### 2. Hàng Đợi & Caching Redis
- Cấu hình bền vững kép trong `docker-compose.prod.yml`:
  - **AOF (Append-Only File):** `--appendonly yes --appendfsync everysec` đảm bảo nếu Redis crash thì tối đa chỉ mất 1 giây dữ liệu giao dịch hàng đợi.
  - **RDB Snapshot:** Ghi file dump định kỳ vào volume `redisdata_prod`.

---

## 4. QUY TRÌNH ỨNG CỨU & KHÔI PHỤC CHI TIẾT

### Kịch Bản 1: Phục Hồi Cơ Sở Dữ Liệu PostgreSQL Từ Bản Backup

Khi dữ liệu bảng bị hỏng hoặc cần khôi phục về trạng thái trước đó:

```bash
# 1. Tạm dừng backend để ngăn ghi dữ liệu mới không nhất quán
docker compose -f docker-compose.prod.yml stop backend

# 2. Liệt kê các bản sao lưu hiện có
ls -lh /var/backups/shopflow/postgres/

# 3. Thực hiện khôi phục dữ liệu bằng script chuẩn
./scripts/restore-db.sh /var/backups/shopflow/postgres/shopflow_backup_YYYYMMDD_HHMMSS.sql.gz

# 4. Kiểm tra tính toàn vẹn của bảng
docker exec -it shopflow_prod_postgres psql -U shopflow_admin -d shopflow_production -c "
  SELECT 
    (SELECT count(*) FROM orders) AS total_orders,
    (SELECT count(*) FROM customers) AS total_customers,
    (SELECT count(*) FROM products) AS total_products;
"

# 5. Khởi động lại Backend và kiểm tra healthcheck
docker compose -f docker-compose.prod.yml start backend
curl -f http://localhost:5000/health
```

---

### Kịch Bản 2: Rollback Tức Thời Khi Triển Khai Phiên Bản Lỗi (Bad Deploy Rollback)

Nếu sau khi deploy bản mới, các tính năng bị lỗi hoặc tỷ lệ lỗi 5xx tăng vọt:

```bash
# Bước 1: Xác định Git commit ổn định trước đó
git log --oneline -n 5

# Bước 2: Chuyển mã nguồn về commit ổn định (ví dụ: abc1234)
git checkout abc1234

# Bước 3: Rebuild hoặc pull container images ổn định
docker compose -f docker-compose.prod.yml build backend frontend

# Bước 4: Khởi động lại các container dịch vụ mà không tắt database/redis
docker compose -f docker-compose.prod.yml up -d --no-deps backend frontend

# Bước 5: Kiểm tra xác nhận dịch vụ đã phục hồi
curl -I http://localhost:3000/
curl -f http://localhost:5000/health
```

---

### Kịch Bản 3: Tái Thiết Lập Cụm Hạ Tầng Từ Đầu (Bare-Metal Disaster Recovery)

Trong trường hợp toàn bộ máy chủ bị hỏng hoặc trung tâm dữ liệu gặp sự cố:

1. **Khởi tạo máy chủ mới:** Cài đặt Ubuntu 22.04 LTS, Docker Engine và Docker Compose.
2. **Kéo mã nguồn dự án:** `git clone https://github.com/MinhNguyen0106/ShopFlow.git /opt/shopflow`.
3. **Phục hồi cấu hình:** Kéo tệp cấu hình bảo mật `.env.production` từ kho lưu trữ bí mật an toàn (Password Manager / Vault).
4. **Kéo bản backup mới nhất từ S3:**
   ```bash
   mkdir -p /var/backups/shopflow/postgres
   rclone copy remote-s3:shopflow-backups/latest.sql.gz /var/backups/shopflow/postgres/
   ```
5. **Khởi động Postgres & Redis trước:**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d postgres redis
   sleep 15
   ```
6. **Khôi phục cơ sở dữ liệu:**
   ```bash
   ./scripts/restore-db.sh /var/backups/shopflow/postgres/latest.sql.gz
   ```
7. **Khởi động toàn bộ cụm dịch vụ:**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```
8. **Kiểm tra thông luồng:** Xác nhận Webhook URL trên Meta Developers và truy cập Dashboard qua HTTPS.

---

## 5. DIỄN TẬP PHÒNG NGỪA SỰ CỐ ĐỊNH KỲ (DISASTER DRILL)

- **Tần suất:** Thực hiện diễn tập **mỗi 3 tháng (Quarterly Drill)** trên môi trường Staging/Test.
- **Tiêu chí đánh giá hoàn thành:**
  - [x] Thời gian khôi phục toàn diện không vượt quá **30 phút (RTO)**.
  - [x] Không mất mát bất kỳ bản ghi đơn hàng nào trước mốc backup (**RPO <= 1h**).
  - [x] Mật khẩu người dùng (Bcrypt) và Meta Page Tokens (AES-256) giải mã chính xác 100%.
