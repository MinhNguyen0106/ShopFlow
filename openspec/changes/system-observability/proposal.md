# Proposal: Hệ Thống Giám Sát, Đo Lường Chỉ Số & Cảnh Báo Sự Cố Tự Động (Sprint 7 - TASK-30)

## Why

Khi nền tảng ShopFlow bước vào giai đoạn mở rộng vận hành thực tế (Sprint 7) với hàng loạt Fanpage kết nối, hàng nghìn webhook đổ về mỗi ngày và nhiều hàng đợi BullMQ xử lý tác vụ nền, việc thiếu một hệ thống quan trắc (Observability) và đo lường chỉ số tập trung sẽ khiến đội ngũ kỹ thuật bị động trước các sự cố nghiêm trọng: nghẽn kết nối Database Pool, dồn ứ hàng đợi BullMQ, chạm trần hạn ngạch Meta Graph API (Rate Limit 613), hoặc lỗi HTTP 5xx tăng đột biến. Việc triển khai hệ thống xuất chỉ số chuẩn Prometheus kết hợp cơ chế cảnh báo thời gian thực qua Telegram Webhook và bảng điều khiển System Health Dashboard là bước đi then chốt nhằm đảm bảo tính sẵn sàng cao (High Availability), độ tin cậy và khả năng phát hiện - xử lý sự cố tức thì.

## What Changes

- **Prometheus Metrics Engine & Endpoint (`/metrics`):**
  - Tích hợp thư viện chuẩn `prom-client` vào Express backend để tự động thu thập các số liệu vận hành:
    - **HTTP Metrics:** Số lượng request (`http_requests_total`), thời gian phản hồi theo phân vị (`http_request_duration_seconds` histogram).
    - **Database Pool Metrics:** Kết nối đang bận (`db_pool_active_connections`), kết nối rảnh (`db_pool_idle_connections`), số truy vấn chờ (`db_pool_waiting_requests`).
    - **BullMQ Queue Metrics:** Số lượng job chờ (`bullmq_queue_waiting_jobs`), job đang chạy (`bullmq_queue_active_jobs`), job thất bại (`bullmq_queue_failed_jobs`).
    - **System Runtime:** Mức sử dụng bộ nhớ heap (`nodejs_heap_size_used_bytes`), tải CPU, event loop lag.
  - Endpoint `GET /metrics` xuất định dạng chuẩn Prometheus, hỗ trợ bảo mật qua API key hoặc basic auth (`METRICS_AUTH_TOKEN`).
- **Hệ Thống Cảnh Báo Sự Cố Tự Động (Automated Alerting Engine):**
  - Xây dựng `AlertService` tự động phát hiện và gửi thông báo khẩn cấp tới kênh Telegram Bot Webhook (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) khi:
    - Phát sinh lỗi máy chủ nghiêm trọng (HTTP 500/502/503 liên tục).
    - Lỗi Meta Graph API Rate Limit (Error 613 / 80001) hoặc Page Token hết hạn/bị hủy (Error 190).
    - Hàng đợi BullMQ bị dồn ứ (queue waiting > 100 jobs) hoặc có job rơi vào Dead Letter Queue (DLQ).
    - Database connection pool bị quá tải hoặc timeout.
  - Cơ chế chống bão thông báo (Alert Deduplication / Throttling): Tự động gom cụm lỗi tương tự nhau trong khoảng thời gian 5 phút để tránh spam kênh cảnh báo.
- **Bảng Điều Khiển Sức Khỏe Hệ Thống (System Health & Observability Dashboard):**
  - Mở rộng giao diện Cài đặt `/settings` (Tab "Sức khỏe Hệ thống" / System Health Tab) hoặc trang `/system-metrics` dành cho Quản trị viên:
    - Hiển thị thời gian thực (realtime gauges) tình trạng PostgreSQL Connection Pool, Redis RAM, trạng thái các queues của BullMQ (`webhook-queue`, `scheduler-queue`, `reply-queue`).
    - Bảng nhật ký sự cố gần đây (Recent Incidents Log).
    - Nút gửi thông báo thử nghiệm (Test Alert Notification) để kiểm tra kết nối tới Telegram Bot.

## Capabilities

### New Capabilities
- `system-observability`: Khung kiến trúc quan trắc và đo lường chỉ số toàn diện, bao gồm thu thập metrics chuẩn Prometheus, endpoint `/metrics` bảo mật, bộ phân tích cảnh báo sự cố khẩn cấp qua Telegram Webhook và giao diện giám sát sức khỏe hạ tầng thời gian thực.

### Modified Capabilities
- `system-settings`: Bổ sung thêm tab hiển thị chỉ số sức khỏe hạ tầng thời gian thực (System Health & Observability) và cấu hình cảnh báo Telegram vào trang Cài đặt hệ thống.

## Impact

- **Backend Express:**
  - Bổ sung package `prom-client`.
  - Thêm middleware `metrics.middleware.ts` theo dõi latency và request status.
  - Thêm route `GET /metrics` và route API `GET /api/v1/system/health-stats`.
  - Triển khai `AlertService` (`alert.service.ts`) kết nối Telegram Bot API.
- **Frontend Next.js:**
  - Bổ sung tab `SystemHealthTab` vào trang `(dashboard)/settings`.
  - Cập nhật Zustand store `settings.store.ts` hỗ trợ tải chỉ số sức khỏe hạ tầng và gửi cảnh báo test.
- **Hạ tầng & Triển khai:**
  - Bổ sung biến môi trường: `METRICS_AUTH_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ALERT_ENABLED`.
