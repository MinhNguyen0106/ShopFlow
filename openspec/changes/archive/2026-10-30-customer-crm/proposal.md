# Proposal: customer-crm

## Why

Hiện tại, ShopFlow đã hỗ trợ tự động thu thập thông tin khách hàng từ bình luận (ẩn SĐT) và hội thoại Messenger vào bảng cơ sở dữ liệu `customers`, nhưng người dùng (chủ shop và nhân viên CSKH) chưa có màn hình tập trung để quản lý toàn diện danh bạ khách hàng, phân loại khách tiềm năng (Leads), gán nhãn tags chăm sóc (Khách VIP, Đã mua hàng, Có SĐT), theo dõi tổng giá trị vòng đời khách hàng (LTV) cũng như lịch sử tương tác và đơn hàng. 

Việc bổ sung phân hệ CRM khách hàng tập trung (`customer-crm`) giải quyết khoảng trống quản lý dữ liệu người mua, tối ưu hóa quy trình chăm sóc hậu mãi và hỗ trợ chiến dịch bán lại (retargeting) hiệu quả cho các shop kinh doanh trực tuyến tại Việt Nam.

## What Changes

- **CRM Customers REST API (`/api/v1/customers`)**:
  - `GET /api/v1/customers`: Tìm kiếm đa năng (tên, số điện thoại, Facebook PSID), lọc theo nhãn tags (`Co_SDT`, `Khach_VIP`, `Da_mua_hang`,...), sắp xếp theo tổng chi tiêu (LTV) hoặc tương tác gần nhất, hỗ trợ phân trang chuẩn.
  - `GET /api/v1/customers/:id`: Lấy chi tiết hồ sơ khách hàng kèm thống kê tổng quan (tổng chi tiêu LTV, tổng số đơn hàng, giá trị đơn trung bình AOV, đơn hàng gần nhất).
  - `GET /api/v1/customers/:id/orders`: Truy vấn lịch sử danh sách đơn hàng đã mua của khách hàng.
  - `PATCH /api/v1/customers/:id`: Cập nhật thông tin khách hàng (tên, số điện thoại, địa chỉ, ghi chú nội bộ).
  - `POST /api/v1/customers/:id/tags`: Thêm thẻ tag mới cho khách hàng (idempotent, tránh trùng tag).
  - `DELETE /api/v1/customers/:id/tags/:tag`: Gỡ bỏ nhãn tag khỏi hồ sơ khách hàng.
  - Áp dụng phân quyền RBAC và che giấu thông tin nhạy cảm (PII Phone Masking `09x***x123`) đối với nhân viên không đủ quyền.
- **Frontend State Management (`customer.store.ts`)**:
  - Quản lý danh sách khách hàng, bộ lọc (tags, search query, page, limit), trạng thái loading/error.
  - Thao tác gán/xóa tags nhanh (optimistic updates) và chọn khách hàng xem chi tiết.
- **macOS Clean Utility CRM UI (`/(dashboard)/customers`)**:
  - `CustomerMetrics`: 4 thẻ Bento thống kê tổng số khách hàng, số leads có SĐT, số khách VIP và tổng giá trị chi tiêu (LTV) tích lũy.
  - `CustomerTable`: Bảng dữ liệu khách hàng với avatar phong cách macOS, tên Facebook, SĐT masked, tag chips, tổng chi tiêu, ngày tương tác cuối và nút thao tác nhanh.
  - `CustomerDetailDrawer`: Drawer trượt mượt mà hiển thị hồ sơ cá nhân, timeline lịch sử đơn hàng, trình quản lý tag linh hoạt và ghi chú nội bộ.
  - Tích hợp điều hướng Sidebar (`/customers`).
- **Kiểm thử tự động**:
  - Unit tests cho `CustomerService`, `CustomerRepository`, `customer.store.ts`.
  - Integration tests cho Express routes `/api/v1/customers`.
  - Component tests cho giao diện CRM Bento Grid.

## Capabilities

### New Capabilities
- `customer-crm`: Cung cấp khả năng quản lý danh bạ khách hàng và khách tiềm năng (CRM Leads), tính toán chỉ số LTV, phân loại nhãn tags, tra cứu lịch sử đơn hàng và bảng điều khiển trực quan macOS Clean Utility.

### Modified Capabilities
*(Không có thay đổi đặc tả của các capability hiện có)*

## Impact

- **Backend**:
  - Bổ sung `CustomerService` và mở rộng `CustomerRepository` với các truy vấn tổng hợp số liệu LTV (`SUM(total_amount)`), số lượng đơn hàng, và bộ lọc JSONB tags.
  - Bổ sung DTOs (`customer.dto.ts`), controller (`customer.controller.ts`) và router (`customer.routes.ts`) vào Express pipeline tại `/api/v1/customers`.
- **Frontend**:
  - Bổ sung trang `frontend/src/app/(dashboard)/customers/page.tsx` và cụm components tại `frontend/src/components/customers/`.
  - Thêm `customer.store.ts` vào `frontend/src/lib/stores/`.
  - Cập nhật mục điều hướng `/customers` trong `frontend/src/components/layout/sidebar.tsx` và command palette.
- **Database**:
  - Tận dụng cấu trúc bảng hiện có `customers` và `orders` trong PostgreSQL, không yêu cầu thay đổi DDL phá vỡ cấu trúc cũ (backward-compatible).
