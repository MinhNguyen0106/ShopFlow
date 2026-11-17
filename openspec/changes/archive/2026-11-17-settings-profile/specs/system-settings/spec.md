# Spec Delta

## Purpose

Cung cấp trung tâm cấu hình tài khoản người dùng, đổi mật khẩu bảo mật và giám sát kỹ thuật thời gian thực đối với hạn ngạch Meta Graph API v19.0 cùng sức khỏe hệ sinh thái Webhook và Redis.

## ADDED Requirements

### Requirement: User Profile Retrieval and Management
Hệ thống SHALL cho phép người dùng đã xác thực xem và cập nhật thông tin hồ sơ tài khoản cá nhân.

#### Scenario: Xem hồ sơ cá nhân thành công
- **WHEN** Người dùng gửi yêu cầu `GET /api/v1/settings/profile` với JWT token hợp lệ
- **THEN** Hệ thống trả về HTTP 200 kèm thông tin người dùng bao gồm `id`, `email`, `fullName`, `role`, `status`, `createdAt`, và các thuộc tính cấu hình bổ sung (`phone`, `brandName`, `timezone`)

#### Scenario: Cập nhật thông tin hồ sơ hợp lệ
- **WHEN** Người dùng gửi `PUT /api/v1/settings/profile` với dữ liệu `fullName` hợp lệ
- **THEN** Hệ thống cập nhật bản ghi trong cơ sở dữ liệu, ghi nhận `updatedAt` mới và trả về HTTP 200 kèm thông tin cập nhật

#### Scenario: Cập nhật hồ sơ với dữ liệu không hợp lệ
- **WHEN** Người dùng gửi `PUT /api/v1/settings/profile` với `fullName` rỗng
- **THEN** Hệ thống từ chối cập nhật và trả về HTTP 400 kèm thông điệp lỗi validation chi tiết

### Requirement: Secure Password Change
Hệ thống SHALL cung cấp cơ chế đổi mật khẩu an toàn với xác thực mật khẩu hiện tại và kiểm tra độ phức tạp của mật khẩu mới.

#### Scenario: Đổi mật khẩu thành công
- **WHEN** Người dùng gửi `PUT /api/v1/settings/password` kèm `currentPassword` chính xác và `newPassword` đạt độ phức tạp yêu cầu (tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt)
- **THEN** Hệ thống băm mật khẩu mới bằng Bcrypt (12 salt rounds), lưu vào `password_hash`, cập nhật `updatedAt` và trả về HTTP 200

#### Scenario: Đổi mật khẩu với mật khẩu hiện tại không chính xác
- **WHEN** Người dùng gửi `PUT /api/v1/settings/password` với `currentPassword` sai
- **THEN** Hệ thống trả về HTTP 400 kèm thông báo mật khẩu hiện tại không đúng

#### Scenario: Mật khẩu mới trùng với mật khẩu cũ hoặc không đủ mạnh
- **WHEN** Người dùng gửi `newPassword` trùng khớp với `currentPassword` hoặc ít hơn 8 ký tự
- **THEN** Hệ thống từ chối và trả về HTTP 400 kèm hướng dẫn tiêu chuẩn mật khẩu an toàn

### Requirement: Meta Graph API Rate Limits Monitoring
Hệ thống SHALL cung cấp số liệu giám sát hạn ngạch cuộc gọi Meta Graph API thời gian thực để ngăn ngừa lỗi Meta Error 613 Rate Limit.

#### Scenario: Lấy thông tin giám sát hạn ngạch Meta API
- **WHEN** Người dùng gửi yêu cầu `GET /api/v1/settings/meta-limits`
- **THEN** Hệ thống trả về dữ liệu giám sát bao gồm số cuộc gọi đã dùng trong ngày, hạn mức tối đa (4,800 cuộc gọi/24h), tỷ lệ % tiêu thụ, tốc độ gọi API tức thời (calls/phút), trạng thái an toàn (`safe`/`warning`/`exceeded`), và thời hạn token của các Fanpage liên kết

### Requirement: Webhook and Infrastructure Health Status
Hệ thống SHALL giám sát và hiển thị trạng thái hoạt động của cơ chế xác thực Webhook HMAC-SHA256, hàng đợi BullMQ và Redis Cache.

#### Scenario: Kiểm tra tình trạng hạ tầng và Webhook
- **WHEN** Người dùng truy cập phân hệ giám sát kỹ thuật trên giao diện Cài đặt
- **THEN** Hệ thống hiển thị trạng thái chữ ký Webhook `x-hub-signature-256`, độ trễ xử lý sự kiện trung bình, trạng thái Redis Idempotency Key (TTL 24h) và thời gian phản hồi máy chủ

### Requirement: macOS Clean Utility Settings UI Layout
Giao diện Cài đặt SHALL tuân thủ thiết kế macOS Clean Utility với thanh Segmented Tabs, chuyển đổi mượt mà và đồng bộ dữ liệu qua Zustand store.

#### Scenario: Chuyển đổi giữa các phân hệ cài đặt
- **WHEN** Người dùng nhấn chọn giữa các Tab `ProfileSettingsTab`, `SecurityPasswordTab`, `ApiLimitsMonitorTab`
- **THEN** Giao diện chuyển đổi nội dung tương ứng ngay lập tức không cần tải lại trang và giữ nguyên trạng thái form chưa lưu nếu có
