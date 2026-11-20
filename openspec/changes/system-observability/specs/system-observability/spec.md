# Spec Delta: system-observability

## Purpose

Cung cấp khung kiến trúc quan trắc toàn diện, thu thập và xuất các chỉ số vận hành chuẩn Prometheus qua endpoint /metrics, đồng thời tự động cảnh báo sự cố máy chủ và giới hạn API thời gian thực qua Telegram Bot Webhook.

## ADDED Requirements

### Requirement: Prometheus Metrics Collection and /metrics Endpoint
Hệ thống SHALL thu thập các chỉ số thời gian thực về HTTP request, Database connection pool, hàng đợi BullMQ, và Node.js runtime, đồng thời xuất dữ liệu qua endpoint `GET /metrics` theo định dạng chuẩn Prometheus.

#### Scenario: Truy cập endpoint /metrics thành công
- **WHEN** Hệ thống giám sát (Prometheus scraper) hoặc quản trị viên gửi yêu cầu `GET /metrics` kèm token xác thực hợp lệ trong header
- **THEN** Hệ thống phản hồi HTTP 200 với `Content-Type: text/plain; version=0.0.4` chứa đầy đủ các chỉ số `http_requests_total`, `http_request_duration_seconds`, `db_pool_active_connections`, `db_pool_idle_connections`, `bullmq_queue_waiting_jobs`, và `nodejs_heap_size_used_bytes`

#### Scenario: Truy cập endpoint /metrics không có xác thực hợp lệ
- **WHEN** Yêu cầu `GET /metrics` được gửi đến nhưng thiếu hoặc sai token xác thực bí mật (`METRICS_AUTH_TOKEN`) khi chế độ bảo mật được kích hoạt
- **THEN** Hệ thống từ chối truy cập và trả về mã lỗi HTTP 401 Unauthorized

### Requirement: Automated Emergency Alerting via Telegram Bot Webhook
Hệ thống SHALL tự động phát hiện và gửi thông báo khẩn cấp tới kênh Telegram Bot Webhook khi phát sinh sự cố máy chủ hoặc bất thường vận hành nghiêm trọng.

#### Scenario: Phát sinh lỗi máy chủ HTTP 5xx liên tục
- **WHEN** Hệ thống ghi nhận tỷ lệ lỗi HTTP 5xx vượt quá 5 lỗi trong vòng 1 phút
- **THEN** Bộ dịch vụ cảnh báo `AlertService` lập tức gửi tin nhắn định dạng Markdown tới Telegram Chat ID cấu hình, nêu rõ endpoint, mã lỗi, thời gian và stack trace tóm tắt

#### Scenario: Phát hiện lỗi Meta Graph API Rate Limit (Error 613)
- **WHEN** Tác vụ gửi tin nhắn, đăng bài hoặc phản hồi bình luận nhận mã lỗi 613 hoặc 80001 từ Meta Graph API
- **THEN** Hệ thống lập tức kích hoạt cảnh báo Telegram cấp độ `CRITICAL` kèm thông tin Fanpage bị giới hạn và thời gian tạm dừng tự động

#### Scenario: Hàng đợi BullMQ bị dồn ứ hoặc job rơi vào Dead Letter Queue
- **WHEN** Một job trong BullMQ queue thất bại quá số lần thử lại tối đa (dính DLQ) hoặc số lượng job chờ vượt quá 100
- **THEN** Hệ thống gửi cảnh báo Telegram cấp độ `WARNING` chứa tên hàng đợi, tên job và lý do thất bại

### Requirement: Alert Throttling and Deduplication
Hệ thống SHALL áp dụng cơ chế chống bão thông báo (throttling) để không spam kênh cảnh báo khi có sự cố lặp lại liên tiếp.

#### Scenario: Nhiều lỗi cùng loại xuất hiện trong thời gian ngắn
- **WHEN** Lỗi máy chủ hoặc cảnh báo cùng mã phát sinh liên tiếp trong khoảng thời gian dưới 5 phút
- **THEN** Hệ thống chỉ gửi thông báo đầu tiên và gom số lượng lần xuất hiện để gửi báo cáo tổng hợp sau khi hết chu kỳ throttle
