# BẢNG KẾ HOẠCH THỰC THI DỰ ÁN SHOPFLOW (TASK.MD)
> **Sprint Hiện Tại:** MVP Implementation Sprint 1 (Khởi tạo Nền tảng, Cơ sở dữ liệu & Động cơ Webhook)  
> **Cập nhật lần cuối:** 19/10/2026  
> **Tài liệu tham chiếu:** [docs/00_INDEX.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/00_INDEX.md) • [docs/03_DATABASE_SCHEMA.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/03_DATABASE_SCHEMA.md) • [docs/05_DESIGN_SYSTEM.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/05_DESIGN_SYSTEM.md) • [docs/06_UI_SCREENS_AND_COMPONENTS.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/06_UI_SCREENS_AND_COMPONENTS.md)

---

## 📌 NGUYÊN TẮC VẬN HÀNH BẮT BUỘC (OPERATING PRINCIPLES)

1. **Đọc Trước Khi Làm (Read First):** Trước khi bắt tay vào viết mã cho bất kỳ tính năng hoặc tác vụ nào, AI Agent bắt buộc phải đọc lại tệp `Task.md` này để nắm vững bối cảnh, phạm vi và trạng thái hiện tại.
2. **Cập Nhật Ngay Lập Tức (Instant Update):** Ngay sau khi hoàn thành một bước hành động (Action Item), AI Agent phải tự động cập nhật đánh dấu checkbox `[x]` và chuyển dịch trạng thái công việc tương ứng (`Todo` ➔ `In Progress` ➔ `Done`).
3. **An Toàn Hệ Thống (Strict Safety Gate):** Tuyệt đối không thực hiện các hành động nguy hiểm (như xóa cơ sở dữ liệu, `DROP TABLE`, thay đổi cấu trúc kiến trúc gốc, `git push --force`) mà chưa ghi chú rõ ràng vào kế hoạch và nhận được sự xác nhận từ người dùng.
4. **Chuẩn Mực Mã Nguồn (Code Quality):** Tuân thủ TypeScript Strict (`noImplicitAny`), Clean Architecture, không commit bí mật/token vào git, xác thực chữ ký Webhook HMAC-SHA256 với `timingSafeEqual`.

---

## 🚀 DANH MỤC CÔNG VIỆC SPRINT 1

### 📋 TRẠNG THÁI: IN PROGRESS (ĐANG THỰC HIỆN)
*(Hiện tại chưa có tác vụ nào đang trong quá trình thực thi dở dang)*

---

### 📝 TRẠNG THÁI: TODO (CHƯA BẮT ĐẦU)

---

#### [TASK-02] Khởi tạo tệp `docker-compose.yml` cho PostgreSQL 15+ và Redis 7+
- [ ] **2.1.** Soạn thảo tệp `docker-compose.yml` tại thư mục gốc:
  - [ ] Cấu hình service `postgres`:
    - Image: `postgres:15-alpine`
    - Container name: `shopflow_postgres`
    - Volume: `pgdata:/var/lib/postgresql/data`
    - Port mapping: `5432:5432`
    - Environment variables: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
    - Healthcheck: `pg_isready -U shopflow_user -d shopflow_db`
  - [ ] Cấu hình service `redis`:
    - Image: `redis:7-alpine`
    - Container name: `shopflow_redis`
    - Volume: `redisdata:/data`
    - Port mapping: `6379:6379`
    - Command: `redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy noeviction`
    - Healthcheck: `redis-cli ping`
- [ ] **2.2.** Khởi tạo tệp `.env.docker.example` chứa thông tin cấu hình mặc định an toàn cho môi trường phát triển cục bộ.
- [ ] **2.3.** Viết script kiểm tra kết nối dịch vụ Docker `scripts/test-services.ps1`.

---

#### [TASK-03] Thực thi tệp SQL DDL từ `docs/03_DATABASE_SCHEMA.md` khởi tạo toàn bộ 9 bảng, partial indexes và triggers
- [ ] **3.1.** Biên soạn tệp script DDL PostgreSQL hoàn chỉnh tại `backend/src/infrastructure/database/migrations/001_initial_schema.sql`:
  - [ ] Kích hoạt extension `uuid-ossp` (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`).
  - [ ] Khởi tạo Bảng 1: `users` (Tài khoản chủ shop & nhân viên).
  - [ ] Khởi tạo Bảng 2: `facebook_accounts` (Tài khoản Facebook OAuth).
  - [ ] Khởi tạo Bảng 3: `connected_pages` (Fanpage kết nối, token AES-256).
  - [ ] Khởi tạo Bảng 4: `automation_rules` (Quy tắc tự động & ẩn SĐT).
  - [ ] Khởi tạo Bảng 5: `posts_schedule` (Bài viết đặt lịch xuất bản).
  - [ ] Khởi tạo Bảng 6: `customers` (Khách hàng CRM, SĐT, tags).
  - [ ] Khởi tạo Bảng 7: `conversations` (Hội thoại hợp nhất Inbox/Comment, cửa sổ 24h).
  - [ ] Khởi tạo Bảng 8: `messages_and_comments` (Chi tiết tin nhắn & bình luận).
  - [ ] Khởi tạo Bảng 9: `webhook_logs` (Nhật ký sự kiện webhook, Idempotency).
  - [ ] Thiết lập đầy đủ các Khóa ngoại (Foreign Keys) kèm quy tắc `ON DELETE CASCADE` / `RESTRICT`.
  - [ ] Thiết lập các Chỉ mục (Indexes & Partial Indexes): `idx_pages_active`, `idx_conversations_open`, `idx_customers_phone`, GIN index trên các cột `JSONB`.
  - [ ] Thiết lập Hàm và Trigger tự động cập nhật `updated_at` cho các bảng cần thiết.
- [ ] **3.2.** Viết script migration runner `backend/src/infrastructure/database/migrate.ts` để thực thi tự động qua lệnh `npm run db:migrate`.

---

#### [TASK-04] Xây dựng tầng hạ tầng kết nối cơ sở dữ liệu `backend/src/infrastructure/database/db.client.ts` (`pg.Pool` Singleton)
- [ ] **4.1.** Cài đặt thư viện `pg` và `@types/pg`.
- [ ] **4.2.** Xây dựng module `backend/src/infrastructure/database/db.client.ts`:
  - [ ] Khởi tạo instance `pg.Pool` theo Singleton pattern, đọc cấu hình từ biến môi trường.
  - [ ] Cấu hình Pool tối ưu: `max: 20`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`.
  - [ ] Cung cấp hàm `query(text, params)` có typing rõ ràng, tự động bắt lỗi và ghi log thời gian thực thi (query profiling).
  - [ ] Cung cấp hàm `withTransaction(callback)` hỗ trợ transaction an toàn (`BEGIN`, `COMMIT`, tự động `ROLLBACK` khi có lỗi).
  - [ ] Cung cấp hàm `testConnection()` kiểm tra trạng thái database khi khởi động server.
  - [ ] Đăng ký hooks xử lý Graceful Shutdown (`SIGINT`, `SIGTERM`) đóng kết nối pool an toàn.
- [ ] **4.3.** Viết unit test / integration test cho module `db.client.ts`.

---

#### [TASK-05] Xây dựng generic validation middleware `validateRequest` với Zod
- [ ] **5.1.** Cài đặt thư viện `zod`.
- [ ] **5.2.** Xây dựng tệp `backend/src/api/middlewares/validate-request.middleware.ts`:
  - [ ] Nhận interface cấu hình Zod schemas cho `body`, `query`, `params`.
  - [ ] Phân tích và kiểm tra tính hợp lệ của request trước khi chuyển vào controller.
  - [ ] Trả về mã lỗi HTTP `400 Bad Request` với cấu trúc JSON chuẩn hóa khi dữ liệu không hợp lệ:
    ```json
    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Dữ liệu yêu cầu không hợp lệ",
        "details": [{ "field": "email", "issue": "Email không đúng định dạng" }]
      }
    }
    ```
- [ ] **5.3.** Xây dựng Global Error Handler middleware `backend/src/api/middlewares/error-handler.middleware.ts` xử lý ngoại lệ tập trung.
- [ ] **5.4.** Viết unit test cho `validateRequest` middleware kiểm thử các trường hợp dữ liệu hợp lệ và không hợp lệ.

---

#### [TASK-06] Triển khai Module Xác thực `auth` (Đăng ký, Đăng nhập, JWT Access/Refresh tokens)
- [ ] **6.1.** Cài đặt thư viện bảo mật: `bcryptjs`, `@types/bcryptjs`, `jsonwebtoken`, `@types/jsonwebtoken`.
- [ ] **6.2.** Xây dựng Zod Schemas tại `backend/src/api/dtos/auth.dto.ts`:
  - [ ] `RegisterDtoSchema`: `email`, `password` (tối thiểu 8 ký tự, có số và chữ cái), `full_name`.
  - [ ] `LoginDtoSchema`: `email`, `password`.
  - [ ] `RefreshTokenDtoSchema`: `refreshToken`.
- [ ] **6.3.** Xây dựng Helper JWT & Password tại `backend/src/utils/auth.helper.ts`:
  - [ ] Hàm hash mật khẩu `hashPassword` và đối soát `verifyPassword`.
  - [ ] Hàm tạo cặp token: Access Token (hạn 15 phút) và Refresh Token (hạn 7 ngày).
  - [ ] Hàm xác thực và giải mã token `verifyAccessToken`, `verifyRefreshToken`.
- [ ] **6.4.** Xây dựng Repository & Service:
  - [ ] `backend/src/infrastructure/repositories/user.repository.ts`: Truy vấn `findByEmail`, `create`, `findById`.
  - [ ] `backend/src/core/services/auth.service.ts`: Nghiệp vụ đăng ký, đăng nhập, cấp lại token mới.
- [ ] **6.5.** Xây dựng Controller & Routes:
  - [ ] `backend/src/api/controllers/auth.controller.ts`
  - [ ] `backend/src/api/routes/auth.routes.ts`:
    - `POST /api/v1/auth/register`
    - `POST /api/v1/auth/login`
    - `POST /api/v1/auth/refresh-token`
- [ ] **6.6.** Xây dựng Middleware xác thực `authenticateToken` tại `backend/src/api/middlewares/auth.middleware.ts` để bảo vệ các endpoint nghiệp vụ.
- [ ] **6.7.** Viết unit tests và integration tests cho luồng Auth (Đăng ký thành công, Báo lỗi trùng email, Đăng nhập sai mật khẩu, Cấp token mới).

---

#### [TASK-07] Triển khai Webhook Ingestion Router & Controller kèm HMAC-SHA256 Verifier
- [ ] **7.1.** Xây dựng Middleware xác thực chữ ký Meta `verifyMetaSignature`:
  - [ ] Cấu hình Express lưu lại `req.rawBody` dưới dạng Buffer khi nhận request Webhook.
  - [ ] Trích xuất chữ ký từ header `x-hub-signature-256`.
  - [ ] Tính toán mã hash HMAC-SHA256 bằng `crypto.createHmac('sha256', FACEBOOK_APP_SECRET)`.
  - [ ] So sánh hai buffer chữ ký bằng `crypto.timingSafeEqual` để loại trừ hoàn toàn nguy cơ Timing Attacks.
  - [ ] Trả về `401 Unauthorized` ngay lập tức nếu chữ ký sai lệch hoặc bị thiếu.
- [ ] **7.2.** Triển khai Endpoint Handshake (GET `/api/v1/webhook`):
  - [ ] Kiểm tra tham số `hub.mode === 'subscribe'` và `hub.verify_token === FACEBOOK_VERIFY_TOKEN`.
  - [ ] Trả về giá trị `hub.challenge` dạng chuỗi thô để vượt qua vòng kiểm duyệt của Meta Graph API.
- [ ] **7.3.** Triển khai Endpoint Ingestion (POST `/api/v1/webhook`):
  - [ ] Nhận payload sự kiện từ Facebook (Page changes, feed comments, messenger messages).
  - [ ] Kiểm tra trùng lặp (Idempotency) dựa trên Redis: Kiểm tra mã `event_id` / `mid` / `comment_id` với TTL 24 giờ.
  - [ ] Ghi nhận sự kiện thô vào bảng `webhook_logs` (trạng thái `pending`).
  - [ ] Trả về HTTP `200 OK` ngay lập tức (< 1 giây) để ngăn Meta retry dồn dập.
  - [ ] Phân luồng sự kiện và đẩy payload vào hàng đợi BullMQ để xử lý bất đồng bộ.
- [ ] **7.4.** Viết unit tests kiểm tra HMAC Verifier và Webhook Handshake.

---

#### [TASK-08] Triển khai BullMQ Queue & Worker quét Regex ẩn SĐT trong < 3 giây
- [ ] **8.1.** Cài đặt thư viện hàng đợi: `bullmq`, `ioredis`.
- [ ] **8.2.** Khởi tạo tầng cấu hình Queue tại `backend/src/infrastructure/queue/bullmq.client.ts`:
  - [ ] Khởi tạo kết nối Redis cho BullMQ.
  - [ ] Khởi tạo hàng đợi `webhook-processing-queue` và `phone-masking-queue`.
- [ ] **8.3.** Xây dựng Service nhận diện & quét số điện thoại:
  - [ ] Xây dựng bộ biểu thức chính quy (Regex) tối ưu chuyên biệt cho các định dạng số điện thoại tại Việt Nam (các đầu số `03`, `05`, `07`, `08`, `09`, xử lý các biến thể chứa khoảng trắng, dấu chấm, dấu gạch nối, số viết cách điệu).
  - [ ] Hàm kiểm tra phát hiện số điện thoại trong nội dung bình luận (`extractPhoneNumbers`).
- [ ] **8.4.** Xây dựng Worker xử lý ẩn số điện thoại `backend/src/infrastructure/queue/phone-masking.worker.ts`:
  - [ ] Khi phát hiện bình luận có SĐT: Gọi ngay Meta Graph API (`POST /{comment-id}`, param `is_hidden=true`) bằng Page Access Token tương ứng.
  - [ ] Đảm bảo toàn bộ chu trình từ khi nhận webhook đến khi ẩn bình luận hoàn tất trong **< 3 giây**.
  - [ ] Tự động tạo/cập nhật thông tin khách hàng trong bảng `customers` (mã hóa SĐT, gán tag `["Co_SDT"]`).
  - [ ] Lưu tin nhắn/bình luận vào bảng `messages_and_comments` với cờ `is_hidden = true`.
  - [ ] Cập nhật trạng thái sự kiện trong `webhook_logs` thành `processed`.
- [ ] **8.5.** Cấu hình giới hạn tần suất (Rate Limiter) và cơ chế Dead Letter Queue (DLQ) chống spam và retry an toàn khi gặp lỗi mạng.
- [ ] **8.6.** Viết unit tests cho Phone Detection Regex và kiểm thử worker với payload mock.

---

### ✅ TRẠNG THÁI: DONE (ĐÃ HOÀN THÀNH)

#### [TASK-01] Khởi tạo khung thư mục Monorepo chuẩn hóa (`backend/` và `frontend/`)
- [x] **1.1.** Khởi tạo cấu hình Monorepo tại thư mục gốc (`package.json` với npm workspaces `backend`, `frontend`, tệp `.gitignore` chuẩn hóa).
- [x] **1.2.** Thiết lập dự án `backend/` với Node.js 20+ LTS (Node v24.12.0), Express.js, TypeScript strict mode:
  - [x] Khởi tạo `backend/package.json` và cài đặt dependencies cốt lõi (`express`, `dotenv`, `cors`, `helmet`, `zod`, `pino`, `pino-pretty`).
  - [x] Cấu hình `backend/tsconfig.json` với `"strict": true`, `"noImplicitAny": true`, path aliases (`@core/*`, `@infrastructure/*`, `@api/*`, `@config/*`, `@utils/*`).
  - [x] Tạo cấu trúc thư mục Clean Architecture (`api/`, `core/`, `infrastructure/`, `config/`, `utils/`).
  - [x] Tạo tệp `backend/src/index.ts`, `backend/src/app.ts`, `backend/src/api/routes/health.routes.ts`, `backend/src/api/routes/index.ts`.
  - [x] Tạo tệp `backend/.env.example` và `backend/.env` chuẩn hóa các biến môi trường.
  - [x] Tích hợp middleware Express giữ `rawBody` Buffer cho Webhook HMAC-SHA256 verification (Task-07).
  - [x] Đã kiểm thử thành công: TypeScript type-check 100% không lỗi; server dev khởi động ổn định trên cổng 5000; phản hồi HTTP 200 OK tại `GET /health` và `GET /api/v1/health`.
- [x] **1.3.** Khởi tạo cấu trúc dự án `frontend/` (Next.js 14+ App Router, Tailwind CSS, TypeScript, đồng bộ 100% token Design System và Blueprint Grid).
- [x] **[SETUP] Khảo sát nghiệp vụ & Cấu hình môi trường AI Agent** (Hoàn thành trong các sprint chuẩn bị)
- [x] **[DESIGN] Thiết kế Hệ thống UI & Mockups 14 Màn hình chuẩn macOS Clean Utility** (Hoàn thành trọn bộ 14/14 màn hình trên Stitch MCP)
- [x] **[LIFECYCLE] Thiết lập Lifecycle Hook phát âm thanh "ting" khi hoàn thành task** (`.agent/hooks.json`)

---

## 📅 NHẬT KÝ CẬP NHẬT TIẾN ĐỘ SPRINT (PROGRESS LOG)

| Thời gian | Tác vụ | Trạng thái | Ghi chú |
| :--- | :--- | :---: | :--- |
| 19/10/2026 | Khởi tạo bảng kế hoạch chi tiết `Task.md` | **DONE** | Lập kế hoạch 8 hạng mục công việc lớn, chia nhỏ thành các checkbox hành động cụ thể. |
| 19/10/2026 | [TASK-01] Khởi tạo Monorepo (`backend/` & `frontend/`) | **DONE** | Thiết lập Express Clean Architecture + Next.js 14, cài đặt dependencies, pass type-check & health check HTTP 200 OK. |

