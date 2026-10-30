# Tasks: customer-crm

## 1. Backend Data Access & Domain Logic

- [x] 1.1 Định nghĩa Zod DTOs `customer.dto.ts` trong `backend/src/core/dtos/customer.dto.ts` (validate phân trang, tìm kiếm đa năng, mảng tags, cập nhật thông tin và gán/xóa tag) và xác minh bằng DTO unit tests.
- [x] 1.2 Mở rộng `CustomerRepository` tại `backend/src/infrastructure/repositories/customer.repository.ts` với các phương thức truy vấn tối ưu: `findWithStats` (hỗ trợ phân trang, tìm kiếm tên/SĐT/FB ID, lọc tags JSONB, tính LTV và tổng đơn hàng bằng SQL `LEFT JOIN` với bảng `orders`), `findDetailStatsById`, `getCustomerOrders`, `addTag`, `removeTag`, và `getMetricsSummary`; xác minh bằng `customer.repository.test.ts`.
- [x] 1.3 Hiện thực `CustomerService` tại `backend/src/core/services/customer.service.ts` xử lý nghiệp vụ quản lý khách hàng, tính toán chỉ số LTV/AOV, và thực thi chính sách bảo mật PII che giấu số điện thoại (`098****123`) cho vai trò `staff`; xác minh bằng `customer.service.test.ts`.

## 2. Backend REST API Endpoints & Route Registration

- [x] 2.1 Xây dựng `CustomerController` tại `backend/src/api/controllers/customer.controller.ts` xử lý các handlers: `getCustomers`, `getMetrics`, `getCustomerById`, `getCustomerOrders`, `updateCustomer`, `addTag`, `removeTag` theo chuẩn `ApiResponse<T>`.
- [x] 2.2 Xây dựng router `backend/src/api/routes/customer.routes.ts`, tích hợp middleware `authenticate`, kiểm tra ngữ cảnh Fanpage (`pageId`), mount vào Express application tại `/api/v1/customers` trong `backend/src/api/routes/index.ts`.
- [x] 2.3 Viết integration tests trong `backend/src/api/routes/__tests__/customer.routes.test.ts` kiểm thử toàn diện các luồng API `/api/v1/customers` (CRUD, filter tags, phân quyền RBAC PII masking) và xác minh tất cả tests pass 100%.

## 3. Frontend State Management (`customer.store.ts`)

- [x] 3.1 Định nghĩa Type definitions (`Customer`, `CustomerOrder`, `CustomerMetrics`, `CustomerFilters`) trong `frontend/src/lib/types/customer.ts` tuân thủ hợp đồng API Backend (`camelCase`).
- [x] 3.2 Xây dựng Zustand store `frontend/src/lib/customer.store.ts` hỗ trợ tải danh sách khách hàng, phân trang, lọc theo tags, tìm kiếm đa năng, nạp thẻ metrics, và cập nhật lạc quan (optimistic updates) khi gán/xóa tags kèm cơ chế tự động rollback khi API lỗi.
- [x] 3.3 Viết unit tests cho `customer.store.ts` trong `frontend/src/lib/__tests__/customer.store.test.ts` kiểm thử logic quản lý trạng thái, optimistic updates và xử lý lỗi mạng.

## 4. Frontend UI Components & Dashboard Page (`/(dashboard)/customers`)

- [x] 4.1 Xây dựng Bento cards `CustomerMetrics.tsx` tại `frontend/src/components/customers/CustomerMetrics.tsx` trực quan hóa 4 chỉ số KPI: Tổng khách hàng, Leads có SĐT, Khách VIP và Tổng LTV tích lũy theo phong cách macOS Clean Utility.
- [x] 4.2 Xây dựng bảng dữ liệu `CustomerTable.tsx` tại `frontend/src/components/customers/CustomerTable.tsx` hỗ trợ avatar macOS, masked SĐT, TagChips (tối đa 3 chips kèm huy hiệu `+N`), hiển thị LTV định dạng VND, phân trang và thao tác chọn xem chi tiết.
- [x] 4.3 Xây dựng ngăn kéo trượt `CustomerDetailDrawer.tsx` tại `frontend/src/components/customers/CustomerDetailDrawer.tsx` hiển thị hồ sơ khách hàng, timeline lịch sử đơn hàng, trình gán/xóa tags nhanh và form ghi chú nội bộ.
- [x] 4.4 Xây dựng trang `frontend/src/app/(dashboard)/customers/page.tsx` tích hợp `CustomerMetrics`, thanh công cụ tìm kiếm & lọc tag, `CustomerTable` và `CustomerDetailDrawer`.
- [x] 4.5 Cập nhật thanh điều hướng `Sidebar.tsx` tại `frontend/src/components/layout/sidebar.tsx` bổ sung menu mục "Khách hàng & Leads" (`/customers`).
- [x] 4.6 Viết component tests cho giao diện CRM tại `frontend/src/app/(dashboard)/customers/__tests__/customers-page.test.tsx` và xác minh component render chính xác.

## 5. End-to-End Verification & Quality Gates

- [x] 5.1 Chạy toàn bộ test suites tự động của backend (`npm run test`) và frontend (`npm run test`) để đảm bảo không có regressions.
- [x] 5.2 Kiểm tra tĩnh TypeScript (`npx tsc --noEmit` ở backend và frontend) và build Next.js để xác nhận 0 lỗi type-check và mã nguồn sẵn sàng triển khai.

## Workflow follow-up

- Sau khi hoàn thành toàn bộ kiểm thử và review, commit và push lên remote GitHub theo quy tắc của dự án.
- Cập nhật tiến độ task [TASK-27] vào `Task.md` và lưu vết vào `.agents/memory/history.md`.
- Lưu trữ change qua `openspec archive customer-crm`.
