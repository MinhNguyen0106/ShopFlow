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
5. **Quy Trình Nhánh & Triển Khai An Toàn (Task Lifecycle & Safe Deploy):** Mọi task bắt buộc phải thực hiện trên một nhánh riêng (`feature/<task-name>`). Chạy toàn bộ test suite; nếu lỗi phải tự động phân tích và sửa lỗi; nếu pass mới merge vào `main` và chạy quy trình triển khai an toàn theo [.agent/workflows/safe-deploy.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agent/workflows/safe-deploy.md) để đẩy code lên GitHub. Chi tiết xem tại [.agent/workflows/task-lifecycle.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agent/workflows/task-lifecycle.md).

---

## 🚀 DANH MỤC CÔNG VIỆC SPRINT 1

### 📋 TRẠNG THÁI: IN PROGRESS (ĐANG THỰC HIỆN)
*(Hiện tại chưa có tác vụ nào đang trong quá trình thực thi dở dang)*

---

### 📝 TRẠNG THÁI: TODO (CHƯA BẮT ĐẦU)
*(Toàn bộ 8/8 tác vụ của Sprint 1 đã hoàn thành xuất sắc!)*

---

### ✅ TRẠNG THÁI: DONE (ĐÃ HOÀN THÀNH)

#### [TASK-08] Triển khai BullMQ Queue & Worker quét Regex ẩn SĐT trong < 3 giây
- [x] **8.1.** Cài đặt thư viện hàng đợi: `bullmq`, `ioredis`.
- [x] **8.2.** Khởi tạo tầng cấu hình Queue tại `backend/src/infrastructure/queue/bullmq.client.ts`:
  - [x] Khởi tạo kết nối Redis cho BullMQ với `maxRetriesPerRequest: null`.
  - [x] Khởi tạo hàng đợi `webhook-processing-queue`, `phone-masking-queue` và `phone-masking-dlq`.
- [x] **8.3.** Xây dựng Service nhận diện & quét số điện thoại:
  - [x] Xây dựng bộ biểu thức chính quy (Regex) tối ưu chuyên biệt cho các định dạng số điện thoại tại Việt Nam (`phone-regex.ts` cho các đầu số `03`, `05`, `07`, `08`, `09`, xử lý các biến thể chứa khoảng trắng, dấu chấm, dấu gạch nối, số viết cách điệu bằng chữ o/O).
  - [x] Hàm kiểm tra phát hiện số điện thoại trong nội dung bình luận (`extractPhoneNumbers`, `normalizePhoneNumber`, `maskPhoneNumber`).
- [x] **8.4.** Xây dựng Worker xử lý ẩn số điện thoại `backend/src/infrastructure/queue/phone-masking.worker.ts`:
  - [x] Khi phát hiện bình luận có SĐT: Gọi ngay Meta Graph API (`POST /{comment-id}`, param `is_hidden=true`) bằng Page Access Token tương ứng.
  - [x] Đảm bảo toàn bộ chu trình từ khi nhận webhook đến khi ẩn bình luận hoàn tất trong **< 3 giây**.
  - [x] Tự động tạo/cập nhật thông tin khách hàng trong bảng `customers` (mã hóa SĐT, gán tag `["Co_SDT"]`).
  - [x] Lưu tin nhắn/bình luận vào bảng `messages_and_comments` với cờ `is_hidden = true`.
  - [x] Cập nhật trạng thái sự kiện trong `webhook_logs` thành `processed`.
- [x] **8.5.** Cấu hình giới hạn tần suất (Rate Limiter) và cơ chế Dead Letter Queue (DLQ) chống spam và retry an toàn khi gặp lỗi mạng:
  - [x] Limiter `max: 20`, `duration: 1000` (giới hạn 20 jobs/s bảo vệ Graph API rate limits).
  - [x] Tự động đẩy job thất bại sau số lần retry vào `phone-masking-dlq` và cập nhật log `failed`.
- [x] **8.6.** Viết unit tests cho Phone Detection Regex và kiểm thử worker với payload mock:
  - [x] Unit test `phone-regex.test.ts` (11 tests).
  - [x] Unit test `bullmq.client.test.ts` (4 tests).
  - [x] Unit test `graph-api.client.test.ts` (3 tests).
  - [x] Unit test `phone-masking.worker.test.ts` (5 tests).
  - [x] Unit tests cho `connected-page.repository`, `customer.repository`, `message-comment.repository` (6 tests).
  - [x] Tổng cộng **145/145 tests passed**, Code Coverage toàn dự án đạt **92.05% Statements, 85.87% Branches, 94.73% Functions, 92.05% Lines** (vượt chuẩn yêu cầu).
- [x] Merge vào `main` và hoàn tất Sprint 1.

---

#### [TASK-07] Triển khai Webhook Ingestion Router & Controller kèm HMAC-SHA256 Verifier
- [x] **7.1.** Xây dựng Middleware xác thực chữ ký Meta `verifyMetaSignature` & `verifyWebhookSignature`:
  - [x] Khai thác `rawBody` Buffer được giữ lại trong cấu hình body parser Express (`express.json`).
  - [x] Trích xuất `x-hub-signature-256`, băm HMAC-SHA256 với `FACEBOOK_APP_SECRET`.
  - [x] Dùng `crypto.timingSafeEqual` loại trừ 100% rủi ro tấn công dò thời gian (Timing Attacks).
  - [x] Từ chối `401 Unauthorized` ngay lập tức nếu thiếu hoặc sai lệch chữ ký.
- [x] **7.2.** Triển khai Endpoint Handshake (`GET /api/v1/webhook`):
  - [x] Kiểm tra điều kiện `hub.mode === 'subscribe'` và `hub.verify_token === FACEBOOK_VERIFY_TOKEN`.
  - [x] Trả về chuỗi `hub.challenge` thô (`text/plain`, HTTP 200) theo đúng tiêu chuẩn Meta Platform.
  - [x] Trả về `403 Forbidden` nếu token không khớp.
- [x] **7.3.** Triển khai Endpoint Ingestion (`POST /api/v1/webhook`):
  - [x] Tiếp nhận payload Feed Comments, Messenger Messages, Page state changes.
  - [x] Chuẩn hóa và bóc tách sự kiện (`extractWebhookEvents`) với unique `eventId` (comment_id / mid / sha256 hash).
  - [x] Ghi nhận vào bảng `webhook_logs` với cơ chế Idempotency `ON CONFLICT (event_id) DO NOTHING`.
  - [x] Phản hồi HTTP `200 OK` (`EVENT_RECEIVED`) ngay lập tức (< 1 giây) để ngăn Meta retry dồn dập.
- [x] **7.4.** Kiểm thử tự động toàn diện:
  - [x] Unit test `webhook-verifier.middleware.test.ts` (11 tests).
  - [x] Unit test `webhook.service.test.ts` (7 tests).
  - [x] Unit test `webhook-log.repository.test.ts` (6 tests).
  - [x] Integration test `webhook.routes.test.ts` (5 tests với `supertest`).
  - [x] Tổng cộng **113/113 tests passed**, Code Coverage toàn dự án đạt **95.42% Statements, 87.43% Branches, 96.36% Functions, 95.42% Lines**.
- [x] Merge vào `main` và push lên GitHub (commit: `6e914fa`).

---

#### [TASK-06] Triển khai Module Xác thực `auth` (Đăng ký, Đăng nhập, JWT Access/Refresh tokens)
- [x] **6.1.** Cài đặt thư viện bảo mật: `bcryptjs@2.4.3`, `@types/bcryptjs`, `jsonwebtoken@9.0.8`, `@types/jsonwebtoken`.
- [x] **6.2.** Xây dựng Zod Schemas tại `backend/src/api/dtos/auth.dto.ts`:
  - [x] `RegisterDtoSchema`: email chuẩn hóa, password tối thiểu 8 ký tự kèm chữ + số, họ tên, role mặc định `owner`.
  - [x] `LoginDtoSchema`: email và password.
  - [x] `RefreshTokenDtoSchema`: refreshToken bắt buộc.
- [x] **6.3.** Xây dựng Helper JWT & Password tại `backend/src/utils/auth.helper.ts`:
  - [x] `hashPassword` (Bcrypt cost factor 12) & `verifyPassword`.
  - [x] `generateTokens`: Access Token (15m, signed with `JWT_ACCESS_SECRET`) và Refresh Token (7d, signed with `JWT_REFRESH_SECRET`).
  - [x] `verifyAccessToken` & `verifyRefreshToken` với phân loại lỗi `TokenExpiredError` vs chữ ký không hợp lệ.
  - [x] `toSafeUser`: bóc tách loại bỏ `password_hash` an toàn trước khi gửi về client.
- [x] **6.4.** Xây dựng Repository & Service:
  - [x] `backend/src/infrastructure/repositories/user.repository.ts`: Thao tác bảng `users` (`findByEmail`, `findById`, `create`, `updateStatus`) qua `db.client.ts` Prepared Statements chống SQL Injection.
  - [x] `backend/src/core/services/auth.service.ts`: Toàn bộ logic `register`, `login`, `refreshToken` hỗ trợ Dependency Injection.
- [x] **6.5.** Xây dựng Controller & Routes:
  - [x] `backend/src/api/controllers/auth.controller.ts`: Tiếp nhận HTTP requests, ánh xạ status code 201 Created, 200 OK.
  - [x] `backend/src/api/routes/auth.routes.ts`: Đăng ký routes `POST /register`, `POST /login`, `POST /refresh-token`, `GET /me`.
  - [x] Mount vào `apiV1Router` tại `backend/src/api/routes/index.ts`.
- [x] **6.6.** Xây dựng Middleware xác thực & phân quyền tại `backend/src/api/middlewares/auth.middleware.ts`:
  - [x] `authenticateToken`: kiểm tra Bearer token trong header Authorization, gán `req.user`.
  - [x] `requireRole(...roles)`: RBAC role guard bảo vệ endpoint theo vai trò.
- [x] **6.7.** Kiểm thử tự động toàn diện:
  - [x] Unit test `auth.helper.test.ts` (10 tests).
  - [x] Unit test `auth.service.test.ts` (8 tests).
  - [x] Unit test `auth.middleware.test.ts` (7 tests).
  - [x] Unit test `user.repository.test.ts` (8 tests).
  - [x] Integration test `auth.routes.test.ts` (8 tests với `supertest`).
  - [x] Tổng cộng **84/84 tests passed**, Code Coverage đạt **95.99%** (toàn bộ tiêu chuẩn chất lượng vượt ngưỡng).
- [x] Merge vào `main` và push lên GitHub (commit: `56c0494`).

---

#### [TASK-05] Xây dựng generic validation middleware `validateRequest` với Zod & Global Error Handler
- [x] **5.1.** Cài đặt thư viện `zod` (đã tích hợp vào backend dependencies).
- [x] **5.2.** Xây dựng tệp `backend/src/api/middlewares/validate-request.middleware.ts`:
  - [x] Định nghĩa interface `RequestValidators` cho `body`, `query`, `params`.
  - [x] Tự động validate, coerce/strip dữ liệu và gán ngược lại `req.body`, `req.query`, `req.params`.
  - [x] Hàm `formatZodIssues` chuyển đổi các path lồng nhau (e.g. `user.profile.age`) hoặc root refinement thành danh sách `{ field, issue }`.
  - [x] Trả về HTTP `400 Bad Request` chuẩn hóa ngay lập tức:
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
- [x] **5.3.** Xây dựng tầng lỗi nghiệp vụ & Middleware xử lý ngoại lệ tập trung:
  - [x] `backend/src/core/errors/app-error.ts`: Lớp cơ sở `AppError` kèm các lớp con `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `BadRequestError`.
  - [x] `backend/src/api/middlewares/error-handler.middleware.ts`: Xử lý phân loại `AppError` (4xx warning, 5xx error), `ZodError` fallback, `SyntaxError` (JSON body lỗi), `Unhandled 500 Exception` (ẩn stack trace trên production).
  - [x] Middleware `notFoundHandler` xử lý route 404 chuẩn hóa.
  - [x] Tích hợp vào `backend/src/app.ts`.
- [x] **5.4.** Viết trọn bộ kiểm thử tự động (Unit & Integration):
  - [x] `validate-request.middleware.test.ts`: 11 test cases bao phủ body, query coerce, params UUID, đa mục tiêu, root errors.
  - [x] `error-handler.middleware.test.ts`: 10 test cases bao phủ các loại AppError, ZodError, SyntaxError, 500, notFoundHandler.
  - [x] `health.routes.test.ts`: 4 test cases tích hợp `supertest` kiểm thử end-to-end qua app Express.
  - [x] Độ bao phủ kiểm thử đạt **95.95% Statements**, **91.30% Branches**, **90.00% Functions**, **95.95% Lines** (vượt chuẩn `testing-standards.md`).
- [x] Merge vào `main` và push lên GitHub (commit: `672ed24`).

---

#### [TASK-04] Xây dựng tầng hạ tầng kết nối cơ sở dữ liệu `backend/src/infrastructure/database/db.client.ts` (`pg.Pool` Singleton)
- [x] **4.1.** Cài đặt thư viện `pg` và `@types/pg` (đã cài ở TASK-03).
- [x] **4.2.** Xây dựng module `backend/src/infrastructure/database/db.client.ts`:
  - [x] Khởi tạo instance `pg.Pool` theo Singleton pattern, đọc cấu hình từ biến môi trường `DATABASE_URL`.
  - [x] Cấu hình Pool tối ưu: `max: 20`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`, `statement_timeout: 30000`.
  - [x] Cung cấp hàm `query<T>(text, params)` có generic typing rõ ràng, tự động bắt lỗi và ghi log profiling (cảnh báo slow query > 1 giây).
  - [x] Cung cấp hàm `withTransaction<T>(callback)` hỗ trợ transaction an toàn (`BEGIN`, `COMMIT`, tự động `ROLLBACK` khi có ngoại lệ, giải phóng client qua `finally`).
  - [x] Cung cấp hàm `testConnection()` kiểm tra trạng thái database khi khởi động server, tích hợp vào `src/index.ts`.
  - [x] Đăng ký hooks xử lý Graceful Shutdown (`SIGINT`, `SIGTERM`) đóng kết nối pool an toàn.
  - [x] Cung cấp `closePool()` và export `getPool()`.
- [x] **4.3.** Cài đặt Vitest (`vitest@2.1.8`, `@vitest/coverage-v8@2.1.8`), viết 16 test cases bao phủ toàn diện:
  - [x] Query happy path, typed rows, parameterized query, null rowCount, DB constraint error handling, undefined params.
  - [x] Transaction: BEGIN -> callback -> COMMIT đúng thứ tự, tự động ROLLBACK khi callback throw lỗi, luôn release client khi có lỗi, trả về giá trị callback.
  - [x] Test connection: phản hồi true khi kết nối thành công, false khi lỗi.
  - [x] Close pool: đóng an toàn, xử lý lỗi khi pool.end() reject.
  - [x] Graceful shutdown listeners: đăng ký SIGINT, SIGTERM.
- [x] Đã kiểm thử thành công: 16/16 tests passed 100%, TypeScript type-check 0 lỗi.
- [x] Merge vào `main` và push lên GitHub (commit: `1976537`).

---

#### [TASK-03] Thực thi tệp SQL DDL - Khởi tạo 9 bảng, Indexes & Triggers
- [x] **3.1.** Biên soạn `backend/src/infrastructure/database/migrations/001_initial_schema.sql`:
  - [x] Extension `uuid-ossp` kích hoạt.
  - [x] 9 bảng: `users`, `facebook_accounts`, `connected_pages`, `automation_rules`, `posts_schedule`, `customers`, `conversations`, `messages_and_comments`, `webhook_logs`.
  - [x] Foreign Keys đầy đủ với `ON DELETE CASCADE` / `SET NULL` / `RESTRICT`.
  - [x] 12 Indexes tối ưu hóa, gồm 5 Partial Indexes: `idx_pages_active`, `idx_posts_schedule_scheduled_time`, `idx_customers_phone`, `idx_conversations_open`, `idx_webhook_logs_pending`.
  - [x] 2 GIN Indexes cho JSONB: `idx_customers_tags_gin`, `idx_webhook_logs_payload_gin`.
  - [x] Trigger `update_updated_at_column()` cho 4 bảng (`users`, `connected_pages`, `posts_schedule`, `automation_rules`).
  - [x] Block `DO $$` xác nhận số bảng/index/trigger sau migration.
  - [x] Chạy trong `BEGIN/COMMIT` Transaction — tự động rollback khi lỗi.
- [x] **3.2.** `migrate.ts`: Migration Runner TypeScript idempotent, bảng tracking `_schema_migrations`, SHA-256 checksum per file, `npm run db:migrate`.
- [x] Cài đặt `pg@8.13.1` và `@types/pg@8.11.10`.
- [x] TypeScript type-check: **0 lỗi**.
- [x] Merge vào `main` và push GitHub (commit: `4a414ee`).

---

#### [TASK-02] Khởi tạo tệp `docker-compose.yml` cho PostgreSQL 15+ và Redis 7+
- [x] **2.1.** Soạn thảo tệp `docker-compose.yml` tại thư mục gốc:
  - [x] Cấu hình service `postgres`:
    - Image: `postgres:15-alpine`
    - Container name: `shopflow_postgres`
    - Volume: `pgdata:/var/lib/postgresql/data`
    - Port mapping: `5432:5432`
    - Environment variables: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (với default values)
    - Healthcheck: `pg_isready -U shopflow_user -d shopflow_db`
    - Timezone: `Asia/Ho_Chi_Minh`
    - Mount: `./backend/src/infrastructure/database/migrations:/docker-entrypoint-initdb.d:ro`
  - [x] Cấu hình service `redis`:
    - Image: `redis:7-alpine`
    - Container name: `shopflow_redis`
    - Volume: `redisdata:/data`
    - Port mapping: `6379:6379`
    - Command: `redis-server --appendonly yes --appendfsync everysec --maxmemory 256mb --maxmemory-policy noeviction --requirepass ...`
    - Healthcheck: `redis-cli -a $REDIS_PASSWORD ping | grep PONG`
- [x] **2.2.** Khởi tạo tệp `.env.docker.example` chứa thông tin cấu hình mặc định an toàn cho môi trường phát triển cục bộ.
- [x] **2.3.** Viết script kiểm tra kết nối dịch vụ Docker `scripts/test-services.ps1`.
- [x] Merge vào `main` và push lên GitHub (commit: `4550995`).

---

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
| 19/10/2026 | Khởi tạo Git & Push Remote GitHub | **DONE** | Tạo commit đầu tiên (`chore: initial commit for ShopFlow project`), đổi nhánh sang `main` và push code thành công lên `https://github.com/MinhNguyen0106/ShopFlow`. |
| 19/10/2026 | [TASK-02] Docker Compose (PostgreSQL 15 + Redis 7) | **DONE** | Tạo `docker-compose.yml`, `.env.docker.example`, `scripts/test-services.ps1`; merge vào `main`; push GitHub commit `4550995`. |
| 19/10/2026 | [TASK-03] SQL DDL Schema (9 bảng + Indexes + Triggers) | **DONE** | Tạo `001_initial_schema.sql` (9 bảng, 12 indexes, 5 partial indexes, 2 GIN, 4 triggers), `migrate.ts` runner; cài `pg@8.13.1`; TypeScript 0 lỗi; push GitHub commit `4a414ee`. |
| 19/10/2026 | [TASK-04] Database Infrastructure (`db.client.ts` pg.Pool Singleton) | **DONE** | Tạo `db.client.ts` (query profiling, withTransaction, testConnection, shutdown hooks); cấu hình Vitest; 16/16 unit tests passed; merge main; push GitHub commit `1976537`. |
| 19/10/2026 | [TASK-05] Request Validation & Error Handling (Zod + AppError) | **DONE** | Tạo `validateRequest` middleware, `AppError` domain hierarchy, `errorHandler` & `notFoundHandler`; 41/41 tests passed (95.95% coverage); merge main; push GitHub commit `672ed24`. |
| 19/10/2026 | [TASK-06] Authentication Module (JWT + Bcrypt + Auth Service) | **DONE** | Tạo DTOs, `auth.helper.ts`, `user.repository.ts`, `auth.service.ts`, `auth.controller.ts`, `auth.middleware.ts`, routes; 84/84 tests passed (95.99% coverage); merge main; push GitHub commit `56c0494`. |
| 19/10/2026 | [TASK-07] Webhook Ingestion & HMAC-SHA256 Verifier | **DONE** | Tạo `verifyWebhookSignature`, `webhook.service.ts`, `webhook-log.repository.ts`, `webhook.routes.ts`; 113/113 tests passed (95.42% coverage); merge main; push GitHub commit `6e914fa`. |
| 19/10/2026 | [TASK-08] BullMQ Queue & Worker ẩn SĐT < 3s | **DONE** | Cài đặt `bullmq` & `ioredis`, xây dựng `phone-regex.ts` cho các đầu số VN, Meta Graph client `hideComment`, worker ẩn SĐT < 3s, lưu CRM `customers` tag `["Co_SDT"]`, DLQ & Rate Limiter, 145/145 tests passed (92.05% coverage); merge main; push GitHub commit `87eb1ba`. |






