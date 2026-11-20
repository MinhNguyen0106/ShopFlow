# Tasks

## 1. Cấu Hình & Prometheus Metrics Engine (Backend)

- [x] 1.1 Cài đặt thư viện `prom-client`, mở rộng `backend/src/config/env.ts` tiếp nhận các biến môi trường `METRICS_AUTH_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ALERT_ENABLED` và xác minh bằng Zod schema test trong `env.test.ts`.
- [x] 1.2 Xây dựng `MetricsService` trong `backend/src/infrastructure/monitoring/metrics.service.ts` quản lý Registry chuẩn Prometheus, kích hoạt default metrics và các Custom Gauges cho PostgreSQL Connection Pool và BullMQ Queues; xác minh bằng unit test trong `metrics.service.test.ts`.
- [x] 1.3 Xây dựng `metricsMiddleware` trong `backend/src/api/middlewares/metrics.middleware.ts` theo dõi HTTP latency/status và đăng ký route `GET /metrics` kèm cơ chế bảo mật xác thực token; xác minh bằng integration test trong `metrics.routes.test.ts`.

## 2. Dịch Vụ Cảnh Báo Sự Cố Tự Động (Automated Alerting Engine)

- [x] 2.1 Xây dựng `AlertService` trong `backend/src/core/services/alert.service.ts` kết nối Telegram Bot Webhook, định dạng tin nhắn Markdown theo cấp độ (`CRITICAL`, `WARNING`, `INFO`), và triển khai cơ chế chống bão thông báo (throttle 5 phút); xác minh bằng unit test trong `alert.service.test.ts`.
- [x] 2.2 Tích hợp `AlertService` vào Express Global Error Handler, BullMQ Queue Worker Error Listener và bộ xử lý lỗi Meta Rate Limit (Error 613 / 80001); xác minh bằng ca kiểm thử phát hiện lỗi kích hoạt gửi alert.

## 3. REST APIs Sức Khỏe Hạ Tầng & Giao Diện Người Dùng (Frontend UI)

- [x] 3.1 Bổ sung các endpoint `GET /api/v1/system/health-stats` và `POST /api/v1/system/test-alert` trong `SystemController` và `system.routes.ts`; xác minh bằng integration test Supertest.
- [x] 3.2 Mở rộng Zustand store `frontend/src/lib/settings.store.ts` bổ sung state `healthStats`, action `fetchHealthStats()` và `sendTestAlert()`; xác minh bằng unit test trong `settings.store.test.ts`.
- [x] 3.3 Xây dựng component `SystemHealthTab` trong `frontend/src/components/settings/system-health-tab.tsx` và gắn vào thanh chuyển Tab của trang `frontend/src/app/(dashboard)/settings/page.tsx` với thiết kế Bento Grid hiển thị tình trạng DB Pool, Redis, BullMQ và nút bấm Test Alert Telegram; xác minh bằng component test trong `settings-page.test.tsx`.

## 4. Thẩm Định Toàn Diện & Quality Gates

- [x] 4.1 Chạy toàn bộ test suites liên quan của backend (`npm test --workspace=backend -- metrics`) và frontend (`npm test --workspace=frontend -- settings`), đảm bảo 100% tests PASSED.
- [x] 4.2 Chạy `npm run type-check` và `npm run memory:check`, đảm bảo 0 lỗi kiểu dữ liệu và bộ ba bộ nhớ (.agents/memory/) hoàn toàn nhất quán.
