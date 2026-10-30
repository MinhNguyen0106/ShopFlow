# customer-crm Specification

## Purpose
Cung cấp khả năng quản lý danh bạ khách hàng và khách tiềm năng (CRM Leads) tập trung cho chủ shop và nhân viên CSKH, hỗ trợ tính toán chỉ số LTV, phân loại nhãn tags, tra cứu lịch sử mua hàng và bảng điều khiển trực quan macOS Clean Utility.

## Requirements

### Requirement: Customer Directory Listing and Filtering
Hệ thống SHALL cung cấp API và giao diện hiển thị danh bạ khách hàng có phân trang, hỗ trợ tìm kiếm đa năng theo tên, số điện thoại hoặc Facebook PSID, và lọc khách hàng theo nhãn tags phân loại.

#### Scenario: Search customers by phone number or name
- **WHEN** người dùng nhập từ khóa tìm kiếm (tên khách hàng hoặc số điện thoại) trong ô tìm kiếm
- **THEN** hệ thống lọc danh sách khách hàng khớp với từ khóa và trả về kết quả kèm thông tin phân trang chuẩn

#### Scenario: Filter customers by tags
- **WHEN** người dùng chọn một hoặc nhiều nhãn tags (ví dụ: `Co_SDT`, `Khach_VIP`, `Da_mua_hang`)
- **THEN** hệ thống chỉ hiển thị các khách hàng có chứa các nhãn tags tương ứng trong hồ sơ

#### Scenario: Pagination and sorting by latest interaction or LTV
- **WHEN** người dùng chuyển trang hoặc thay đổi tiêu chí sắp xếp theo `last_interaction_at` hoặc `lifetimeValue`
- **THEN** hệ thống trả về danh sách khách hàng được sắp xếp chính xác theo trang yêu cầu

---

### Requirement: Customer Lifetime Value and Purchase History Summary
Hệ thống SHALL tính toán và tổng hợp các chỉ số tài chính cho từng khách hàng bao gồm tổng chi tiêu tích lũy (`lifetimeValue`), tổng số đơn hàng đã đặt (`totalOrders`), giá trị trung bình mỗi đơn (`aov`), và danh sách lịch sử đơn hàng.

#### Scenario: Fetch customer profile with aggregated order statistics
- **WHEN** người dùng truy vấn thông tin chi tiết một khách hàng theo mã ID
- **THEN** hệ thống trả về thông tin hồ sơ khách hàng kèm số liệu tổng hợp `lifetimeValue`, `totalOrders`, `aov`, và thời điểm tương tác gần nhất

#### Scenario: Fetch customer order history list
- **WHEN** người dùng yêu cầu xem danh sách lịch sử đơn hàng của khách hàng
- **THEN** hệ thống trả về danh sách các đơn hàng của khách hàng được sắp xếp theo thời gian tạo mới nhất, bao gồm mã đơn, trạng thái đơn, trạng thái thanh toán và tổng tiền

---

### Requirement: Customer Tag Management and Profile Update
Hệ thống SHALL cho phép cập nhật thông tin cá nhân khách hàng, thêm nhãn phân loại mới theo cơ chế idempotent tránh trùng lặp, và xóa nhãn tag khỏi hồ sơ khách hàng.

#### Scenario: Add a new tag to customer profile
- **WHEN** người dùng gửi yêu cầu thêm nhãn tag mới (ví dụ: `Khach_VIP`) cho khách hàng
- **THEN** hệ thống cập nhật mảng nhãn tags của khách hàng, đảm bảo không bị trùng lặp nếu nhãn đã tồn tại, và ghi nhận thời điểm cập nhật

#### Scenario: Remove an existing tag from customer profile
- **WHEN** người dùng gửi yêu cầu gỡ bỏ một nhãn tag khỏi hồ sơ khách hàng
- **THEN** hệ thống loại bỏ nhãn đó khỏi danh sách tags của khách hàng và lưu lại thay đổi

#### Scenario: Update customer note or contact details
- **WHEN** người dùng cập nhật thông tin tên, địa chỉ, số điện thoại hoặc ghi chú nội bộ của khách hàng
- **THEN** hệ thống lưu trữ thông tin mới và trả về dữ liệu hồ sơ khách hàng sau khi cập nhật

---

### Requirement: Customer Data Privacy and Role-Based Access Control
Hệ thống SHALL bảo vệ dữ liệu nhận dạng cá nhân (PII), tự động che giấu số điện thoại (`09x***x123`) đối với nhân viên có vai trò `staff`, và chỉ hiển thị đầy đủ số điện thoại cho các vai trò quản trị `owner` hoặc `admin`.

#### Scenario: Staff member accesses customer list or detail
- **WHEN** nhân viên có vai trò `staff` truy vấn danh sách hoặc chi tiết khách hàng
- **THEN** hệ thống che giấu các chữ số giữa của số điện thoại (ví dụ: `098***1234`) trên cả dữ liệu API và giao diện người dùng

#### Scenario: Owner or admin accesses customer full phone number
- **WHEN** chủ sở hữu (`owner`) hoặc quản trị viên (`admin`) truy vấn danh sách hoặc chi tiết khách hàng
- **THEN** hệ thống trả về số điện thoại gốc đầy đủ để phục vụ liên hệ và xử lý đơn hàng

---

### Requirement: macOS Clean Utility CRM Dashboard Interface
Hệ thống SHALL cung cấp giao diện quản trị khách hàng tại tuyến đường `/(dashboard)/customers` theo ngôn ngữ thiết kế macOS Clean Utility Bento Grid, bao gồm các thẻ KPI tổng hợp, bảng dữ liệu tương tác và Drawer trượt chi tiết.

#### Scenario: Viewing CRM executive metrics
- **WHEN** người dùng truy cập màn hình `/customers`
- **THEN** hệ thống hiển thị 4 thẻ Bento số liệu: Tổng khách hàng, Leads có SĐT, Khách VIP và Tổng LTV tích lũy

#### Scenario: Interacting with customer detail drawer
- **WHEN** người dùng bấm vào một dòng khách hàng trên bảng dữ liệu
- **THEN** hệ thống mở ngăn kéo trượt `CustomerDetailDrawer` hiển thị hồ sơ cá nhân, lịch sử đơn hàng, trình quản lý tag nhanh và form ghi chú nội bộ
