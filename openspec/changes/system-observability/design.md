# Design: Kiến Trúc Quan Trắc Hệ Thống (Prometheus Metrics, Alerting Engine & Health Dashboard)

## Context

Xem [proposal.md](proposal.md) để biết bối cảnh và lý do thay đổi.

Hệ thống ShopFlow hiện tại:
- Chạy backend Express.js trên Node.js 20 LTS kết nối cơ sở dữ liệu PostgreSQL (`pg.Pool`), Redis cache và hàng loạt hàng đợi BullMQ (`webhook-queue`, `scheduler-queue`, `reply-queue`).
- Đã có cấu hình Docker Production 5 containers (`docker-compose.prod.yml`) và CI/CD tự động qua GitHub Actions.
- Tuy nhiên, hiện tại hệ thống chưa có công cụ đo lường tài nguyên và hiệu năng ứng dụng theo chuẩn APM (Application Performance Monitoring). Khi có lỗi nghiêm trọng như Meta Rate Limit 613, tắc nghẽn hàng đợi hoặc crash kết nối cơ sở dữ liệu, quản trị viên chỉ phát hiện khi người dùng phản hồi hoặc kiểm tra log thủ công.

## Goals / Non-Goals

**Goals:**
- Tích hợp thư viện chuẩn công nghiệp `prom-client` thu thập các chỉ số đo lường hiệu năng HTTP (throughput, latency buckets, error rate), tài nguyên hệ thống (CPU, RAM heap), trạng thái kết nối PostgreSQL Pool và số lượng job trong BullMQ Queues.
- Cung cấp endpoint `GET /metrics` xuất dữ liệu định dạng chuẩn Prometheus (hỗ trợ bảo mật qua secret token `METRICS_AUTH_TOKEN`).
- Xây dựng `AlertService` gửi cảnh báo sự cố khẩn cấp tức thì tới kênh Telegram Bot Webhook (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) khi xảy ra lỗi 5xx hàng loạt, dính Meta Error 613 hoặc job thất bại trong BullMQ.
- Xây dựng cơ chế chống bão cảnh báo (Alert Deduplication & Throttling) trong chu kỳ 5 phút.
- Mở rộng giao diện Cài đặt tại Frontend với tab `SystemHealthTab` hiển thị bảng điều khiển sức khỏe hạ tầng thời gian thực và cho phép gửi cảnh báo thử nghiệm.

**Non-Goals:**
- Không đóng gói kèm một cụm máy chủ Prometheus Server hay Grafana nội bộ bên trong mã nguồn ShopFlow (endpoint `/metrics` được thiết kế tương thích hoàn hảo để tích hợp với bất kỳ hệ thống Prometheus, Grafana Cloud, Datadog hoặc VictoriaMetrics bên ngoài).
- Không lưu trữ lịch sử metrics dài hạn trong PostgreSQL (việc lưu trữ Time-Series dữ liệu thuộc trách nhiệm của Prometheus Scraper chuyên dụng).

## Decisions

### 1. prom-client Native vs express-prom-bundle
- **Lựa chọn:** Tích hợp trực tiếp thư viện `prom-client` native kết hợp với middleware tùy biến `metrics.middleware.ts`.
- **Lý do lựa chọn:**
  - `express-prom-bundle` có xu hướng tạo ra quá nhiều metric labels khi các route chứa URL parameter động (high cardinality risk), dễ gây phình bộ nhớ RAM (memory leak).
  - Sử dụng `prom-client` native cho phép chuẩn hóa route path (ví dụ: gộp `/inbox/conversations/:id` thành một pattern chung), đồng thời dễ dàng đăng ký thêm các custom Gauge đo lường nội bộ cho PostgreSQL Pool và BullMQ.
- **Danh mục Metrics Thu Thập:**
  - `http_requests_total`: Counter (labels: `method`, `route`, `status_code`).
  - `http_request_duration_seconds`: Histogram (buckets: `0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10`).
  - `db_pool_connections`: Gauge (labels: `state` = `active` | `idle` | `waiting`).
  - `bullmq_queue_jobs`: Gauge (labels: `queue_name`, `status` = `waiting` | `active` | `failed` | `delayed`).
  - `promClient.collectDefaultMetrics()`: Tự động thu thập heap size, CPU usage, event loop lag.

### 2. Kênh Cảnh Báo Khẩn Cấp Qua Telegram Bot API
- **Lựa chọn:** Xây dựng `AlertService` tích hợp Telegram Bot Webhook (`https://api.telegram.org/bot<TOKEN>/sendMessage`).
- **Lý do lựa chọn:**
  - Telegram Bot API hoàn toàn miễn phí, phản hồi tức thì (< 1s), hỗ trợ định dạng Markdown và có ứng dụng đa nền tảng (iOS, Android, macOS, Windows).
  - Không yêu cầu cài đặt phần mềm giám sát cồng kềnh, giúp chủ shop và đội ngũ kỹ thuật nhận thông báo khẩn cấp ngay trên điện thoại khi đang di chuyển.
- **Định Dạng Tin Nhắn Cảnh Báo Chuẩn:**
  ```text
  🚨 [SHOPFLOW CRITICAL ALERT]
  Loại sự cố: Meta Graph API Rate Limit (Error 613)
  Môi trường: Production
  Thời gian: 2026-11-20 20:30:00
  Chi tiết: Fanpage "Shop Áo Thun" đã chạm trần 4,800 calls/24h. Tác vụ đăng bài tạm dừng 30 phút.
  ```

### 3. Cơ Chế Chống Bão Cảnh Báo (Alert Throttling & Deduplication)
- **Lựa chọn:** Quản lý hàng đợi cooldown bằng `Map<string, number>` trong bộ nhớ của `AlertService`.
- **Cơ chế hoạt động:**
  - Khi một sự cố phát sinh, tạo khóa `alertKey = `${category}:${errorCode}`.
  - Nếu `Date.now() - lastSentTime < 5 phút` (300,000ms), sự cố được tăng biến đếm `suppressedCount++` và bỏ qua việc gửi tin nhắn mới.
  - Sau khi hết thời gian cooldown 5 phút, nếu vẫn còn lỗi phát sinh, gửi tin nhắn cập nhật kèm số lượng lần đã bị dồn nén.

### 4. Giao Diện Người Dùng & Đồng Bộ State Frontend
- **Giao diện:** Bổ sung tab `SystemHealthTab` vào trang Cài đặt `frontend/src/app/(dashboard)/settings/page.tsx` với thiết kế Bento Grid:
  - Card 1: Tổng quan trạng thái hạ tầng (Database, Redis, BullMQ).
  - Card 2: Biểu đồ thời gian thực về tải HTTP và thời gian phản hồi máy chủ.
  - Card 3: Cấu hình thông báo Telegram và nút "Gửi cảnh báo thử nghiệm".
- **Store & API:** Bổ sung vào `frontend/src/lib/settings.store.ts` các phương thức `fetchHealthStats()` và `sendTestAlert()`.

## Risks / Trade-offs

- **[Rủi ro] Lộ dữ liệu vận hành qua endpoint `/metrics`:**
  - *Giải pháp:* Bảo vệ endpoint `/metrics` bằng header `Authorization: Bearer <METRICS_AUTH_TOKEN>` hoặc truy vấn secret token. Nếu biến môi trường `METRICS_AUTH_TOKEN` được thiết lập, mọi yêu cầu không mang token hợp lệ đều bị từ chối với HTTP 401.
- **[Rủi ro] Telegram Bot bị chặn mạng hoặc token không hợp lệ gây crash ứng dụng:**
  - *Giải pháp:* Bọc toàn bộ các lệnh gọi Telegram Bot API trong `try/catch` có logging an toàn (không log token), không rethrow lỗi ra ngoài làm ảnh hưởng tới luồng xử lý chính của người dùng.
- **[Rủi ro] Tải thêm tài nguyên khi đo lường metrics liên tục:**
  - *Giải pháp:* `prom-client` hoạt động cực nhanh trong RAM; các custom metrics cho DB Pool và BullMQ chỉ được cập nhật định kỳ (chu kỳ 15 giây) hoặc khi scraper gửi request tới `/metrics`.
