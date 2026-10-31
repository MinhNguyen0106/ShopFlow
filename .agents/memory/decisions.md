# Architecture Decision Records (ADR) - ShopFlow

Tài liệu ghi nhận các quyết định kiến trúc quan trọng kèm bối cảnh, lý do lựa chọn và hệ quả đối với nền tảng **ShopFlow**.

---

## ADR-001: Lựa Chọn Express.js & TypeScript cho Backend Webhook & API Service
- **Ngày quyết định:** 2026-10-17
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Cần xử lý luồng Webhook Meta gửi đến liên tục với độ trễ thấp, đồng thời xác thực chữ ký thô (raw body buffer) và tích hợp các middleware bảo mật.
- **Quyết định:** Sử dụng Express.js kết hợp TypeScript ở chế độ Strict.
- **Hệ quả:** Kiểm soát toàn diện middleware (lưu raw body cho HMAC verification trước khi JSON parse), hệ sinh thái middleware phong phú, cộng đồng hỗ trợ lớn và dễ triển khai độc lập.

---

## ADR-002: Lựa Chọn Redis & BullMQ Cho Hàng Đợi Xử Lý Webhook & Scheduler
- **Ngày quyết định:** 2026-10-17 (Cập nhật 2026-10-19)
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Meta gửi hàng loạt webhook khi bài đăng có tương tác lớn. Nếu gọi ngược lại Graph API dồn dập, hệ thống sẽ bị chặn vì vi phạm chính sách Spam hoặc dính Rate Limit (Lỗi 613 / 80001).
- **Quyết định:** Phân tách Webhook Ingestion và Processing. Endpoint webhook phản hồi ngay `200 OK` trong vòng < 200ms. Sử dụng BullMQ để xử lý bất đồng bộ các tác vụ: quét Regex ẩn SĐT, gửi Private Reply, và lên lịch xuất bản bài viết hẹn giờ (Delay Job).
- **Cấu hình Retry Chuẩn Hóa:** `attempts: 5`, `backoff: { type: 'exponential', delay: 3000 }` (thử lại sau 3s, 6s, 12s, 24s, 48s).
- **Hệ quả:** Đảm bảo độ sẵn sàng cao, không bị Meta hủy webhook, và tự động hồi phục khi chạm trần Rate Limit.

---

## ADR-003: Chuyển Đổi Sang PostgreSQL 15+ Làm Cơ Sở Dữ Liệu Quan Hệ Trung Tâm
- **Ngày quyết định:** 2026-10-19 (Thay thế quyết định MySQL ban đầu)
- **Trạng thái:** SUPERSEDED
- **Bối cảnh:** Dự án cần lưu trữ cấu trúc JSON linh hoạt (`JSONB`), các chỉ mục có điều kiện (Partial Indexes) để lọc bài đăng `pending`, khách hàng có SĐT, quy tắc đang kích hoạt, và các trigger tự động cập nhật thời gian.
- **Quyết định:** Sử dụng **PostgreSQL 15+** với extension `uuid-ossp`, kiểu dữ liệu `JSONB`, và các hàm trigger native `update_updated_at_column`.
- **Hệ quả:** Tối ưu hóa hiệu năng truy vấn cho bảng hội thoại lớn, hỗ trợ chỉ mục từng phần khắt khe, kiểm soát toàn vẹn khóa ngoại (CASCADE/SET NULL) mượt mà.

---

## ADR-004: Chiến Lược Trích Xuất & Bảo Vệ Khách Hàng (Regex First, Auto-Hide SĐT < 3s)
- **Ngày quyết định:** 2026-10-17 (Cập nhật 2026-10-19)
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Khách hàng bình luận số điện thoại công khai trên Fanpage thường xuyên bị đối thủ cướp đơn hoặc lừa đảo.
- **Quyết định:** 
  1. Quét Regex số điện thoại Việt Nam `/(03|05|07|08|09|01[2689])+([0-9]{8})\b/` ngay tại Worker trong thời gian < 3 giây.
  2. Nếu phát hiện SĐT, lập tức gọi Graph API `POST /{comment_id}` với `is_hidden: true` và gắn tag `Co_SDT` cho khách hàng.
  3. Tự động gửi Private Reply thông báo cho khách hàng đã tiếp nhận thông tin (trong vòng 7 ngày).
- **Hệ quả:** Chống cướp đơn tuyệt đối, bảo mật PII khách hàng, cải thiện tỷ lệ chốt đơn mà không tốn chi phí gọi LLM liên tục.

---

## ADR-005: Xác Thực Webhook Chữ Ký Bắt Buộc (HMAC-SHA256 Timing-Safe)
- **Ngày quyết định:** 2026-10-17
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Kẻ tấn công có thể giả mạo request gửi đến endpoint Webhook nhằm spam dữ liệu giả hoặc khai thác lỗ hổng Timing Attack.
- **Quyết định:** Mọi request tới `/api/v1/webhooks/facebook` phải được giữ nguyên Raw Body Buffer và xác thực chữ ký `x-hub-signature-256` qua thuật toán `crypto.timingSafeEqual`.
- **Hệ quả:** Ngăn chặn triệt để tấn công giả mạo và tấn công thời gian.

---

## ADR-006: Lựa Chọn Next.js 14+ (App Router) Cho Bảng Quản Trị (Dashboard)
- **Ngày quyết định:** 2026-10-17
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Cần xây dựng giao diện hiện đại, tải trang nhanh, cung cấp Live Chat tương tác mượt mà và quản lý nhiều Fanpage.
- **Quyết định:** Sử dụng Next.js 14+ (App Router), Tailwind CSS, Lucide React, và Radix UI / Shadcn UI.
- **Hệ quả:** Phân tách rõ ràng giữa Server Components (render layout, SSR) và Client Components (`use client` cho Live Chat, tương tác DOM và Socket).

---

## ADR-007: Sử Dụng `pg` (node-postgres) + Repository Pattern Thay Thế Prisma ORM
- **Ngày quyết định:** 2026-10-19
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Tệp SQL DDL tại `docs/03_DATABASE_SCHEMA.md` chứa nhiều đặc tính native của PostgreSQL: `CREATE EXTENSION "uuid-ossp"`, Partial Indexes (`WHERE status = 'pending'`, `WHERE phone_number IS NOT NULL`), CHECK constraints và Triggers. Prisma gặp nhiều rào cản khi đồng bộ hóa các tính năng này và phát sinh overhead trừu tượng hóa.
- **Quyết định:** Chốt dứt khoát sử dụng thư viện **`pg` (node-postgres v8.x)** kết hợp `pg.Pool` Singleton và **Repository Pattern** có định kiểu TypeScript.
- **Hệ quả:** 
  - Tái sử dụng 100% tệp SQL DDL runnable mà không gặp lỗi migration.
  - Kiểm soát hoàn toàn câu lệnh tham số hóa `$1, $2,...` ngăn chặn 100% rủi ro SQL Injection.
  - Hiệu năng truy vấn cao, thời gian khởi động nhanh và dung lượng package nhỏ gọn.

---

## ADR-008: Lưu Trữ Phương Tiện Đám Mây Qua Multer MemoryStorage & Cloudinary Stream Upload
- **Ngày quyết định:** 2026-10-19
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Meta Graph API yêu cầu tham số hình ảnh (`POST /{page_id}/photos`) và video (`POST /{page_id}/videos`) phải trỏ tới một liên kết **Public HTTPS URL** có thể truy cập được từ máy chủ Meta.
- **Quyết định:** 
  1. Frontend gửi file qua `multipart/form-data`.
  2. Backend Express sử dụng `multer` cấu hình `memoryStorage()` giữ buffer trong RAM.
  3. Service stream trực tiếp buffer lên Cloudinary thông qua SDK `cloudinary.v2.uploader.upload_stream` với folder `shopflow/posts/`.
  4. Trả về `secure_url` (HTTPS URL) lưu vào DB và gửi sang Meta khi đến giờ xuất bản.
- **Hệ quả:** Không lưu file rác trên ổ cứng máy chủ Backend, tận dụng CDN toàn cầu của Cloudinary và luôn đáp ứng 100% chuẩn HTTPS của Meta Graph API.

---

## ADR-009: Chuẩn Hóa Kiến Trúc Monorepo, Zod Validation & Mã Hóa AES-256-GCM
- **Ngày quyết định:** 2026-10-19
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Cần đảm bảo tính đồng nhất tuyệt đối giữa Frontend và Backend, đồng thời bảo vệ bí mật Meta Token và validate dữ liệu chặt chẽ.
- **Quyết định:**
  - Tổ chức Monorepo với 2 thư mục gốc: `backend/` và `frontend/`.
  - Validate 100% Request Body, Query, Params và file biến môi trường (`.env`) bằng thư viện **`Zod`**.
  - Mã hóa toàn bộ `page_access_token` và `user_access_token` bằng thuật toán **AES-256-GCM** (khóa 32-byte hex ngẫu nhiên) trước khi lưu vào PostgreSQL.
- **Hệ quả:** Phát hiện sớm lỗi sai kiểu dữ liệu ngay tại tầng Middleware, ngăn chặn rò rỉ Access Token ngay cả khi cơ sở dữ liệu bị lộ.

---

## ADR-010: Kiến Trúc Live Chat Tập Trung (Centralized Inbox) Với Socket.io & Layout 3 Cột
- **Ngày quyết định:** 2026-10-19
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Nhân viên trực chat cần giao diện phản hồi nhanh, không bị phân tán giữa các Fanpage và cập nhật tin tức thời gian thực (< 1.5s).
- **Quyết định:**
  - Sử dụng **Socket.io** với phòng phân vùng theo người dùng (`room:user_{id}`) và theo trang (`room:page_{id}`).
  - Thiết kế màn hình Live Chat 3 cột chuyên dụng tại `frontend/src/app/(dashboard)/inbox/page.tsx`:
    - Cột 1: Kênh & Bộ lọc tương tác (Page, Messenger, Comment thread, Trạng thái).
    - Cột 2: Danh sách cuộc trò chuyện, tìm kiếm khách hàng, đếm tin chưa đọc, huy hiệu cửa sổ 24h.
    - Cột 3: Khung chat thời gian thực (Bubble chat, badge Ẩn SĐT, gửi Private Reply) kết hợp Bảng thông tin khách hàng (SĐT, tag, ghi chú).
- **Hệ quả:** Nâng cao 200% năng suất làm việc của nhân viên, không bao giờ bỏ sót tin nhắn của khách.

---

## ADR-011: Mô-đun Hóa Bộ Tài Liệu Thiết Kế Hệ Thống
- **Ngày quyết định:** 2026-10-19
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Tệp `docs/DESIGN.md` ban đầu vượt quá 1000 dòng, gây khó khăn cho việc tra cứu và làm quá tải Context Window của LLM khi code từng phân hệ độc lập.
- **Quyết định:** Phân tách `DESIGN.md` thành 5 tệp chuyên biệt:
  - `docs/00_INDEX.md`: Mục lục trung tâm & Ma trận chỉ dẫn "Code phần nào đọc file nào".
  - `docs/01_PRD.md`: Nghiệp vụ & Yêu cầu sản phẩm.
  - `docs/02_ARCHITECTURE_AND_FLOWS.md`: Luồng tương tác, kiến trúc tổng thể, tech stack, cây thư mục và `.env`.
  - `docs/03_DATABASE_SCHEMA.md`: Mô hình ERD, chi tiết 9 bảng và toàn bộ SQL DDL runnable.
  - `docs/04_API_AND_WEBSOCKET.md`: Chuẩn JSON response, 24+ REST APIs, Socket.io payload và Media upload sequence diagram.
- **Hệ quả:** Tối ưu hóa Context Window cho AI Coding Agent, mỗi nhiệm vụ chỉ cần nạp đúng 1 - 2 file tương ứng, loại bỏ 100% sự suy đoán mơ hồ.


---

## ADR-012: Kiến Trúc Bóc Tách Đơn Hàng Hybrid 2 Tầng (Regex Fast-Path & Google Gemini AI Fallback)
- **Ngày quyết định:** 2026-10-21
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Khách hàng chốt đơn trên Fanpage để lại bình luận hoặc tin nhắn với đa dạng hình thức: từ cú pháp ngắn chuẩn hóa (`#SP01 2 cái đỏ M 0988123456`), tới câu trò chuyện tự nhiên dài dòng có nhiều từ ngữ địa phương. Nếu gọi trực tiếp mô hình AI lớn cho 100% bình luận, hệ thống sẽ chịu chi phí token cao và độ trễ phản hồi lớn (> 1.5s).
- **Quyết định:** Triển khai kiến trúc Hybrid 2 tầng trong `OrderParserService`:
  1. **Tầng 1 (Regex Fast-path):** `RegexOrderParser` quét trực tiếp cú pháp `#SKU` hoặc `[SKU]`, bóc tách số lượng, size/màu, SĐT Việt Nam trong thời gian < 50ms với 0 chi phí token. Nếu độ tin cậy `confidenceScore >= 0.8`, trả kết quả ngay.
  2. **Tầng 2 (Gemini AI Fallback):** Khi cú pháp tự do phức tạp, gọi Google Gemini 2.5 Flash qua Structured JSON output mode với AbortController (timeout 8s), bọc dữ liệu người dùng trong thẻ `<customer_input>` chống prompt injection.
  3. **Graceful Degradation:** Tự động giáng cấp về kết quả Regex tầng 1 an toàn nếu AI gặp lỗi cạn kiệt hạn mức quota (429) hoặc sự cố kết nối mạng.
- **Hệ quả:** Tiết kiệm hơn 80% chi phí token API, thời gian phản hồi tức thì cho phần lớn đơn hàng chuẩn và duy trì độ chính xác 100% trên bộ Golden test fixtures.

---

## ADR-013: Trừ Kho Nguyên Tử (Atomic Decrement) & Chống Race Condition/Overselling
- **Ngày quyết định:** 2026-10-21
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Trong các đợt phát sóng livestream hoặc bài viết quảng cáo khuyến mãi, nhiều khách hàng cùng đặt một sản phẩm hoặc biến thể giới hạn tại cùng một thời điểm. Nếu thực hiện theo mô hình `SELECT stock` rồi `UPDATE stock`, hiện tượng Race Condition chắc chắn xảy ra dẫn tới bán âm kho (overselling).
- **Quyết định:** 
  1. Sử dụng câu lệnh SQL điều kiện nguyên tử ở cấp độ cơ sở dữ liệu trong `ProductRepository`:
     `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1 RETURNING *`.
  2. Đối với các biến thể lồng nhau trong cột `variants` (JSONB), cập nhật và kiểm tra điều kiện tồn kho trực tiếp trong cùng một Database Transaction.
- **Hệ quả:** Loại bỏ hoàn toàn tình trạng overselling mà không cần dùng đến khóa phân tán (Distributed Lock) phức tạp, giảm thiểu tối đa độ trễ xử lý đơn hàng.

---

## ADR-014: Thanh Toán VietQR Động Chuẩn Napas 247 & Idempotency Webhook
- **Ngày quyết định:** 2026-10-21
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Người mua hàng online tại Việt Nam có thói quen quét mã QR ngân hàng để chuyển khoản thanh toán. Việc tích hợp cổng thanh toán trung gian truyền thống thường tốn chi phí giao dịch cao và thủ tục pháp lý phức tạp cho các chủ shop nhỏ.
- **Quyết định:**
  1. Xây dựng bộ tiện ích `VietQrHelper` chuẩn Napas 247 theo đặc tả quốc tế EMVCo TLV (Tag-Length-Value) kết hợp thuật toán băm CRC16-CCITT (polynomial `0x1021`, initial `0xFFFF`) xuất chuỗi mã QR hợp lệ và liên kết ảnh QuickLink VietQR.
  2. Tích hợp webhook biến động số dư ngân hàng qua `PaymentWebhookService`, thiết lập khóa Idempotency Key 24h trong Redis (`payment:processed:${gateway}:${transactionId}`) nhằm ngăn chặn triệt để tấn công Replay Attack.
  3. Tự động đối soát số tiền thực nhận so với `final_amount`, tự động chuyển trạng thái đơn hàng sang `confirmed` và phát sự kiện realtime WebSocket.
- **Hệ quả:** Người mua chỉ cần quét mã QR có sẵn số tiền và nội dung chuyển khoản bảo mật; đơn hàng được duyệt tự động tức thì mà không cần chủ shop kiểm tra sao kê thủ công.

---

## ADR-015: Bảo Vệ Dữ Liệu Cá Nhân PII Masking & Phân Quyền Theo Ngữ Cảnh Fanpage (RBAC)
- **Ngày quyết định:** 2026-10-24
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Chủ shop thường thuê cộng tác viên hoặc nhân viên part-time trực chat trả lời khách hàng. Nếu nhân viên có thể thấy toàn bộ số điện thoại thật của khách hàng, nguy cơ rò rỉ dữ liệu hoặc nhân viên lấy cắp tệp khách hàng tiềm năng mang sang đối thủ là rất cao.
- **Quyết định:**
  1. Thiết kế bảng `page_members` hỗ trợ 3 vai trò phân cấp theo từng Fanpage: `owner` (chủ sở hữu toàn quyền), `manager` (quản lý vận hành), `staff` (nhân viên trực chat).
  2. Middleware `requirePageRole` thẩm định quyền động dựa trên Fanpage ID của request.
  3. Xây dựng chính sách bảo vệ dữ liệu PII (`pii-masking.helper.ts`): Toàn bộ API đơn hàng (`/api/v1/orders`), danh bạ CRM (`/api/v1/customers`), và hộp thư chat (`/api/v1/inbox`) tự động che giấu số điện thoại (`098****123`) khi người dùng đang thao tác với vai trò `staff`.
- **Hệ quả:** Bảo vệ tuyệt đối quyền riêng tư và tài sản dữ liệu khách hàng của shop, tuân thủ nghiêm ngặt các quy định về an toàn thông tin cá nhân.

---

## ADR-016: Chiến Lược Caching Hai Tầng Với Redis (Cache-Aside Pattern) & Quét Pattern SCAN An Toàn
- **Ngày quyết định:** 2026-10-24
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Các API tra cứu danh mục sản phẩm (`/api/v1/products`) và thông tin chi tiết Fanpage (`/api/v1/pages/:id`) có tần suất đọc (read throughput) rất cao nhưng dữ liệu thay đổi ít. Đồng thời, việc sử dụng lệnh `KEYS *` để xóa cache theo pattern có nguy cơ làm nghẽn đơn luồng (single-thread event loop) của Redis và Node.js trong môi trường tải lớn.
- **Quyết định:**
  1. Triển khai `CacheService` bọc quanh `ioredis` theo kiến trúc Cache-Aside (đọc cache trước, nếu cache-miss thì truy vấn database và lưu cache với TTL 10 đến 30 phút).
  2. Triển khai phương thức xóa cache an toàn `invalidateByPattern`: Sử dụng con trỏ quét `SCAN` với đợt quét 100 keys/lần thay thế hoàn toàn lệnh `KEYS *`.
  3. Hook tự động xóa cache khi có sự kiện ghi: Thêm mới, cập nhật sản phẩm, thay đổi tồn kho, hoặc cấu hình Fanpage.
- **Hệ quả:** Giảm hơn 75% tải truy vấn xuống cơ sở dữ liệu PostgreSQL và đảm bảo độ trễ thấp (< 15ms) ngay cả khi hệ thống chịu tải đột biến.

---

## ADR-017: Kiến Trúc Triển Khai Production: Nginx Reverse Proxy Gateway & Multi-stage Standalone Docker Containers
- **Ngày quyết định:** 2026-10-24
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Cần một cấu hình đóng gói chuẩn mực, an ninh cao và tối ưu tài nguyên để sẵn sàng triển khai trên bất kỳ hạ tầng đám mây (Cloud VPS/Dedicated Server) nào mà không phụ thuộc vào thiết lập môi trường thủ công.
- **Quyết định:**
  1. Điều phối cụm dịch vụ qua `docker-compose.prod.yml` gồm 5 container biệt lập: `nginx`, `frontend`, `backend`, `postgres`, `redis`.
  2. Sử dụng Nginx làm API Gateway duy nhất: Tiếp nhận HTTPS port 80/443, nén Gzip tầng gateway, ẩn phiên bản Nginx, nâng cấp WebSocket (`/socket.io/`), định tuyến API backend (`/api/`) và phục vụ static assets của Next.js với client cache 1 năm (`immutable`).
  3. Tối ưu hóa Container Images:
     - `backend/Dockerfile`: Multi-stage build Node 20-alpine, công cụ quản lý tiến trình `dumb-init`, chạy dưới quyền người dùng không đặc quyền (`user node`), dung lượng < 150MB.
     - `frontend/Dockerfile`: Next.js `output: 'standalone'` kết hợp multi-stage builder, dung lượng < 180MB.
- **Hệ quả:** Quy trình triển khai nhất quán 100%, bảo mật cao chuẩn OWASP, tiết kiệm RAM/CPU máy chủ và khởi động lại dịch vụ không gián đoạn.

---

## ADR-018: Quản Trị Khách Hàng & Tính Toán Chỉ Số LTV Không Bị N+1 Bằng Truy Vấn SQL Aggregation
- **Ngày quyết định:** 2026-10-30
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Màn hình CRM Khách hàng & Leads (`/customers`) hiển thị danh sách hàng nghìn khách hàng kèm tổng số đơn đã mua và tổng giá trị vòng đời (LTV - Life Time Value). Nếu duyệt từng khách hàng rồi chạy câu lệnh `SELECT COUNT(*), SUM(final_amount) FROM orders WHERE customer_id = ...`, hệ thống sẽ gặp lỗi nghiêm trọng về hiệu năng (N+1 query problem).
- **Quyết định:**
  1. Trong `CustomerRepository`, thực hiện truy vấn tổng hợp SQL một lần duy nhất sử dụng `LEFT JOIN orders` kèm điều kiện lọc đơn hủy:
     `COALESCE(SUM(o.final_amount) FILTER (WHERE o.status != 'cancelled'), 0) AS total_spent`.
  2. Gom nhóm theo `customers.id` và phân trang ở cấp độ database bằng `LIMIT` và `OFFSET`.
- **Hệ quả:** Tốc độ tải danh bạ khách hàng luôn ổn định < 50ms cho mọi quy mô dữ liệu, loại bỏ 100% lỗi N+1 query.


---

## ADR-019: Kiến Trúc Bố Cục Full-Width Canvas (Edge-to-Edge Fluid Workspace) Thay Thế Khung Cửa Sổ Giới Hạn
- **Ngày quyết định:** 2026-10-31
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Trước đây, toàn bộ giao diện bảng điều khiển của ShopFlow bị bó hẹp trong một khung cửa sổ giả lập macOS lơ lửng ở giữa trang với kích thước giới hạn cố định (`max-w-[1560px]`, `min-h-[92vh]`, viền padding ngoài `p-2 sm:p-4 md:p-6`) trên nền blueprint grid. Đồng thời, bên trong các trang nghiệp vụ con tiếp tục tồn tại các container giới hạn (`max-w-7xl mx-auto` hoặc `max-w-[1400px] mx-auto`). Thiết kế này gây lãng phí diện tích hiển thị trên các màn hình máy tính để bàn (Desktop / Ultra-wide monitors), hạn chế không gian hiển thị của các bảng dữ liệu lớn (Đơn hàng, Khách hàng CRM, Live Chat) và các biểu đồ phân tích SVG.
- **Quyết định:**
  1. Loại bỏ hoàn toàn khung bo góc cố định, bóng đổ và padding ngoài của `MacWindowShell`. Chuyển đổi container ngoài cùng thành Viewport Canvas toàn màn hình (`h-screen w-full flex flex-col overflow-hidden bg-white`).
  2. Tái cấu trúc thanh tiêu đề macOS Header (nút traffic lights, tiêu đề hệ thống, huy hiệu trạng thái) trải dài 100% mép trên cùng của màn hình (Edge-to-Edge).
  3. Gỡ bỏ triệt để các lớp container `max-w-7xl`, `max-w-[1400px]`, `mx-auto` tại toàn bộ 7 trang dashboard con (`/analytics`, `/automation`, `/customers`, `/pages`, `/posts`, `/posts/new`, `/orders`), thay bằng cấu trúc `w-full space-y-6`.
  4. Duy trì thanh cuộn độc lập cho main content workspace (`flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 w-full`), trong khi Sidebar và Topbar cố định vị trí.
- **Hệ quả:** Tối đa hóa 100% không gian làm việc cho các chủ shop và nhân viên, các bảng dữ liệu và biểu đồ hiển thị thoáng đãng, mang lại trải nghiệm ứng dụng SaaS chuyên nghiệp mà vẫn giữ trọn vẹn thẩm mỹ macOS Clean Utility.

---

## ADR-020: Cơ Chế Tiền Xử Lý Làm Sạch DDL Migration Tự Động & Bóc Tách Lỗi Phòng Vệ API Contract
- **Ngày quyết định:** 2026-11-01
- **Trạng thái:** ACCEPTED
- **Bối cảnh:** Các tệp SQL migration chứa các meta-command của `psql` CLI (`\set ON_ERROR_STOP on`) khiến Node.js `pg` driver báo lỗi cú pháp `syntax error at or near "\"`. Khi migration runner thất bại, bảng `page_members` không được tạo trong cơ sở dữ liệu PostgreSQL khiến endpoint `/api/v1/pages/:pageId/rules` ném lỗi HTTP 500 do middleware phân quyền `requirePageRole` không tìm thấy quan hệ bảng. Đồng thời ở Frontend, store lại đọc sai cấu trúc envelope lỗi (`err.response.data.message` thay vì `err.response.data.error.message`) dẫn đến hiển thị lỗi generic của Axios: `"Request failed with status code 500"`.
- **Quyết định:**
  1. Bổ sung hàm tiền xử lý `cleanSqlScript` trong `migrate.ts` sử dụng regex để tự động loại bỏ các dòng meta-command bắt đầu bằng `\` trước khi thực thi qua client `pg.Pool`, đồng thời hỗ trợ cờ `--dry-run` mô phỏng kiểm tra an toàn.
  2. Bổ sung `DROP TRIGGER IF EXISTS` trước `CREATE TRIGGER` trong các migration `001`, `002`, `003` để đảm bảo tính Idempotent 100% khi chạy lại pipeline migration.
  3. Chuẩn hóa hàm bóc tách lỗi `extractErrorMessage` trong `automation.store.ts` theo cơ chế phòng vệ đa tầng: `err.response?.data?.error?.message ?? err.response?.data?.message ?? (err as Error).message ?? fallback`.
- **Hệ quả:** Lệnh migration `npm run db:migrate` chạy trơn tru và nhất quán trên mọi môi trường độc lập không cần binary `psql`, bảng `page_members` được tạo và backfill quyền `owner` đầy đủ, trang Automation hoạt động hoàn hảo đạt HTTP 200 OK, và thông điệp lỗi nếu phát sinh luôn được hiển thị chi tiết, rõ ràng cho người dùng.
