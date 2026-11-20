# Spec Delta

## Purpose

Cung cấp tính năng quản lý hộp thư tập trung, cho phép tiếp nhận tin nhắn từ nhiều Fanpage theo thời gian thực và phát chuông "ting" thông báo khi có tin nhắn mới từ khách hàng.

## ADDED Requirements

### Requirement: Tự động phát âm thanh chuông "ting" khi có tin nhắn mới từ khách hàng
Hệ thống SHALL tự động kích hoạt âm thanh chuông báo "ting" khi tiếp nhận sự kiện tin nhắn mới gửi từ khách hàng thông qua kênh kết nối thời gian thực.

#### Scenario: Khách hàng gửi tin nhắn mới
- **WHEN** client tiếp nhận sự kiện tin nhắn mới từ khách hàng (`sender_type === 'customer'`)
- **THEN** hệ thống kích hoạt âm thanh chuông báo "ting" qua Web Audio API

#### Scenario: Shop hoặc nhân viên gửi tin nhắn
- **WHEN** client tiếp nhận sự kiện tin nhắn do nhân viên hoặc trang gửi đi (`sender_type === 'page'`)
- **THEN** hệ thống KHÔNG phát âm thanh chuông báo

### Requirement: Điều tiết tần suất phát âm thanh chống dồn dập (Throttling)
Hệ thống SHALL giới hạn tần suất phát âm thanh thông báo với khoảng cách tối thiểu giữa hai lần phát để tránh hiện tượng âm thanh dồn dập gây chói tai khi khách hàng gửi nhiều tin nhắn liên tiếp.

#### Scenario: Khách hàng gửi nhiều tin nhắn liên tiếp trong khoảng thời gian ngắn
- **WHEN** khách hàng gửi liên tục 3 tin nhắn trong vòng dưới 1.5 giây
- **THEN** hệ thống chỉ phát âm thanh chuông báo ở tin nhắn đầu tiên và bỏ qua âm thanh cho các tin nhắn tiếp theo trong khung thời gian 1.5 giây

### Requirement: Bật và tắt âm thanh thông báo (Mute / Unmute Toggle)
Hệ thống SHALL cho phép người dùng tùy chọn bật hoặc tắt âm thanh thông báo tin nhắn và lưu lại tùy chọn này trên thiết bị người dùng.

#### Scenario: Người dùng tắt chuông thông báo
- **WHEN** người dùng bấm nút tắt chuông thông báo (Mute)
- **THEN** hệ thống lưu trạng thái tắt âm thanh vào bộ nhớ cục bộ (`localStorage`) và không phát bất kỳ âm thanh nào khi có tin nhắn mới

#### Scenario: Người dùng bật lại chuông thông báo
- **WHEN** người dùng bấm nút bật chuông thông báo (Unmute)
- **THEN** hệ thống lưu trạng thái bật âm thanh và kích hoạt phát âm thanh mẫu kiểm tra (audible test tone) ngắn để xác nhận âm thanh hoạt động bình thường

### Requirement: Tự động khởi động âm thanh tương thích chính sách Autoplay của trình duyệt
Hệ thống SHALL tự động kích hoạt hoặc khôi phục trạng thái hoạt động của bộ phát âm thanh (AudioContext unlock) ngay sau tương tác người dùng đầu tiên trên trang.

#### Scenario: Người dùng tương tác lần đầu trên trang
- **WHEN** người dùng thực hiện cú click chuột hoặc phím bấm bất kỳ trên giao diện web
- **THEN** hệ thống tự động kiểm tra và chuyển trạng thái `AudioContext` từ `suspended` sang `running` để sẵn sàng phát âm thanh thông báo
