# Spec Delta: system-settings

## MODIFIED Requirements

### Requirement: macOS Clean Utility Settings UI Layout
Giao diện Cài đặt SHALL tuân thủ thiết kế macOS Clean Utility với thanh Segmented Tabs, chuyển đổi mượt mà và đồng bộ dữ liệu qua Zustand store.

#### Scenario: Chuyển đổi giữa các phân hệ cài đặt
- **WHEN** Người dùng nhấn chọn giữa các Tab `ProfileSettingsTab`, `SecurityPasswordTab`, `ApiLimitsMonitorTab`, hoặc `SystemHealthTab`
- **THEN** Giao diện chuyển đổi nội dung tương ứng ngay lập tức không cần tải lại trang và giữ nguyên trạng thái form chưa lưu nếu có

## ADDED Requirements

### Requirement: Infrastructure Telemetry and Realtime Health Metrics Dashboard
Hệ thống SHALL hiển thị bảng điều khiển chỉ số sức khỏe hạ tầng thời gian thực trên giao diện Cài đặt hệ thống, cho phép theo dõi tài nguyên và kiểm tra kết nối cảnh báo khẩn cấp.

#### Scenario: Quản trị viên xem bảng điều khiển sức khỏe hạ tầng
- **WHEN** Quản trị viên truy cập tab `SystemHealthTab` trên màn hình Cài đặt hệ thống
- **THEN** Giao diện hiển thị trực quan trạng thái kết nối PostgreSQL (active/idle/waiting pool), mức tiêu thụ RAM Redis, số lượng job trong các queues của BullMQ, thời gian uptime máy chủ và trạng thái kênh cảnh báo Telegram

#### Scenario: Gửi thông báo thử nghiệm tới Telegram
- **WHEN** Quản trị viên nhấn nút "Gửi cảnh báo thử nghiệm" (Test Alert) trên giao diện Cài đặt
- **THEN** Hệ thống gửi một tin nhắn mẫu tới Telegram Bot và hiển thị thông báo kết quả thành công hoặc mã lỗi chi tiết trên giao diện
