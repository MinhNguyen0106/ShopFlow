# BẢNG KẾ HOẠCH THỰC THI DỰ ÁN SHOPFLOW (TASK.MD)
> **Sprint Hiện Tại:** Sprint 2 (Core Business Logic: Meta OAuth, Automation Rules, Scheduled Posts, Live Chat Inbox & Next.js UI)  
> **Cập nhật lần cuối:** 20/10/2026  
> **Tài liệu tham chiếu:** [docs/00_INDEX.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/00_INDEX.md) • [docs/02_ARCHITECTURE_AND_FLOWS.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/02_ARCHITECTURE_AND_FLOWS.md) • [docs/03_DATABASE_SCHEMA.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/03_DATABASE_SCHEMA.md) • [docs/04_API_AND_WEBSOCKET.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/04_API_AND_WEBSOCKET.md) • [docs/05_DESIGN_SYSTEM.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/05_DESIGN_SYSTEM.md) • [docs/06_UI_SCREENS_AND_COMPONENTS.md](file:///c:/Users/Dell/Desktop/ShopFlow/docs/06_UI_SCREENS_AND_COMPONENTS.md)

---

## 📌 NGUYÊN TẮC VẬN HÀNH BẮT BUỘC (OPERATING PRINCIPLES)

1. **Đọc Trước Khi Làm (Read First):** Trước khi bắt tay vào viết mã cho bất kỳ tính năng hoặc tác vụ nào, AI Agent bắt buộc phải đọc lại tệp `Task.md` này để nắm vững bối cảnh, phạm vi và trạng thái hiện tại.
2. **Cập Nhật Ngay Lập Tức (Instant Update):** Ngay sau khi hoàn thành một bước hành động (Action Item), AI Agent phải tự động cập nhật đánh dấu checkbox `[x]` và chuyển dịch trạng thái công việc tương ứng (`Todo` ➔ `In Progress` ➔ `Done`).
3. **Đồng Bộ Lịch Sử (Sync History):** Sau khi hoàn thành trọn vẹn mỗi một task, bắt buộc phải mở tệp [.agent/memory/history.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agent/memory/history.md) để đánh dấu `[x]` hoàn thành cho task đó trong phần `[Kế Hoạch Tiếp Theo]` và bổ sung mục log vào `[Lịch Sử Thay Đổi]` nhằm lưu vết tiến độ dự án.
4. **An Toàn Hệ Thống (Strict Safety Gate):** Tuyệt đối không thực hiện các hành động nguy hiểm (như xóa cơ sở dữ liệu, `DROP TABLE`, thay đổi cấu trúc kiến trúc gốc, `git push --force`) mà chưa ghi chú rõ ràng vào kế hoạch và nhận được sự xác nhận từ người dùng.
5. **Chuẩn Mực Mã Nguồn (Code Quality):** Tuân thủ TypeScript Strict (`noImplicitAny`), Clean Architecture, không commit bí mật/token vào git, xác thực chữ ký Webhook HMAC-SHA256 với `timingSafeEqual`.
6. **Quy Trình Nhánh & Triển Khai An Toàn (Task Lifecycle & Safe Deploy):** Mọi task bắt buộc phải thực hiện trên một nhánh riêng (`feature/<task-name>`). Chạy toàn bộ test suite; nếu lỗi phải tự động phân tích và sửa lỗi; nếu pass mới merge vào `main` và chạy quy trình triển khai an toàn theo [.agent/workflows/safe-deploy.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agent/workflows/safe-deploy.md) để đẩy code lên GitHub. Chi tiết xem tại [.agent/workflows/task-lifecycle.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agent/workflows/task-lifecycle.md).

---

## 🚀 DANH MỤC CÔNG VIỆC SPRINT 2

### 📋 TRẠNG THÁI: IN PROGRESS (ĐANG THỰC HIỆN)

*(Tất cả tác vụ trong Sprint 2 đã hoàn thành 100%! Sẵn sàng bước sang Sprint 3)*

---

### 📝 TRẠNG THÁI: TODO (CHƯA BẮT ĐẦU)

*(Sprint 2 đã hoàn thành toàn bộ tác vụ)*

---

### ✅ TRẠNG THÁI: DONE (ĐÃ HOÀN THÀNH)

#### [TASK-15] Màn hình Hộp thư Tập trung Live Chat 4-Pane Bento (`/inbox`) - Trọng tâm Cốt lõi P0
- [x] **15.1.** Thiết kế Pane 1 (`column-channels.tsx`): Bộ chọn Fanpage, bộ lọc trạng thái, bộ lọc thẻ tags và thanh thông số kết nối Webhooks.
- [x] **15.2.** Thiết kế Pane 2 (`column-threads.tsx`): Danh sách hội thoại theo thời gian thực (Socket.io), hiển thị đồng hồ đếm ngược Cửa sổ 24h Meta, nhãn lead nóng và badge an ninh ẩn SĐT.
- [x] **15.3.** Thiết kế Pane 3 (`chat-window.tsx`): Khung trò chuyện đa kênh, banner cảnh báo an ninh ShopFlow Shield, thanh soạn thảo tin nhắn với macro chốt đơn (`/size`, `/gia`, `/bank`).
- [x] **15.4.** Thiết kế Pane 4 (`customer-panel.tsx`): Bảng hồ sơ khách hàng, chi tiết SĐT (nút gọi & copy 1-click), thẻ trích xuất đơn hàng AI (Gemini NLP fallback) và nút CTA tạo đơn hàng.
- [x] **15.5.** Viết unit & integration tests cho Hộp thư Live Chat 4-Pane (10/10 test files passed, 30/30 tests passed 100%, Next.js 14 production build thành công).


#### [TASK-14] Khung Layout macOS Clean Utility, Màn hình Auth & Fanpage Management trên Next.js 14+
- [x] **14.1.** Thiết lập tầng kết nối API và Realtime ở Frontend (`frontend/src/lib`):
  - [x] API Client Wrapper (`api-client.ts`) với Axios, tự động gắn `Authorization: Bearer <token>`, interceptor refresh token khi gặp 401.
  - [x] Zustand Stores (`auth.store.ts` & `page.store.ts`) quản lý trạng thái đăng nhập và danh sách Fanpage.
  - [x] Socket.io Client Hook (`useSocket.ts`) tự động kết nối và lắng nghe events (`NEW_INBOX_ITEM`, `INBOX_UPDATED`, `POST_STATUS_CHANGED`).
- [x] **14.2.** Xây dựng Shell Layout chuẩn macOS Clean Utility:
  - [x] macOS Window Frame với Traffic Lights (`mac-traffic-lights.tsx`) tương tác thu nhỏ/phóng to.
  - [x] Topbar (`topbar.tsx`): Thanh tìm kiếm nhanh Spotlight (`command-palette.tsx` `⌘K`), Page Switcher dropdown, Widget giám sát Meta API Limits (Gauge 24%).
  - [x] Sidebar (`sidebar.tsx`): Menu điều hướng bo tròn Squircle, badge số tin chưa đọc (18), trạng thái active đồng bộ Design System, Meta Business Partner verified.
- [x] **14.3.** Triển khai Màn hình Đăng nhập (`/login`) & Đăng ký (`/register`):
  - [x] Thiết kế form Glassmorphism, validation bằng React Hook Form + Zod, toggle show/hide password, error banners.
  - [x] Đăng nhập/Đăng ký thành công -> lưu token -> chuyển hướng vào Dashboard.
- [x] **14.4.** Triển khai Màn hình Quản lý Kênh Fanpage (`/pages`):
  - [x] 4 thẻ Bento Metrics thống kê trang (1/5 Pro), token (100% hoạt động), lưu lượng (1,428), SLA < 3s (1.4s).
  - [x] Nút CTA "+ Thêm Fanpage Mới (Meta OAuth)" mở popup OAuth Facebook.
  - [x] Lưới `PageCard Grid`: Avatar, Tên page, Huy hiệu Webhook xanh/vàng/xám, nút Switch gạt bật/tắt tiếp nhận tin nhắn, menu thao tác (Vào hộp thư, cấu hình bot, ngắt kết nối).
  - [x] `ConnectPageModal`: Hộp thoại chọn Fanpage sau khi hoàn tất OAuth Facebook.
- [x] **14.5.** Kiểm thử E2E / Component tests cho layout, Auth flow và Fanpage management (8/8 test files passed, 21/21 tests passed 100%, Next.js build passed).

---

### ✅ TRẠNG THÁI: DONE (ĐÃ HOÀN THÀNH)

#### [TASK-09] Meta Facebook OAuth 2.0, AES-256-GCM Token Encryption & Quản lý Fanpage (`/api/v1/fb-oauth` & `/api/v1/pages`)
- [x] **9.1.** Xây dựng tiện ích mã hóa đối xứng AES-256-GCM tại `backend/src/utils/crypto.helper.ts` (mã hóa/giải mã Page Access Token và User Access Token bằng khóa bí mật từ `.env`).
- [x] **9.2.** Triển khai Luồng Meta Facebook OAuth 2.0 (`/api/v1/fb-oauth`):
  - [x] `GET /api/v1/fb-oauth/connect-url`: Tạo URL xác thực OAuth kèm CSRF state token và scopes (`pages_manage_posts`, `pages_messaging`, `pages_read_engagement`, `pages_show_list`).
  - [x] `GET /api/v1/fb-oauth/callback`: Nhận authorization code, đổi lấy Short-Lived User Token, nâng cấp thành Long-Lived User Token (hạn 60 ngày), lưu vào bảng `facebook_accounts`.
  - [x] `GET /api/v1/fb-oauth/accounts`: Gọi Meta Graph API lấy danh sách Fanpage mà user quản lý.
  - [x] `POST /api/v1/fb-oauth/connect-pages`: Tự động lấy Page Access Token dài hạn, mã hóa AES-256-GCM, lưu vào bảng `connected_pages`, gọi Meta API đăng ký `subscribed_apps` (webhook subscription).
- [x] **9.3.** Triển khai APIs Quản lý Kênh Fanpage (`/api/v1/pages`):
  - [x] `GET /api/v1/pages`: Lấy danh sách Fanpage đã kết nối của người dùng kèm trạng thái webhook.
  - [x] `GET /api/v1/pages/:pageId`: Xem thông tin chi tiết Fanpage và số liệu thống kê.
  - [x] `PATCH /api/v1/pages/:pageId/status`: Bật/Tắt trạng thái hoạt động (`is_active`) của Fanpage.
  - [x] `POST /api/v1/pages/:pageId/subscribe-webhook`: Đồng bộ/Đăng ký lại Webhook với Meta.
  - [x] `DELETE /api/v1/pages/:pageId`: Hủy kết nối Fanpage an toàn.
- [x] **9.4.** Viết unit tests & integration tests cho luồng OAuth, Crypto Helper và Pages APIs (đảm bảo coverage ≥ 85%).

#### [TASK-10] Động cơ Kịch bản Tự động (Automation Rules) & Tự động Phản hồi Bình luận/Tin nhắn
- [x] **10.1.** Xây dựng Repositories và DTOs cho `automation_rules` trong PostgreSQL.
- [x] **10.2.** Triển khai REST APIs quản lý quy tắc tự động hóa:
  - [x] `GET /api/v1/pages/:pageId/rules`: Lấy danh sách quy tắc tự động của Fanpage.
  - [x] `POST /api/v1/pages/:pageId/rules`: Tạo mới kịch bản (trigger_keywords, hide_phone_enabled, auto_comment_template, auto_private_reply_template).
  - [x] `PUT /api/v1/pages/:pageId/rules/:ruleId`: Cập nhật cấu hình kịch bản.
  - [x] `DELETE /api/v1/pages/:pageId/rules/:ruleId`: Xóa kịch bản tự động.
- [x] **10.3.** Xây dựng Service đối soát từ khóa (`KeywordMatcherService`) và Worker phản hồi tự động (`automation-reply.worker.ts`):
  - [x] Khi nhận webhook comment: Quét khớp trigger keywords (ví dụ: "giá", "tư vấn", "inbox", "bao nhiêu").
  - [x] Tự động đăng bình luận trả lời (`POST /{comment-id}/comments`).
  - [x] Tự động gửi Private Reply qua Messenger (`POST /{page-id}/messages` với `recipient: { comment_id }` tuân thủ chính sách Meta Private Reply trong vòng 7 ngày).
  - [x] Điều tiết tốc độ gửi tin nhắn qua BullMQ Rate Limiter (giãn cách an toàn giữa các hành động) chống spam Meta.
- [x] **10.4.** Viết unit tests cho KeywordMatcherService, AutomationRuleService, AutomationRuleController, Graph API methods và automation worker; đạt độ bao phủ toàn diện 254/254 tests passed (90.79% Stmts, 77.86% Branch).

#### [TASK-11] Dịch vụ Tải lên & Lưu trữ Phương tiện Đa Định dạng (Multer + Cloudinary) (`/api/v1/media`)
- [x] **11.1.** Cài đặt thư viện `multer`, `cloudinary` và cấu hình Cloudinary SDK trong `backend/src/config/cloudinary.ts`.
- [x] **11.2.** Xây dựng Upload Middleware với Multer `memoryStorage()`:
  - [x] Giới hạn định dạng: Ảnh (JPG, PNG, WEBP, tối đa 4MB), Video (MP4, MOV, tối đa 100MB).
  - [x] Bắt lỗi file quá kích thước hoặc sai MIME type qua `AppError`.
- [x] **11.3.** Xây dựng Media Service (`media.service.ts`):
  - [x] Stream upload buffer trực tiếp lên Cloudinary (`folder: shopflow/posts/`).
  - [x] Tự động nén và tối ưu hóa (`f_auto, q_auto`).
  - [x] Cung cấp Public HTTPS URL (`secure_url`) sẵn sàng cho Meta Graph API tải về.
- [x] **11.4.** Triển khai endpoint `POST /api/v1/media/upload` có xác thực Bearer Token.
- [x] **11.5.** Viết unit tests cho media controller, stream uploader (mocked Cloudinary SDK) và upload middleware; đạt 278/278 tests passed (91.57% Stmts, 79.37% Branch).

#### [TASK-12] Đặt lịch Xuất bản Bài viết Đa kênh & Hàng đợi Hẹn giờ BullMQ (`/api/v1/posts`)
- [x] **12.1.** Xây dựng DTOs, Repository tương tác bảng `posts_schedule`.
- [x] **12.2.** Triển khai REST APIs quản lý bài viết đặt lịch (`/api/v1/posts`):
  - [x] `GET /api/v1/posts`: Danh sách bài viết có phân trang, lọc theo `page_id`, `status` (`pending`, `scheduled`, `published`, `failed`), khoảng ngày.
  - [x] `GET /api/v1/posts/:postId`: Chi tiết bài viết đặt lịch.
  - [x] `POST /api/v1/posts`: Tạo bài viết mới & đặt lịch (Validate `scheduled_time` phải cách thời điểm hiện tại ít nhất 10 phút).
  - [x] `PUT /api/v1/posts/:postId`: Chỉnh sửa bài viết khi chưa xuất bản.
  - [x] `DELETE /api/v1/posts/:postId`: Hủy bài viết đặt lịch (gỡ bỏ job hẹn giờ trong BullMQ).
  - [x] `POST /api/v1/posts/:postId/retry`: Đưa lại bài viết bị lỗi (`failed`) vào hàng đợi xuất bản.
- [x] **12.3.** Xây dựng BullMQ Publishing Worker (`scheduled-post.worker.ts`):
  - [x] Lập lịch Job có độ trễ (`delay = scheduled_time - now`).
  - [x] Khi đến giờ: Lấy bài viết, giải mã Page Access Token (AES-256).
  - [x] Xuất bản bài viết lên Meta Graph API:
    - Ảnh đơn: `POST /{page_id}/photos` (url, caption).
    - Video: `POST /{page_id}/videos` (file_url, description).
    - Album/Carousel (Nhiều ảnh): Upload từng ảnh `published=false` lên `/{page_id}/photos`, lấy `media_fbid`, sau đó `POST /{page_id}/feed` với `attached_media`.
  - [x] Cập nhật trạng thái `published` kèm `meta_post_id`, hoặc `failed` kèm `error_message`.
  - [x] Phát sự kiện WebSocket `POST_STATUS_CHANGED` khi xuất bản thành công/thất bại.
- [x] **12.4.** Viết unit tests & integration tests cho toàn bộ luồng tạo, hẹn giờ và xuất bản bài viết; đạt 337/337 tests passed (90.85% Stmts, 77.96% Branch).

#### [TASK-13] Máy chủ WebSocket Thời gian thực (Socket.io) & APIs Hộp thư Tập trung (`/api/v1/inbox`)
- [x] **13.1.** Khởi tạo Socket.io Server gắn liền với Express HTTP Server:
  - [x] Middleware xác thực JWT token cho kết nối Socket.io (`io.use(socketAuthMiddleware)`).
  - [x] Quản lý phòng: `room:user_{user_id}`, `room:page_{page_id}`, `room:conv_{conversation_id}` (`join_page`, `leave_page`, `join_conversation`, `leave_conversation`).
- [x] **13.2.** Định nghĩa và phát các sự kiện thời gian thực (Socket Service):
  - [x] `NEW_INBOX_ITEM`: Phát khi nhận tin nhắn/comment mới từ webhook.
  - [x] `INBOX_UPDATED`: Phát khi trạng thái hội thoại thay đổi hoặc tin nhắn được xử lý.
  - [x] `POST_STATUS_CHANGED`: Phát khi bài viết đặt lịch hoàn tất xuất bản (tích hợp worker).
- [x] **13.3.** Triển khai REST APIs Hộp thư Tập trung (`/api/v1/inbox`):
  - [x] `GET /api/v1/inbox/conversations`: Danh sách hội thoại có tìm kiếm, lọc theo Page, loại (`messenger`/`comment_thread`), trạng thái, số tin chưa đọc.
  - [x] `GET /api/v1/inbox/conversations/:conversationId`: Chi tiết hội thoại, khách hàng và tính toán cửa sổ 24h Meta (`window_24h_expires_at`).
  - [x] `GET /api/v1/inbox/conversations/:conversationId/messages`: Lấy lịch sử tin nhắn/bình luận theo cursor pagination.
  - [x] `POST /api/v1/inbox/conversations/:conversationId/messages`: Nhân viên gửi tin nhắn trả lời khách (gọi Meta Send API `POST /{page_id}/messages` và emit socket event).
  - [x] `POST /api/v1/inbox/messages/:messageId/private-reply`: Gửi tin nhắn riêng (Private Reply) cho bình luận qua Graph API.
  - [x] `PATCH /api/v1/inbox/messages/:messageId/hide`: Ẩn/Hiện thủ công bình luận Facebook qua Graph API.
  - [x] `PATCH /api/v1/inbox/conversations/:conversationId/status`: Đổi trạng thái hội thoại (`open`, `resolved`, `archived`).
  - [x] `PATCH /api/v1/inbox/customers/:customerId`: Cập nhật ghi chú, địa chỉ, số điện thoại và tags khách hàng.
- [x] **13.4.** Viết unit tests & integration tests cho Socket.io connection, room routing và Inbox REST APIs; đạt 393/393 tests passed (88.89% Stmts, 76.20% Branch).

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
| 20/10/2026 | [TASK-09] Meta Facebook OAuth 2.0, AES-256-GCM Token Encryption & Quản lý Fanpage | **DONE** | Tạo tiện ích AES-256-GCM (`crypto.helper.ts`), Meta Graph Client mở rộng OAuth/Pages/Subscribed Apps, Repositories (`facebook_accounts`, `connected_pages`), Services & Controllers (`/api/v1/fb-oauth`, `/api/v1/pages`); 207/207 tests passed (92.42% coverage); merge main. |
| 20/10/2026 | [TASK-10] Automation Rules Engine & Reply Worker | **DONE** | Tạo DTOs, Repositories (`automation_rules`), REST APIs CRUD, KeywordMatcherService, Meta Graph Client `replyComment` & `sendPrivateReply`, Worker BullMQ auto-reply rate limit 15 req/s; 254/254 tests passed (90.79% Stmts, 77.86% Branch); merge main. |
| 20/10/2026 | [TASK-11] Cloudinary Media Stream Upload Service | **DONE** | Cài đặt Multer & Cloudinary SDK, upload middleware giới hạn dung lượng & MIME type, MediaService stream buffer trực tiếp, endpoint `POST /api/v1/media/upload` cấp Public HTTPS URL; 278/278 tests passed (91.57% Stmts, 79.37% Branch); merge main. |
| 20/10/2026 | [TASK-12] Đặt lịch Xuất bản Bài viết Đa kênh & BullMQ Worker | **DONE** | Xây dựng DTOs, Repository `posts_schedule`, REST APIs CRUD/Retry, Meta Graph Client xuất bản Feed/Photo/Video/Album, Worker BullMQ delay job; 337/337 tests passed (90.85% Stmts, 77.96% Branch); merge main. |
| 20/10/2026 | [TASK-13] Máy chủ WebSocket Realtime & Centralized Inbox APIs | **DONE** | Khởi tạo Socket.io Server xác thực JWT & room routing, SocketService phát NEW_INBOX_ITEM, INBOX_UPDATED, POST_STATUS_CHANGED, 8 REST APIs `/api/v1/inbox` (Messenger & Comment Reply, Private Reply, Hide/Unhide, Status, Customer CRM); 393/393 tests passed (88.89% Stmts, 76.20% Branch); merge main. |
| 20/10/2026 | [TASK-14] Khung Layout macOS Clean Utility, Màn hình Auth & Fanpage Management trên Next.js 14+ | **DONE** | Xây dựng API Client Wrapper (Axios + auto-refresh token), Zustand Stores (`auth.store`, `page.store`), `useSocket.ts`, MacTrafficLights, Sidebar Squircle, Topbar Spotlight (`⌘K`), Màn hình Login/Register (React Hook Form + Zod), Màn hình Pages (4 Bento Metrics, PageCard Grid, ConnectPageModal); 21/21 tests passed (100%), Next.js 14 production build thành công; merge main. |
| 20/10/2026 | [TASK-15] Màn hình Hộp thư Tập trung Live Chat 4-Pane Bento (`/inbox`) | **DONE** | Xây dựng 4 Pane Bento (Channels & Filters, Realtime Threads list với Meta 24h Window & SĐT shield, Chat Window với ShopFlow Shield & Macro chốt đơn 1-click, Customer CRM & Thẻ Đơn Hàng AI Gemini NLP fallback); 30/30 tests passed (100%), Next.js build thành công. **HOÀN THÀNH SPRINT 2 (100%)**. |

