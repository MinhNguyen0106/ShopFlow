# Design: customer-crm

## Context

Hệ thống ShopFlow hiện tại đã có bảng cơ sở dữ liệu `customers` (được khởi tạo trong migration `001_initial_schema.sql`) và bảng `orders` (trong `003_orders_and_fulfillment.sql` với khóa ngoại `customer_id REFERENCES customers(id)`). Đồng thời, lớp `CustomerRepository` cơ bản đã được xây dựng để lưu số điện thoại và tag `Co_SDT` tự động khi phát hiện khách hàng trong bình luận. 

Tuy nhiên, hệ thống chưa có API chuyên dụng để truy vấn danh bạ khách hàng kèm số liệu tổng hợp (LTV, số lượng đơn, ngày mua cuối), chưa có endpoint quản lý tags và ghi chú nội bộ, và phía Frontend chưa có màn hình CRM tập trung theo chuẩn macOS Clean Utility.

Tham khảo: [proposal.md](file:///c:/Users/Dell/Desktop/ShopFlow/openspec/changes/customer-crm/proposal.md) và [spec.md](file:///c:/Users/Dell/Desktop/ShopFlow/openspec/changes/customer-crm/specs/customer-crm/spec.md).

## Goals / Non-Goals

**Goals:**
- Xây dựng tầng API CRM hiệu năng cao (`/api/v1/customers`), hỗ trợ phân trang, tìm kiếm đa năng (tên, SĐT, Facebook PSID), lọc theo tags, tính toán số liệu LTV và AOV thông qua truy vấn SQL gộp tối ưu không gây N+1 query.
- Hỗ trợ thao tác gán/xóa tags nhanh theo cơ chế Idempotent và cập nhật ghi chú nội bộ cho khách hàng.
- Thực thi chính sách bảo mật PII (Masking số điện thoại `098****123` đối với vai trò `staff`, giữ nguyên đối với `owner`/`admin`).
- Xây dựng Zustand store `customer.store.ts` với khả năng cập nhật lạc quan (optimistic updates) cho thao tác quản lý tags.
- Xây dựng giao diện CRM macOS Clean Utility Bento Grid (`/(dashboard)/customers`) gồm: 4 thẻ số liệu `CustomerMetrics`, bảng tương tác `CustomerTable`, và ngăn kéo trượt `CustomerDetailDrawer` kèm timeline đơn hàng.

**Non-Goals:**
- Tích hợp công cụ gửi tin nhắn trực tiếp từ trang CRM (tính năng gửi tin nhắn đã thuộc về phân hệ `/inbox`).
- Đồng bộ dữ liệu với các nền tảng CRM bên thứ ba (HubSpot, Salesforce, Zoho).
- Tạo chiến dịch Email Marketing hoặc Zalo ZNS tự động (nằm ngoài phạm vi của Task-27).

## Decisions

### 1. Truy vấn tổng hợp chỉ số LTV & Đơn hàng thông qua SQL LEFT JOIN / CTE
- **Lựa chọn:** Thực hiện truy vấn `SELECT cu.*, COALESCE(SUM(o.final_amount), 0) AS lifetime_value, COUNT(o.id) AS total_orders, MAX(o.created_at) AS last_order_at FROM customers cu LEFT JOIN orders o ON cu.id = o.customer_id AND o.status != 'cancelled' WHERE cu.page_id = $1 GROUP BY cu.id`.
- **Lý do:** Tránh hoàn toàn lỗi N+1 query khi hiển thị danh sách 20-50 khách hàng trên bảng dữ liệu; luôn đảm bảo tính chính xác theo thời gian thực của chỉ số LTV mà không cần duy trì các trường phi chuẩn hóa (denormalized fields) dễ bị sai lệch dữ liệu.
- **Giải pháp thay thế đã cân nhắc:** Lưu trữ trực tiếp cột `lifetime_value` và `orders_count` trên bảng `customers` và dùng database trigger/application code để cộng dồn mỗi khi đơn hàng thành công. Nhược điểm: Phức tạp khi rollback đơn, hủy đơn hoặc chỉnh sửa giá trị đơn hàng.

### 2. Quản lý Tag bằng JSONB Array trên PostgreSQL
- **Lựa chọn:** Lưu trữ mảng chuỗi trong cột `tags` kiểu `JSONB` (ví dụ: `["Co_SDT", "Khach_VIP", "Da_mua_hang"]`). Lọc bằng toán tử containment `@>` hoặc `?|` của PostgreSQL.
- **Lý do:** Tương thích 100% với cấu trúc schema hiện có; linh hoạt cho phép shop tự định nghĩa tag tùy ý mà không cần tạo thêm bảng quan hệ nhiều-nhiều phức tạp (`customer_tags_map`).
- **Thao tác thêm/xóa tag an toàn:**
  - Thêm tag: `tags = CASE WHEN tags ? $tag THEN tags ELSE tags || jsonb_build_array($tag::text) END`
  - Xóa tag: `tags = tags - $tag` (toán tử loại bỏ key/element của PostgreSQL JSONB).

### 3. Phân quyền và che giấu thông tin PII ở tầng Service / Controller
- **Lựa chọn:** Tích hợp kiểm tra quyền `pageRole` của người dùng thông qua `requirePageRole` hoặc token context. Nếu vai trò là `staff`, số điện thoại sẽ được che (`phone_number.slice(0, 3) + '****' + phone_number.slice(-3)`). Chủ shop (`owner`) và quản trị viên (`admin`) được giữ nguyên số điện thoại gốc.
- **Lý do:** Tuân thủ tiêu chuẩn an toàn PII và nguyên tắc bảo mật của ShopFlow, ngăn chặn rò rỉ danh sách khách hàng ra bên ngoài.

### 4. Kiến trúc Frontend Zustand với Optimistic Update
- **Lựa chọn:** Store `customer.store.ts` lưu trạng thái `customers`, `metrics`, `selectedCustomer`, `filters` (search, tags, page). Khi nhân viên gán/xóa tag trên UI, Zustand lập tức cập nhật state cục bộ để UI phản hồi ngay lập tức (< 16ms), đồng thời kích hoạt API ngầm. Nếu API lỗi, store tự động khôi phục (rollback) state trước đó và hiển thị thông báo toast lỗi.
- **Lý do:** Trải nghiệm người dùng mượt mà, cảm giác tức thì chuẩn macOS Native.

## Risks / Trade-offs

- **[Risk]** Truy vấn tổng hợp `SUM` và `COUNT` từ bảng `orders` có thể chậm khi số lượng đơn hàng lên đến hàng trăm nghìn dòng.  
  → **Mitigation:** Tạo chỉ mục `idx_orders_customer_id_status` trên `(customer_id, status)` và luôn lọc chặt chẽ theo `page_id` trước khi thực hiện phép nối bảng.

- **[Risk]** Nhân viên gán quá nhiều tags dài hoặc ký tự đặc biệt gây vỡ layout trên bảng.  
  → **Mitigation:** Giới hạn độ dài mỗi tag (tối đa 30 ký tự, validate qua Zod DTO), giới hạn hiển thị tối đa 3 tags trên Table row kèm huy hiệu `+N` và hiển thị đầy đủ trong `CustomerDetailDrawer`.

- **[Risk]** Xung đột thao tác khi 2 nhân viên cùng sửa thông tin ghi chú của một khách hàng cùng lúc.  
  → **Mitigation:** Lưu thời điểm `last_interaction_at` và áp dụng Last-Write-Wins cho ghi chú nội bộ, kèm hiển thị timestamp cập nhật mới nhất.
