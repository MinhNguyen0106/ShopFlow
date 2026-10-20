# ShopFlow Project History & Milestone Changelog

Nhật ký theo dõi các mốc phát triển, thay đổi kiến trúc và trạng thái của dự án ShopFlow.

---

## [2026-10-20] - Hoàn Thành TASK-13: Máy Chủ WebSocket Thời Gian Thực (Socket.io) & APIs Hộp Thư Tập Trung (`/api/v1/inbox`)
- **Tác giả:** System Architect & Backend Engineer (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Hoàn thành trọn vẹn 100% các hạng mục của **[TASK-13]** trên nhánh `feature/task-13-websocket-centralized-inbox` theo quy chuẩn `task-lifecycle.md`.
  - **Hạ Tầng WebSocket (Socket.io Server & Room Management):**
    - Cài đặt thư viện `socket.io` và `socket.io-client`.
    - Xây dựng [socket.server.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/socket/socket.server.ts):
      - Middleware xác thực kết nối qua JWT Access Token (`socketAuthMiddleware`) chấp nhận qua auth payload, headers authorization hoặc query token.
      - Tự động gán socket vào phòng người dùng: `room:user_{user_id}`.
      - Lắng nghe các sự kiện quản lý phòng từ client: `join_page`, `leave_page` (`room:page_{page_id}`), `join_conversation`, `leave_conversation` (`room:conv_{conversation_id}`).
      - Tích hợp vòng đời khởi động và đóng an toàn (`initSocketServer`, `closeSocketServer`) vào [index.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/index.ts).
  - **Dịch Vụ Phát Sóng Thời Gian Thực (SocketService):**
    - Xây dựng [socket.service.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/core/services/socket.service.ts) chuẩn hóa 3 sự kiện thời gian thực theo đặc tả `04_API_AND_WEBSOCKET.md`:
      - `emitNewInboxItem(pageId, payload)`: Phát `NEW_INBOX_ITEM` tới phòng Fanpage.
      - `emitInboxUpdated(pageId, payload)`: Phát `INBOX_UPDATED` tới phòng Fanpage và phòng chi tiết hội thoại.
      - `emitPostStatusChanged(pageId, payload)`: Phát `POST_STATUS_CHANGED` tới phòng Fanpage (đã tích hợp vào worker bài viết hẹn giờ).
  - **Tầng Truy Cập Dữ Liệu (Repositories):**
    - Xây dựng [conversation.repository.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/repositories/conversation.repository.ts): Hỗ trợ truy vấn danh sách hội thoại có phân trang, bộ lọc đa chiều (Page, loại messenger/comment, trạng thái open/resolved/archived, tìm kiếm text/khách hàng), chi tiết kèm Customer info, cập nhật status, đánh dấu đã đọc (`markAsRead`), cập nhật tin nhắn cuối cùng.
    - Mở rộng [customer.repository.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/repositories/customer.repository.ts): Bổ sung `findById`, `findByIdAndUserId`, `update` thông tin CRM (tên, số điện thoại, địa chỉ, tags, ghi chú).
    - Mở rộng [message-comment.repository.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/repositories/message-comment.repository.ts): Bổ sung `findMessagesByConversation` với cursor pagination (`created_at < cursor`), `findById`, `findByIdWithPage`, `createPageMessage`, `updateHideStatus`.
  - **Mở rộng Meta Graph API Client:**
    - Bổ sung method `sendMessage(pageId, recipientFbId, text, pageAccessToken, mediaUrl)` trong [graph-api.client.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/meta/graph-api.client.ts) gửi tin nhắn trực tiếp qua Messenger API (`POST /{page-id}/messages`).
    - Nâng cấp method `hideComment(commentId, pageAccessToken, isHidden)` hỗ trợ linh hoạt cả ẩn (`true`) và hiện (`false`) bình luận.
  - **Dịch Vụ Nghiệp Vụ & REST APIs Hộp Thư Tập Trung (`/api/v1/inbox`):**
    - Xây dựng [inbox.service.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/core/services/inbox.service.ts), [inbox.controller.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/api/controllers/inbox.controller.ts), [inbox.routes.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/api/routes/inbox.routes.ts):
      - `GET /api/v1/inbox/conversations`: Danh sách hội thoại phân trang, lọc theo Page/loại/trạng thái/tìm kiếm, tính toán cờ `is_within_24h` của Meta.
      - `GET /api/v1/inbox/conversations/:conversationId`: Chi tiết hội thoại + khách hàng, tự động đánh dấu đã đọc (`unread_count = 0`) và phát socket event.
      - `GET /api/v1/inbox/conversations/:conversationId/messages`: Lấy tin nhắn theo cursor pagination (`nextCursor`).
      - `POST /api/v1/inbox/conversations/:conversationId/messages`: Nhân viên gửi tin nhắn trả lời (phân nhánh Messenger Send API hoặc Comment Reply), lưu DB và phát realtime event.
      - `POST /api/v1/inbox/messages/:messageId/private-reply`: Gửi tin nhắn riêng (Private Reply) cho comment, chặn gửi trùng vi phạm chính sách Meta.
      - `PATCH /api/v1/inbox/messages/:messageId/hide`: Ẩn/Hiện bình luận Facebook qua Graph API.
      - `PATCH /api/v1/inbox/conversations/:conversationId/status`: Đổi trạng thái hội thoại (`open`, `resolved`, `archived`).
      - `PATCH /api/v1/inbox/customers/:customerId`: Cập nhật thông tin khách hàng CRM.
  - **Chất lượng mã nguồn:** 47 file kiểm thử, **393/393 tests passed 100%**, tỷ lệ bao phủ mã nguồn tổng thể đạt **88.89% Statements, 76.20% Branches, 91.94% Functions, 88.89% Lines**, TypeScript type-check 0 lỗi.

---

## [2026-10-20] - Hoàn Thành TASK-12: Đặt Lịch Xuất Bản Bài Viết Đa Kênh & Hàng Đợi Hẹn Giờ BullMQ
- **Tác giả:** System Architect & Backend Engineer (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Hoàn thành trọn vẹn 100% các hạng mục của **[TASK-12]** trên nhánh `feature/task-12-scheduled-posts-publishing` theo quy chuẩn `task-lifecycle.md`.
  - **DTOs & Data Access Layer (`posts_schedule`):**
    - Định nghĩa Zod Schemas [post.dto.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/api/dtos/post.dto.ts) (`CreatePostDtoSchema`, `UpdatePostDtoSchema`, `QueryPostsDtoSchema`), kiểm tra chặt chẽ thời điểm hẹn giờ `scheduled_time` phải cách thời điểm hiện tại ít nhất 10 phút.
    - Xây dựng [post-schedule.repository.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/repositories/post-schedule.repository.ts) thao tác với bảng `posts_schedule` trong PostgreSQL, hỗ trợ đầy đủ `create`, `findById`, `findByIdAndUserId`, `findManyWithFilter` (phân trang, lọc theo page, trạng thái, khoảng ngày), `update`, `updateStatus` (kèm `meta_post_id`, `published_at`, `error_message`), `delete`.
    - Bổ sung phương thức `findById(id)` trong [connected-page.repository.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/repositories/connected-page.repository.ts) để truy xuất Fanpage theo ID.
  - **REST APIs Quản lý Bài viết Đặt lịch (`/api/v1/posts`):**
    - `GET /api/v1/posts`: Danh sách bài viết có phân trang, lọc theo `page_id`, `status` (`pending`, `scheduled`, `published`, `failed`), `from_date`, `to_date`.
    - `GET /api/v1/posts/:postId`: Xem chi tiết bài viết đặt lịch của người dùng.
    - `POST /api/v1/posts`: Tạo bài viết mới & đặt lịch xuất bản (tự động đưa Job vào hàng đợi BullMQ với độ trễ `delay = scheduled_time - now`).
    - `PUT /api/v1/posts/:postId`: Chỉnh sửa nội dung bài viết và dời lại lịch hẹn giờ khi bài viết chưa được xuất bản.
    - `DELETE /api/v1/posts/:postId`: Hủy bài viết đặt lịch và tự động gỡ bỏ Delayed Job trong BullMQ.
    - `POST /api/v1/posts/:postId/retry`: Đưa lại bài viết bị lỗi (`failed`) vào hàng đợi xuất bản ngay lập tức.
    - Xây dựng [post-schedule.service.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/core/services/post-schedule.service.ts), [post.controller.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/api/controllers/post.controller.ts), [post.routes.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/api/routes/post.routes.ts) và tích hợp vào router trung tâm.
  - **Mở rộng Meta Graph API Client Xuất Bản Đa Phương Tiện:**
    - `publishFeedPost(pageId, message, token)`: Đăng bài viết thuần văn bản lên `POST /{page_id}/feed`.
    - `publishPhotoPost(pageId, photoUrl, caption, token)`: Đăng bài viết ảnh đơn lên `POST /{page_id}/photos`.
    - `publishVideoPost(pageId, fileUrl, description, token)`: Đăng video lên `POST /{page_id}/videos`.
    - `uploadUnpublishedPhoto(pageId, photoUrl, token)`: Tải ảnh lên Meta dưới dạng draft chưa xuất bản (`published=false`) để nhận `media_fbid`.
    - `publishAlbumPost(pageId, mediaFbids, message, token)`: Đăng album/carousel đa ảnh lên `POST /{page_id}/feed` với mảng `attached_media: [{media_fbid}]`.
  - **Hàng Đợi Hẹn Giờ & Worker Xuất Bản (BullMQ Publishing Worker):**
    - Cấu hình hàng đợi `scheduled-post-queue` trong [bullmq.client.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/queue/bullmq.client.ts).
    - Xây dựng [scheduled-post.worker.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/queue/scheduled-post.worker.ts) với concurrency 5 luồng. Khi đến giờ hẹn: tự động giải mã Page Access Token qua `decryptToken` (AES-256-GCM), kiểm tra định dạng media (Text, Photo, Video, Carousel/Album) để gọi Meta API tương ứng, cập nhật `published` hoặc `failed`, phát sự kiện `POST_STATUS_CHANGED`.
  - **Chất lượng mã nguồn:** 41 file kiểm thử, **337/337 tests passed 100%**, tỷ lệ bao phủ mã nguồn tổng thể đạt **90.85% Statements, 77.96% Branches, 94.30% Functions, 90.85% Lines**, TypeScript type-check 0 lỗi.

---

## [2026-10-20] - Hoàn Thành TASK-11: Dịch Vụ Tải Lên & Lưu Trữ Phương Tiện Đa Định Dạng (Multer + Cloudinary)
- **Tác giả:** System Architect & Backend Engineer (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Hoàn thành trọn vẹn 100% các hạng mục của **[TASK-11]** trên nhánh `feature/task-11-media-upload-cloudinary` theo quy chuẩn `task-lifecycle.md`.
  - **Cấu hình & Tích hợp Cloudinary SDK:**
    - Cài đặt thư viện `multer`, `cloudinary` và `@types/multer`.
    - Bổ sung biến môi trường Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_URL`) vào `backend/src/config/env.ts`.
    - Xây dựng cấu hình singleton SDK tại [cloudinary.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/config/cloudinary.ts).
  - **Upload Middleware (Multer MemoryStorage):**
    - Xây dựng [upload.middleware.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/api/middlewares/upload.middleware.ts) tiếp nhận file buffer trực tiếp trong RAM (không ghi xuống đĩa cục bộ).
    - Áp dụng các giới hạn chặt chẽ theo yêu cầu Meta Graph API:
      - Ảnh (JPG, PNG, WEBP): Tối đa **4MB** (`MAX_IMAGE_SIZE_BYTES = 4MB`).
      - Video (MP4, MOV): Tối đa **100MB** (`MAX_VIDEO_SIZE_BYTES = 100MB`).
      - Tự động bắt và chuyển đổi lỗi `MulterError` thành `AppError` chuẩn hóa (`UNSUPPORTED_MEDIA_TYPE`, `FILE_TOO_LARGE`, `MISSING_FILE`).
  - **Dịch Vụ Media (Stream Uploader):**
    - Xây dựng [media.service.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/core/services/media.service.ts) sử dụng `node:stream.Readable.from(buffer).pipe(cloudinary.uploader.upload_stream)`.
    - Lưu trữ tại thư mục `shopflow/posts/`, tự động nén tối ưu hóa hình ảnh (`quality: 'auto'`, `fetch_format: 'auto'`).
    - Cung cấp Public HTTPS URL (`secure_url`) sẵn sàng cho Meta Graph API tải về xuất bản.
    - Hỗ trợ phương thức hủy/xóa tệp tin `deleteMedia(publicId, resourceType)`.
  - **REST API Endpoint (`POST /api/v1/media/upload`):**
    - Xây dựng [media.controller.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/api/controllers/media.controller.ts) và [media.routes.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/api/routes/media.routes.ts).
    - Bảo vệ bằng middleware `authenticateToken`, trả về phản hồi HTTP 201 Created chuẩn Envelope JSON.
    - Gắn kết vào router trung tâm [index.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/api/routes/index.ts) tại đường dẫn `/api/v1/media`.
  - **Chất lượng mã nguồn:** 36 file kiểm thử, **278/278 tests passed 100%**, tỷ lệ bao phủ mã nguồn tổng thể đạt **91.57% Statements, 79.37% Branches, 95.56% Functions, 91.57% Lines** (vượt toàn bộ ngưỡng quy chuẩn), TypeScript type-check 0 lỗi.

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
- [x] **[TASK-11]** Dịch Vụ Tải Lên Phương Tiện Truyền Thông Đa Định Dạng (Multer + Cloudinary Stream Upload) (`/api/v1/media`).
- [x] **[TASK-12]** Đặt Lịch Xuất Bản Bài Viết Đa Kênh & Hàng Đợi Hẹn Giờ BullMQ (`/api/v1/posts`).
- [x] **[TASK-13]** Máy Chủ WebSocket Thời Gian Thực (Socket.io) & APIs Hộp Thư Tập Trung (Centralized Inbox) (`/api/v1/inbox`).
- [ ] **[TASK-14]** Giao Diện Người Dùng Next.js 14+ P0: Khung Layout macOS Clean Utility, Màn Hình Auth (`/login`, `/register`) & Quản Lý Kênh Fanpage (`/pages`).
