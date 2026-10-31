# ShopFlow Project Context & Living Knowledge Base

Tài liệu ngữ cảnh dự án lưu giữ kiến thức nền tảng, kiến trúc kỹ thuật và hiện trạng toàn diện của nền tảng **ShopFlow** (Được cập nhật đồng bộ với bộ tài liệu thiết kế tại `docs/` và bảng lộ trình phát triển tại [Task.md](file:///c:/Users/Dell/Desktop/ShopFlow/Task.md)).

---

## 1. Mục Đích & Sứ Mệnh Sản Phẩm

**ShopFlow** là nền tảng tự động hóa quản lý Fanpage Facebook toàn diện dành cho các chủ shop nhỏ và cá nhân kinh doanh B2C tại Việt Nam:
1. **Quản lý Hộp thư Tập trung (Centralized Live Chat 4-Pane Bento):** Gom toàn bộ bình luận (comment thread) và tin nhắn Messenger từ nhiều Fanpage kết nối về một màn hình điều khiển Live Chat thời gian thực duy nhất.
2. **Chống "Cướp Đơn" Tức Thì (< 3 giây):** Quét Regex số điện thoại ngay khi nhận sự kiện Webhook `feed`. Tự động gọi Graph API ẩn bình luận công khai để bảo vệ dữ liệu khách hàng.
3. **Phản hồi Tự động (Auto Reply & Private Reply):** Khớp từ khóa theo quy tắc cấu hình (`automation_rules`), tự động trả lời bình luận công khai và gửi tin nhắn riêng (Private Reply trong vòng 7 ngày) kèm link trích dẫn comment.
4. **Lên Lịch Đăng Bài Chuẩn API (Page Scheduler):** Soạn thảo bài viết, tải ảnh/video lên Cloudinary và đặt lịch xuất bản tự động qua Meta Graph API (`/{page_id}/photos`, `/{page_id}/videos`, `/{page_id}/feed`) từ 10 phút đến 30 ngày (hoặc 6 tháng cho video).
5. **Trích Xuất Thực Thể Đơn Hàng AI (Hybrid 2-Tier Order Parser):** Bóc tách thông minh sản phẩm, mã SKU, số lượng, biến thể (màu/size), SĐT và địa chỉ từ bình luận bằng Regex Fast-path kết hợp Google Gemini 2.5 Flash Structured JSON fallback.
6. **Quản Lý Danh Mục Sản Phẩm & Tồn Kho Nguyên Tử (Atomic Inventory):** Quản lý biến thể JSONB và trừ kho an toàn chống overselling/race conditions khi có nhiều đơn đồng thời.
7. **Thanh Toán VietQR Động Napas 247 & Cổng Vận Chuyển:** Sinh mã QR Napas 247 động theo chuẩn EMVCo CRC16, webhook đối soát tự động Idempotent 24h, và kết nối nhà vận chuyển (GHN, GHTK, Mock).
8. **Phân Quyền Đa Fanpage & Bảo Vệ PII (Multi-Page RBAC):** Quản lý nhân viên theo từng Fanpage (`owner`, `manager`, `staff`), tự động che giấu số điện thoại khách hàng (`098****123`) cho vai trò `staff`.
9. **Báo Cáo Phân Tích Doanh Thu Thời Gian Thực (Analytics Dashboard):** Ma trận nhiệt giờ vàng 24x7, biểu đồ xu hướng doanh thu SVG Bézier, tỷ lệ chuyển đổi chốt đơn CR và xuất báo cáo CSV UTF-8 BOM.
10. **Quản Trị Khách Hàng & Leads Tập Trung (Customer CRM):** Bảng danh bạ khách hàng Bento, tối ưu SQL `LEFT JOIN` tính LTV và tổng đơn hàng không bị lỗi N+1 query, bộ tags đa năng (`VIP`, `Co_SDT`, `Da_Mua_Hang`, `Boom_Hang`).

---

## 2. Bộ Công Nghệ Chuẩn Hóa (Definitive Tech Stack)

Dự án áp dụng kiến trúc **Monorepo** chia 2 thư mục gốc độc lập:

### 2.1. Backend Service (`backend/`)
* **Nền tảng runtime:** **Node.js 20+ LTS**, **Express.js (v4.x/v5.x)**, **TypeScript Strict Mode** (`strict: true`, cấm `any`).
* **Cơ sở dữ liệu:** **PostgreSQL 15+** (Hỗ trợ extension `uuid-ossp`, cột kiểu `JSONB`, check constraints, trigger tự động `update_updated_at_column`, và partial indexes).
* **Database Client:** **`pg` (node-postgres v8.x)** + `pg.Pool` Singleton + **Repository Pattern** có định kiểu, thực thi trực tiếp bộ SQL DDL runnable tại `docs/03_DATABASE_SCHEMA.md` với câu lệnh tham số hóa `$1, $2,...` chống SQL Injection (thay thế hoàn toàn Prisma).
* **Validation Engine:** **`Zod` (v3.x)** kiểm thực toàn diện Request Body, Query String, URL Params và phân tích biến môi trường khởi chạy (`envSchema`).
* **Hàng đợi & Caching:** **Redis 7+** & **BullMQ (v5.x)**
  * Điều tiết tải Webhook, quét Regex SĐT, xuất bản bài viết hẹn giờ, trả lời tự động.
  * Tầng Caching phân tán `CacheService` với Cache-Aside pattern (TTL 10-30 phút) và invalidation bằng lệnh `SCAN` an toàn.
  * Cấu hình Exponential Backoff khi dính Meta Rate Limit (Error 613 / 80001): `attempts: 5`, `backoff: { type: 'exponential', delay: 3000 }`.
* **Trí Tuệ Nhân Tạo (AI Engine):** **Google Gemini 2.5 Flash** (Structured JSON output mode) trích xuất thực thể đơn hàng phức tạp kèm lá chắn `<customer_input>` chống prompt injection.
* **Cổng Thanh Toán & Vận Chuyển:**
  * **VietQR Napas 247 Helper:** Định dạng TLV EMVCo QR Code và thuật toán mã băm CRC16-CCITT.
  * **Shipping Strategy Adapter:** `GhnCarrierAdapter`, `GhtkCarrierAdapter`, `MockCarrierAdapter`.
* **Lưu trữ Media:** **Multer (MemoryStorage)** kết hợp **Cloudinary SDK v2** (Stream buffer trực tiếp từ RAM), cấp đường dẫn HTTPS công khai (`secure_url`) theo yêu cầu của Meta Graph API.
* **Giao tiếp Thời gian Thực:** **Socket.io (v4.x)** với phân vùng phòng `room:user_{id}`, `room:page_{id}`, `room:conv_{id}`.
* **Bảo mật & Hiệu năng Tầng Mạng:**
  * Mã hóa **AES-256-GCM** cho toàn bộ `page_access_token` và `user_access_token` trong DB (khóa 32-byte hex ngẫu nhiên).
  * Xác thực Webhook bằng HMAC-SHA256 với `crypto.timingSafeEqual` trên raw body buffer.
  * Xác thực người dùng bằng JWT (Access Token 15 phút, Refresh Token 7 ngày trong HttpOnly Cookie).
  * Nén HTTP Gzip/Deflate tự động cho payload ≥ 1KB qua `compressionMiddleware`.
  * Bộ Rate Limiting phân tầng (`globalApiLimiter`, `authLimiter`, `heavyComputationLimiter`).
  * Gia cố HTTP Headers chuẩn OWASP bằng `helmet` (HSTS 180 ngày, nosniff, no-sniff CSP).

### 2.2. Frontend Dashboard (`frontend/`)
* **Khung ứng dụng:** **Next.js 14+ (App Router)**, **React 18+**, **TypeScript Strict Mode**.
* **Giao diện & Styling:** **Tailwind CSS**, **Lucide React**, phong cách **macOS Clean Utility Bento Grid**.
* **Quản trị State & Realtime:** **Zustand** stores (kèm defensive normalizers và optimistic UI updates), **Socket.io-client**, **Axios** (kèm Bearer Token Interceptor & Auto Refresh).
* **Danh Mục 8 Màn Hình Cốt Lõi:**
  1. `(auth)/login` & `(auth)/register`: Đăng nhập, đăng ký tài khoản có rate limiting và JWT token refresh.
  2. `(dashboard)/pages`: Quản lý danh sách Fanpage, kết nối Meta OAuth 2.0, đồng bộ webhook, quản lý thành viên RBAC (`PageMembersModal`, `InviteMemberModal`).
  3. `(dashboard)/automation`: Cấu hình quy tắc tự động ẩn SĐT, từ khóa kích hoạt, mẫu trả lời comment & private reply.
  4. `(dashboard)/posts`: Lịch đăng bài (Calendar view nhận diện giờ vàng / Table view) và màn hình soạn bài viết Split-Pane `posts/new` tích hợp live preview Facebook desktop/mobile.
  5. `(dashboard)/inbox`: Giao diện Live Chat 4-Pane Bento tập trung (Kênh & Lọc, Danh sách hội thoại kèm đếm ngược Meta 24h, Khung chat realtime kèm ShopFlow Shield, Bảng CRM mini & Thẻ Đơn Hàng AI).
  6. `(dashboard)/orders`: Quản lý đơn hàng, Bento metrics, bảng đơn hàng lọc đa trạng thái, Drawer chi tiết đơn hàng (PII phone masking), in phiếu giao hàng A5/A6 máy in nhiệt.
  7. `(dashboard)/analytics`: Báo cáo phân tích doanh thu thuần, biểu đồ xu hướng SVG Bézier, ma trận nhiệt Golden Hour Heatmap 24x7, Top sản phẩm bán chạy và xuất báo cáo CSV UTF-8 BOM.
  8. `(dashboard)/customers`: Quản lý khách hàng & leads tập trung, Bento KPI thẻ, bảng danh bạ phong cách macOS Clean Utility, quản lý tags nhanh và Drawer lịch sử đơn hàng.
  9. `(dashboard)/settings`: Màn hình cài đặt hệ thống & giám sát Meta API Limits (Dự kiến hoàn thiện tại TASK-28).

---

## 3. Bản Đồ Dữ Liệu 15 Bảng Quan Hệ ACID (Core Data Schema)

Cơ sở dữ liệu PostgreSQL 15+ của ShopFlow được tổ chức thành **15 bảng** chuẩn ACID có chỉ mục tối ưu và trigger tự động:

1. `users`: Tài khoản chủ shop và nhân viên (`id`, `email`, `password_hash`, `full_name`, `role`, `created_at`, `updated_at`).
2. `facebook_accounts`: Tài khoản Facebook cá nhân kết nối qua OAuth (`user_id`, `fb_user_id`, `user_access_token` mã hóa AES-256-GCM).
3. `connected_pages`: Fanpage Facebook kết nối (`page_id`, `page_name`, `page_access_token` mã hóa AES-256-GCM, `is_active`, `webhook_subscribed`).
4. `page_members`: Quản lý phân quyền nhân viên theo từng Fanpage (`page_id`, `user_id`, `role`: `owner` | `manager` | `staff`, `status`: `active` | `pending` | `revoked`).
5. `automation_rules`: Quy tắc tự động phản hồi của từng Page (`page_id`, `name`, `trigger_keywords`, `is_active`, `hide_phone_enabled`, `auto_comment_template`, `auto_private_reply_template`).
6. `posts_schedule`: Bài viết hẹn giờ đăng qua BullMQ (`page_id`, `content`, `media_type`, `media_urls`, `scheduled_time`, `status`: `pending` | `scheduled` | `published` | `failed`).
7. `products`: Danh mục sản phẩm và kho hàng (`page_id`, `sku`, `name`, `price`, `original_price`, `stock_quantity`, `variants` JSONB, `image_urls` JSONB, `is_active`).
8. `orders`: Vòng đời đơn hàng (`page_id`, `order_code`, `customer_id`, `status`: `pending` | `confirmed` | `shipping` | `completed` | `cancelled`, `total_amount`, `final_amount`, `shipping_address`, `timeline` JSONB).
9. `order_items`: Chi tiết các mặt hàng trong đơn hàng (`order_id`, `product_id`, `sku`, `product_name`, `quantity`, `price`, `variant_options` JSONB).
10. `payments`: Nhật ký giao dịch thanh toán VietQR Napas 247 (`order_id`, `gateway`, `transaction_id` UNIQUE, `amount`, `transfer_content`, `status`: `pending` | `paid` | `failed`).
11. `shipments`: Thông tin vận chuyển và giao nhận (`order_id`, `carrier`: `ghn` | `ghtk` | `mock`, `tracking_code` UNIQUE, `shipping_fee`, `cod_amount`, `status`).
12. `customers`: Hồ sơ khách hàng CRM (`page_id`, `customer_fb_id`, `customer_name`, `phone_number`, `tags` JSONB, `notes`).
13. `conversations`: Hội thoại tập trung đa kênh (`page_id`, `customer_id`, `type`: `messenger` | `comment_thread`, `window_24h_expires_at`, `unread_count`, `status`: `open` | `resolved` | `archived`).
14. `messages_and_comments`: Chi tiết từng tương tác (`conversation_id`, `meta_id`, `sender_type`, `content`, `is_hidden`, `private_reply_sent`, `media_payload` JSONB).
15. `webhook_logs`: Nhật ký sự kiện Webhook Meta phục vụ xử lý Idempotency (`event_id` UNIQUE, `entry_id`, `field`, `payload` JSONB, `status`).

---

## 4. Kiến Trúc Triển Khai Production & Gateway (Docker Ecosystem)

Môi trường Production của ShopFlow được đóng gói và điều phối qua `docker-compose.prod.yml` gồm **5 dịch vụ cô lập**:
1. **Nginx Reverse Proxy Gateway (Port 80/443):**
   - Định tuyến `/api/` & `/health` về backend Express.
   - Định tuyến `/socket.io/` với giao thức WebSocket Upgrade.
   - Định tuyến `/_next/static/` tới client cache 1 năm (`Cache-Control: public, max-age=31536000, immutable`).
   - Định tuyến `/` về Next.js Frontend.
   - Tự động nén Gzip ở tầng gateway và ẩn hoàn toàn phiên bản Nginx.
2. **Frontend Container (`frontend/Dockerfile`):** Multi-stage build Node 20-alpine với chế độ Next.js `output: 'standalone'` dung lượng < 180MB.
3. **Backend Container (`backend/Dockerfile`):** Multi-stage build Node 20-alpine, dumb-init, chạy với non-root user `node` dung lượng < 150MB.
4. **PostgreSQL 15 Container:** Cơ sở dữ liệu quan hệ trung tâm, cấu hình mount volume bền vững.
5. **Redis 7 Container:** Lưu trữ hàng đợi BullMQ, cache phân tán và khóa Idempotency.

---

## 5. Các Giới Hạn Kỹ Thuật & Ràng Buộc Bắt Buộc (Meta Compliance)

- **Cửa sổ Tin nhắn 24 giờ (Standard Messaging Window):** Chỉ gửi tin nhắn chủ động tới khách hàng trên Messenger trong vòng 24 giờ kể từ tương tác cuối cùng (`window_24h_expires_at`).
- **Giới hạn Private Reply:** Chỉ gửi tin nhắn riêng tối đa **1 lần duy nhất** cho mỗi bình luận và trong vòng **7 ngày** kể từ khi bình luận xuất hiện.
- **Ràng buộc Thời gian Đăng bài:** Thời điểm hẹn giờ `scheduled_time` phải lớn hơn hiện tại ít nhất **10 phút** và không quá **30 ngày** (ảnh/feed) hoặc tối đa **6 tháng** (video).
- **Ràng buộc Media:** Hình ảnh JPG/PNG/WEBP <= 4MB; Video MP4/MOV <= 100MB; URL media gửi sang Meta bắt buộc là **Public HTTPS URL** từ Cloudinary.
- **Tuyệt đối KHÔNG sử dụng Groups API:** Meta đã hủy quyền `publish_to_groups` từ 22/04/2024. Không sử dụng tool/extension lách luật tránh nguy cơ bị khóa Page/App ID vĩnh viễn.

---

## 6. Cấu Trúc Hệ Thống Tài Liệu (`docs/`)

- [`docs/00_INDEX.md`](file:///C:/Users/Dell/Desktop/ShopFlow/docs/00_INDEX.md): Mục lục trung tâm & Ma trận chỉ dẫn "Code phần nào đọc file nào".
- [`docs/01_PRD.md`](file:///C:/Users/Dell/Desktop/ShopFlow/docs/01_PRD.md): Khảo sát yêu cầu sản phẩm & phân tích nghiệp vụ.
- [`docs/02_ARCHITECTURE_AND_FLOWS.md`](file:///C:/Users/Dell/Desktop/ShopFlow/docs/02_ARCHITECTURE_AND_FLOWS.md): Luồng người dùng, sơ đồ kiến trúc, tech stack, cây thư mục và cấu hình môi trường.
- [`docs/03_DATABASE_SCHEMA.md`](file:///C:/Users/Dell/Desktop/ShopFlow/docs/03_DATABASE_SCHEMA.md): Mô hình ERD, định nghĩa bảng và toàn bộ mã SQL DDL Runnable.
- [`docs/04_API_AND_WEBSOCKET.md`](file:///C:/Users/Dell/Desktop/ShopFlow/docs/04_API_AND_WEBSOCKET.md): Chuẩn JSON Response Envelope, REST APIs, Socket.io payload và luồng tải media.
- [`docs/05_DESIGN_SYSTEM.md`](file:///C:/Users/Dell/Desktop/ShopFlow/docs/05_DESIGN_SYSTEM.md): Quy chuẩn thiết kế giao diện macOS Clean Utility Bento Grid.
- [`docs/06_UI_SCREENS_AND_COMPONENTS.md`](file:///C:/Users/Dell/Desktop/ShopFlow/docs/06_UI_SCREENS_AND_COMPONENTS.md): Chi tiết cấu tạo từng màn hình và component React.
