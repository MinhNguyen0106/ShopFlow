# Spec Delta

## Purpose

Cung cấp khả năng quản lý trạng thái đọc của hội thoại, tự động đánh dấu đã đọc khi xem tin nhắn, và điều phối huy hiệu thông báo chưa đọc đồng bộ giữa giao diện Live Chat và thanh điều hướng hệ thống.

## ADDED Requirements

### Requirement: Tự động đánh dấu hội thoại đã đọc khi người dùng chọn xem
Hệ thống SHALL tự động chuyển trạng thái của cuộc hội thoại sang đã đọc (unread count bằng 0) ngay khi người dùng nhấn chọn cuộc hội thoại đó trong danh sách Hộp thư Live Chat.

#### Scenario: Người dùng click vào một cuộc hội thoại có tin nhắn chưa đọc
- **WHEN** người dùng nhấn chọn một cuộc hội thoại đang có số lượng tin nhắn chưa đọc lớn hơn 0
- **THEN** hệ thống đặt lại số lượng tin nhắn chưa đọc của cuộc hội thoại đó về 0 và đồng bộ trạng thái đã đọc xuống cơ sở dữ liệu

#### Scenario: Người dùng click vào cuộc hội thoại đã đọc sẵn
- **WHEN** người dùng nhấn chọn một cuộc hội thoại đã có số lượng tin nhắn chưa đọc bằng 0
- **THEN** hệ thống duy trì số lượng tin nhắn chưa đọc bằng 0 mà không phát sinh lỗi hoặc ghi nhận trùng lặp

### Requirement: Ẩn huy hiệu số lượng tin chưa đọc trên từng cuộc hội thoại
Hệ thống SHALL ẩn ngay lập tức chấm báo số tin chưa đọc (unread counter pill) và chuyển đổi định dạng hiển thị tên khách hàng cùng tin nhắn cuối từ in đậm sang bình thường khi cuộc hội thoại được đánh dấu đã đọc.

#### Scenario: Hội thoại chuyển từ chưa đọc sang đã đọc
- **WHEN** một cuộc hội thoại được chuyển trạng thái sang đã đọc
- **THEN** giao diện danh sách hội thoại loại bỏ chấm báo số tin chưa đọc và hiển thị tiêu đề cùng nội dung tin nhắn dưới dạng văn bản thường

### Requirement: Tự động cập nhật tổng số tin chưa đọc ở bộ lọc kênh
Hệ thống SHALL tự động tính toán lại tổng số tin nhắn chưa đọc trên toàn bộ các kênh và cập nhật nhãn số lượng tin mới ngay khi có cuộc hội thoại được đánh dấu đã đọc.

#### Scenario: Giảm số lượng tin chưa đọc tổng sau khi xem hội thoại
- **WHEN** người dùng đánh dấu đã đọc một cuộc hội thoại có 3 tin nhắn chưa đọc
- **THEN** nhãn tổng số tin chưa đọc tại cột bộ lọc kênh giảm đúng 3 đơn vị và tự động ẩn khi tổng số chưa đọc bằng 0

### Requirement: Hiển thị số lượng tin chưa đọc động trên thanh điều hướng hệ thống
Hệ thống SHALL hiển thị huy hiệu số lượng tin nhắn chưa đọc trên mục menu Hộp thư Live Chat của thanh điều hướng Sidebar theo dữ liệu thực tế thay vì giá trị cố định, và ẩn hoàn toàn khi không có tin nhắn chưa đọc.

#### Scenario: Không có tin nhắn chưa đọc trong hệ thống
- **WHEN** tổng số tin nhắn chưa đọc của toàn bộ các cuộc hội thoại bằng 0
- **THEN** mục menu Hộp thư Live Chat trên Sidebar không hiển thị bất kỳ huy hiệu hay số đếm nào

#### Scenario: Có tin nhắn chưa đọc từ khách hàng
- **WHEN** có ít nhất một cuộc hội thoại chứa tin nhắn chưa đọc
- **THEN** mục menu Hộp thư Live Chat trên Sidebar hiển thị huy hiệu với con số tương ứng chính xác tổng số tin chưa đọc
