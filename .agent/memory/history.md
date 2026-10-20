# ShopFlow Project History & Milestone Changelog

Nhật ký theo dõi các mốc phát triển, thay đổi kiến trúc và trạng thái của dự án ShopFlow.

---

## [2026-10-20] - Hoàn Thành TASK-10: Động Cơ Kịch Bản Tự Động (Automation Rules Engine) & Tự Động Trả Lời Bình Luận/Tin Nhắn Riêng
- **Tác giả:** System Architect & Backend Engineer (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Hoàn thành trọn vẹn 100% các hạng mục của **[TASK-10]** trên nhánh `feature/task-10-automation-rules-reply` theo quy chuẩn `task-lifecycle.md`.
  - **Repositories & DTOs:**
    - Xây dựng [automation-rule.repository.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/repositories/automation-rule.repository.ts) thao tác với bảng `automation_rules` trong PostgreSQL, hỗ trợ đầy đủ `create`, `findAllByPageId`, `findActiveRulesByPageId`, `findByIdAndPageId`, `update`, `delete`.
    - Định nghĩa Zod schemas [automation-rule.dto.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/api/dtos/automation-rule.dto.ts) (`CreateAutomationRuleDtoSchema`, `UpdateAutomationRuleDtoSchema`).
  - **REST APIs Quản lý Quy tắc Tự động hóa (`/api/v1/pages/:pageId/rules`):**
    - `GET /api/v1/pages/:pageId/rules`: Lấy toàn bộ danh sách quy tắc tự động hóa của Fanpage.
    - `POST /api/v1/pages/:pageId/rules`: Tạo mới kịch bản (từ khóa kích hoạt, bật/tắt ẩn SĐT, mẫu bình luận, mẫu tin nhắn riêng).
    - `PUT /api/v1/pages/:pageId/rules/:ruleId`: Chỉnh sửa nội dung quy tắc tự động hóa.
    - `DELETE /api/v1/pages/:pageId/rules/:ruleId`: Xóa quy tắc tự động hóa an toàn.
  - **Keyword Matcher & Template Rendering Service:**
    - Xây dựng [keyword-matcher.service.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/core/services/keyword-matcher.service.ts) chuẩn hóa văn bản tiếng Việt, xóa dấu không phân biệt hoa thường (bóc tách đúng cả ký tự `Đ`/`đ`), quét khớp từ khóa kích hoạt, và thay thế các biến động linh hoạt `{{customer_name}}`, `{{page_name}}`.
  - **Mở rộng Meta Graph API Client:**
    - Bổ sung `replyComment(commentId, message, token)` gọi `POST /{comment-id}/comments`.
    - Bổ sung `sendPrivateReply(pageId, commentId, message, token)` gọi `POST /{page-id}/messages` với `recipient: { comment_id }` tuân thủ chính sách Meta Private Reply (chỉ 1 lần trong vòng 7 ngày).
  - **Hàng đợi & Worker Tự động Phản hồi (Automation Reply Worker):**
    - Thiết lập hàng đợi BullMQ `automation-reply-queue` với Rate Limiter 15 yêu cầu/giây chống vi phạm spam chính sách Meta.
    - Triển khai [automation-reply.worker.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/queue/automation-reply.worker.ts) xử lý tự động: lọc quy tắc active, đối soát từ khóa, kiểm tra idempotency `isPrivateReplySent`, tự động đăng comment trả lời và gửi Messenger private reply, ghi log CRM `messages_and_comments`.
    - Tích hợp hook tự động enqueue job trong [webhook.service.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/core/services/webhook.service.ts) khi tiếp nhận comment.
  - **Chất lượng mã nguồn:** 32 file kiểm thử, **254/254 tests passed 100%**, độ bao phủ mã nguồn vượt chuẩn với **90.79% Statements, 77.86% Branches, 95.36% Functions, 90.79% Lines**, TypeScript type-check 0 lỗi.

---

## [2026-10-20] - Hoàn Thành TASK-09: Meta Facebook OAuth 2.0, AES-256-GCM Token Encryption & Quản Lý Fanpage
- **Tác giả:** System Architect & Backend Engineer (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Hoàn thành trọn vẹn 100% các hạng mục của **[TASK-09]** trên nhánh `feature/task-09-meta-oauth-page-management` theo quy chuẩn `task-lifecycle.md`.
  - **Mã hóa Token đối xứng:** Xây dựng tiện ích `crypto.helper.ts` sử dụng thuật toán `AES-256-GCM` với IV ngẫu nhiên 96 bits và GCM Authentication Tag 128 bits chống giả mạo, mã hóa toàn bộ User Access Token và Page Access Token trước khi lưu vào cơ sở dữ liệu (`facebook_accounts`, `connected_pages`).
  - **Meta Graph API Client:** Mở rộng `graph-api.client.ts` hỗ trợ sinh OAuth Dialog URL với các scopes quản lý Fanpage (`pages_manage_posts`, `pages_messaging`, `pages_read_engagement`, `pages_show_list`), đổi Authorization Code lấy Short-Lived token và nâng cấp sang Long-Lived Token (hạn 60 ngày), lấy profile cá nhân, lấy danh sách Fanpage từ `/me/accounts`, và đăng ký tự động Webhook qua `POST /{page-id}/subscribed_apps`.
  - **Facebook OAuth Endpoints (`/api/v1/fb-oauth`):**
    - `GET /connect-url`: Sinh URL OAuth kèm JWT CSRF State Token có hạn 15 phút.
    - `GET /callback`: Xác thực CSRF state, đổi token, mã hóa và lưu vào bảng `facebook_accounts`. Hỗ trợ redirect về Next.js frontend hoặc trả về JSON.
    - `GET /accounts`: Lấy danh sách Fanpage quản lý và đối chiếu trạng thái kết nối `is_connected`.
    - `POST /connect-pages`: Kết nối hàng loạt Fanpage, mã hóa token và đăng ký `subscribed_apps`.
  - **Quản lý Kênh Fanpage (`/api/v1/pages`):**
    - `GET /`: Lấy danh sách Fanpage của user với token đã được che giấu an toàn.
    - `GET /:pageId`: Xem chi tiết Fanpage và số liệu thống kê (tổng bài viết, tổng hội thoại).
    - `PATCH /:pageId/status`: Bật/Tắt trạng thái hoạt động `is_active`.
    - `POST /:pageId/subscribe-webhook`: Đồng bộ và đăng ký lại Webhook với Meta.
    - `DELETE /:pageId`: Hủy kết nối Fanpage an toàn.
  - **Chất lượng mã nguồn:** 26 file kiểm thử, **207/207 tests passed 100%**, tỷ lệ bao phủ mã nguồn tổng thể đạt **92.42% Statements, 78.60% Branches, 96.72% Functions, 92.42% Lines** (vượt chuẩn yêu cầu), TypeScript type-check 0 lỗi.

---

## [2026-10-20] - Hoàn Tất Toàn Diện Sprint 1: Nền Tảng Backend, Database & Webhook Engine
- **Tác giả:** System Architect & Lead AI Assistant (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Hoàn thành xuất sắc 100% (8/8 tác vụ) của Sprint 1 theo đúng quy trình `task-lifecycle.md` và `safe-deploy.md`.
  - **Hạ tầng & Cơ sở dữ liệu:** Khởi tạo Monorepo chuẩn hóa (`backend/` Express TypeScript, `frontend/` Next.js 14), `docker-compose.yml` (PostgreSQL 15-alpine + Redis 7-alpine), khởi tạo 9 bảng quan hệ, partial indexes và triggers tự động (`001_initial_schema.sql`), xây dựng Singleton `pg.Pool` (`db.client.ts`) có query profiling và transaction wrapper an toàn.
  - **Middleware & Security:** Generic request validator với Zod (`validateRequest`), phân cấp lỗi miền nghiệp vụ `AppError`, middleware xử lý lỗi tập trung (`errorHandler`), bảo mật JWT Access/Refresh tokens với Bcrypt cost factor 12.
  - **Module Xác thực:** Triển khai trọn bộ API `/api/v1/auth` (đăng ký, đăng nhập, cấp lại token qua cookie, thông tin tài khoản `/me`).
  - **Webhook Engine:** Middleware xác thực chữ ký Meta Webhook HMAC-SHA256 với `crypto.timingSafeEqual` loại trừ tấn công dò thời gian, Webhook Handshake endpoint (`GET /api/v1/webhook`), Ingestion endpoint (`POST /api/v1/webhook`) phản hồi tức thời HTTP 200 OK (< 50ms) và ghi nhận `webhook_logs` Idempotent.
  - **Hàng đợi & Ẩn SĐT khẩn cấp:** Cài đặt BullMQ & ioredis, xây dựng bộ Regex tối ưu phát hiện SĐT Việt Nam (`phone-regex.ts`, 5 đầu số 03/05/07/08/09, +84, lách chữ o/O), Meta Graph API client, worker ẩn bình luận tức thời (`is_hidden = true`) trong **< 3 giây**, tự động cập nhật CRM `customers` gắn nhãn `["Co_SDT"]`, lưu vết vào `messages_and_comments`, thiết lập Rate Limiter (20 jobs/s) và Dead Letter Queue (DLQ).
  - **Chất lượng mã nguồn:** 20 file kiểm thử, **145/145 tests passed 100%**, Code Coverage toàn diện đạt **92.05% Statements, 85.87% Branches, 94.73% Functions, 92.05% Lines**, TypeScript type-check 0 lỗi. Toàn bộ code đã merge vào `main` và đẩy lên GitHub.

---

## [2026-10-19] - Đồng Bộ Hóa Toàn Diện Bộ Nhớ Agent (Memory Re-alignment)
- **Tác giả:** System Architect & Lead AI Assistant (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Đồng bộ hóa 100% tệp bộ nhớ ngữ cảnh [project_context.md](file:///C:/Users/Dell/Desktop/ShopFlow/.agent/memory/project_context.md) theo thiết kế mới: PostgreSQL 15+, `pg` (node-postgres) + Repository Pattern, Monorepo (`backend/` & `frontend/`), Cloudinary, BullMQ, Socket.io.
  - Bổ sung 5 quyết định kiến trúc mới (ADR-007 đến ADR-011) vào [decisions.md](file:///C:/Users/Dell/Desktop/ShopFlow/.agent/memory/decisions.md).
  - Cập nhật kế hoạch triển khai sprint tiếp theo bám sát bộ tài liệu module hóa.

---

## [2026-10-19] - Mô-đun Hóa Bộ Tài Liệu Thiết Kế Thành 5 File Chuyên Biệt
- **Tác giả:** System Architect & Lead AI Assistant (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Giải quyết vấn đề quá tải Context Window do tệp `DESIGN.md` nguyên khối (> 1000 dòng).
  - Phân tách và cấu trúc lại hệ thống tài liệu trong thư mục `docs/`:
    - [00_INDEX.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/00_INDEX.md): Chỉ mục trung tâm, kim chỉ nam & Ma trận hướng dẫn AI Coding Agent ("Code phần nào đọc file nào").
    - [01_PRD.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/01_PRD.md): Khảo sát yêu cầu sản phẩm, Persona, phạm vi MVP & chính sách Meta.
    - [02_ARCHITECTURE_AND_FLOWS.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/02_ARCHITECTURE_AND_FLOWS.md): 3 luồng người dùng, sơ đồ kiến trúc tổng thể, chốt tech stack, cây thư mục và file `.env.example`.
    - [03_DATABASE_SCHEMA.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/03_DATABASE_SCHEMA.md): Mô hình ERD, định nghĩa 9 bảng và toàn bộ mã SQL DDL Runnable (PostgreSQL 15+).
    - [04_API_AND_WEBSOCKET.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/04_API_AND_WEBSOCKET.md): Chuẩn JSON Envelope, 24+ REST APIs, Socket.io events & Sơ đồ upload media Cloudinary 14 bước.
  - Lưu trữ tệp cũ an toàn tại `docs/archive/DESIGN_monolith_backup.md` và `docs/archive/PRD_So_Bo_Quan_Ly_Fanpage_backup.md`.

---

## [2026-10-19] - Hoàn Thiện & Ban Hành Mục IV: Đặc Tả Kỹ Thuật Chi Tiết & API Nội Bộ
- **Tác giả:** Software Architect & AI Assistant
- **Nội dung hoàn thành:**
  - Chốt dứt khoát kiến trúc Monorepo (`backend/` dùng Node.js + Express + TypeScript và `frontend/` dùng Next.js 14+ App Router + Tailwind CSS).
  - Chốt sử dụng `pg` (node-postgres) thay cho Prisma để tương thích tuyệt đối với PostgreSQL DDL, partial indexes và triggers tự động.
  - Chốt `Zod` validation middleware cho toàn bộ request body, query, params và env parsing.
  - Chốt cấu hình BullMQ Retry & Exponential Backoff cho Meta Rate Limits (`attempts: 5`, `delay: 3000ms`).
  - Thiết kế luồng upload media đám mây qua Multer MemoryStorage + Cloudinary Stream Upload cấp Public HTTPS URL cho Meta Graph API.
  - Thiết kế màn hình Live Chat tập trung (Centralized Inbox) giao diện 3 cột chuyên dụng thời gian thực qua Socket.io.

---

## [2026-10-17] - Khởi Tạo Không Gian Làm Việc AI Agent Toàn Diện
- **Tác giả:** System Architect (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Thiết lập cấu trúc thư mục cấu hình AI Agent hoàn chỉnh tại `.agent/`.
  - Ban hành tệp loại trừ chuẩn `.agentignore` tại thư mục gốc.
  - Cấu hình tích hợp MCP servers, sandbox và agent settings.
  - Ban hành bộ quy chuẩn kỹ thuật: `project-rules.md`, `security.md`, `testing-standards.md`.
  - Xây dựng quy trình làm việc tự động (workflows): `test.md`, `deploy.md`, `code-review.md`.
  - Phân định vai trò các Agent chuyên biệt: `planner`, `coder`, `security-auditor`, `devops`.

---

## [Giai Đoạn Trước] - Nghiên Cứu Nghiệp Vụ & Khảo Sát Thị Trường
- **Tài liệu hoàn thành:** [deep-research-report.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/deep-research-report.md)
- **Nội dung:** Khảo sát chi tiết bài toán kinh doanh của các shop thời trang/B2C tại Việt Nam trên nền tảng Facebook Fanpage, đánh giá tính khả thi của Facebook Graph API, phân tích rủi ro chính sách Meta (xóa quyền `publish_to_groups`, chống spam).

---

## [Đã Hoàn Thành] - MVP Implementation Sprint 1 (Backend & DB Infrastructure)
- [x] Khởi tạo khung thư mục Monorepo chuẩn hóa (`backend/` và `frontend/`).
- [x] Khởi tạo tệp `docker-compose.yml` cho PostgreSQL 15+ và Redis 7+.
- [x] Thực thi tệp SQL DDL từ `docs/03_DATABASE_SCHEMA.md` khởi tạo toàn bộ 9 bảng, partial indexes và triggers.
- [x] Xây dựng tầng hạ tầng kết nối cơ sở dữ liệu `backend/src/infrastructure/database/db.client.ts` (`pg.Pool` Singleton).
- [x] Xây dựng generic validation middleware `validateRequest` với Zod.
- [x] Triển khai Module Xác thực `auth` (Đăng ký, Đăng nhập, JWT Access/Refresh tokens).
- [x] Triển khai Webhook Ingestion Router & Controller kèm HMAC-SHA256 Verifier.
- [x] Triển khai BullMQ Queue & Worker quét Regex ẩn SĐT trong < 3 giây.

---

## [Kế Hoạch Tiếp Theo] - Sprint 2: Core Business Logic, Realtime WebSocket & Next.js UI
- [x] **[TASK-09]** Meta Facebook OAuth 2.0, Mã Hóa Token AES-256-GCM & Quản Lý Fanpage (`/api/v1/fb-oauth`, `/api/v1/pages`).
- [x] **[TASK-10]** Động Cơ Kịch Bản Tự Động (Automation Rules Engine) & Tự Động Trả Lời Bình Luận/Tin Nhắn Riêng (Auto Comment & Private Reply).
- [ ] **[TASK-11]** Dịch Vụ Tải Lên Phương Tiện Truyền Thông Đa Định Dạng (Multer + Cloudinary Stream Upload) (`/api/v1/media`).
- [ ] **[TASK-12]** Đặt Lịch Xuất Bản Bài Viết Đa Kênh & Hàng Đợi Hẹn Giờ BullMQ (`/api/v1/posts`).
- [ ] **[TASK-13]** Máy Chủ WebSocket Thời Gian Thực (Socket.io) & APIs Hộp Thư Tập Trung (Centralized Inbox) (`/api/v1/inbox`).
- [ ] **[TASK-14]** Giao Diện Người Dùng Next.js 14+ P0: Khung Layout macOS Clean Utility, Màn Hình Auth (`/login`, `/register`) & Quản Lý Kênh Fanpage (`/pages`).
