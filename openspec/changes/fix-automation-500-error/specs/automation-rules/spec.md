# Spec Delta: automation-rules

## MODIFIED Requirements

### Requirement: Automation Rules List & Page Selection
Hệ thống SHALL hiển thị danh sách toàn bộ các kịch bản tự động hóa của Fanpage đang được chọn dưới dạng lưới thẻ Bento trực quan, bao gồm tên kịch bản, danh sách từ khóa kích hoạt, mẫu phản hồi bình luận, mẫu tin nhắn riêng, cờ ẩn SĐT, công tắc bật/tắt nhanh, và cơ chế xử lý lỗi phòng vệ hiển thị thông báo chính xác từ Backend API.

#### Scenario: Displaying rules for selected fanpage
- **WHEN** người dùng truy cập màn hình `/automation` và đã chọn một Fanpage hợp lệ
- **THEN** hệ thống tải và hiển thị danh sách các quy tắc tự động hóa tương ứng của Fanpage đó cùng trạng thái hoạt động hiện tại

#### Scenario: Empty state when no rules exist
- **WHEN** Fanpage được chọn chưa có bất kỳ quy tắc tự động hóa nào
- **THEN** hệ thống hiển thị giao diện trạng thái trống (Empty State) kèm nút kêu gọi hành động (CTA) "Tạo kịch bản đầu tiên"

#### Scenario: Graceful defensive error handling on API response failure
- **WHEN** API gọi đến `/api/v1/pages/:pageId/rules` trả về lỗi HTTP 4xx hoặc 5xx theo chuẩn envelope `{ success: false, error: { message, code } }`
- **THEN** store của trang tự động bóc tách thông báo lỗi chi tiết từ `error.message` và hiển thị trực quan lên banner cảnh báo, thay vì chỉ hiển thị chuỗi lỗi mặc định generic của thư viện HTTP client.
