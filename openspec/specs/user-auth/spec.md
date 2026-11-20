# user-auth Specification

## Purpose
Quản lý xác thực người dùng, thời hạn phiên làm việc linh hoạt (1 ngày hoặc 30 ngày) theo tuỳ chọn Remember Me, và thu hồi tức thì token khi đăng xuất trên máy chủ ShopFlow.

## Requirements

### Requirement: Cấp phát token động theo trạng thái ghi nhớ đăng nhập
Hệ thống SHALL cấp phát Access Token và Refresh Token với thời hạn 1 ngày khi người dùng không chọn ghi nhớ, hoặc 30 ngày khi người dùng chọn ghi nhớ phiên đăng nhập.

#### Scenario: Đăng nhập không tích chọn ghi nhớ phiên
- **WHEN** Người dùng gửi yêu cầu đăng nhập thành công với `rememberMe = false` hoặc không truyền `rememberMe`
- **THEN** Hệ thống trả về Access Token và Refresh Token có thời hạn hiệu lực là 24 giờ (1 ngày)

#### Scenario: Đăng nhập có tích chọn ghi nhớ phiên
- **WHEN** Người dùng gửi yêu cầu đăng nhập thành công với `rememberMe = true`
- **THEN** Hệ thống trả về Access Token và Refresh Token có thời hạn hiệu lực là 30 ngày

### Requirement: Thu hồi và vô hiệu hóa token khi đăng xuất
Hệ thống SHALL cung cấp endpoint đăng xuất để đưa access token hiện tại vào danh sách đen trên máy chủ và từ chối mọi yêu cầu tiếp theo sử dụng token đó.

#### Scenario: Đăng xuất tài khoản thành công
- **WHEN** Người dùng gửi yêu cầu `POST /api/v1/auth/logout` kèm Bearer Access Token hợp lệ
- **THEN** Hệ thống ghi nhận token vào danh sách đen trên Redis với thời gian hết hạn tương ứng thời hạn còn lại của token và trả về HTTP 200 OK

#### Scenario: Sử dụng token đã bị thu hồi sau đăng xuất
- **WHEN** Người dùng hoặc kẻ tấn công sử dụng access token đã bị đưa vào danh sách đen để truy cập tài nguyên bảo vệ
- **THEN** Hệ thống từ chối yêu cầu với mã lỗi HTTP 401 Unauthorized và thông báo phiên đăng nhập đã bị vô hiệu hóa

### Requirement: Tự động làm sạch phiên đăng nhập trên giao diện
Giao diện người dùng SHALL xóa sạch toàn bộ token và thông tin phiên làm việc cục bộ ngay khi đăng xuất hoặc khi token hết hạn.

#### Scenario: Hoàn tất đăng xuất trên trình duyệt
- **WHEN** Người dùng nhấn nút Đăng xuất trên giao diện ShopFlow
- **THEN** Ứng dụng gọi API đăng xuất lên máy chủ, xóa toàn bộ khóa lưu trữ trong `localStorage` và điều hướng về trang `/login`
