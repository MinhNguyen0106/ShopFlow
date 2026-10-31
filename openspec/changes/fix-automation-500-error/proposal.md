# Proposal: Sửa Lỗi HTTP 500 Tại Trang Kịch Bản Tự Động (Automation)

## Why

Khi người dùng truy cập trang Kịch bản tự động (`/automation`), giao diện hiển thị banner cảnh báo lỗi đỏ: `"Request failed with status code 500"`.
Quá trình điều tra kỹ thuật xác định nguyên nhân cốt lõi:
1. **Thiếu bảng `page_members` trong PostgreSQL Database**: Middleware phân quyền `requirePageRole` thực hiện truy vấn `SELECT ... FROM page_members`, nhưng bảng này chưa tồn tại trong database (lỗi PostgreSQL `42P01: relation "page_members" does not exist`).
2. **Migration Runner bị chặn bởi cú pháp `\set`**: Tệp migration `004_page_members_and_rbac.sql` (cũng như 001-003) chứa lệnh meta-command của `psql` là `\set ON_ERROR_STOP on`. Node.js `pg` driver không hỗ trợ cú pháp này nên lệnh `npm run db:migrate` luôn crash (`syntax error at or near "\"`) và chưa bao giờ áp dụng thành công các migration mới vào database.
3. **Frontend bóc tách lỗi không khớp chuẩn API Contract**: `automation.store.ts` bóc tách `err.response?.data?.message` thay vì `err.response?.data?.error?.message`. Khi trường này `undefined`, store fallback về `(err as Error).message` của Axios là `"Request failed with status code 500"`.

Sửa chữa lỗi này là cấp thiết để khôi phục hoạt động cho trang Automation và đồng bộ hạ tầng cơ sở dữ liệu cho toàn bộ hệ sinh thái ShopFlow.

## What Changes

- **Chuẩn hóa Migration Runner (`migrate.ts`)**: Bổ sung bộ lọc làm sạch câu lệnh SQL trước khi thực thi, tự động loại bỏ các meta-command của `psql` (như `\set ...`, `\connect ...`) để `npm run db:migrate` chạy trơn tru qua Node.js `pg.Pool`.
- **Thực thi Migration `004_page_members_and_rbac.sql`**: Chạy migration an toàn để tạo bảng `page_members`, tạo indexes, trigger và tự động backfill quyền `owner` cho các chủ shop trong `connected_pages`.
- **Đồng bộ Defensive Error Parsing trong `automation.store.ts`**: Cập nhật toàn bộ các phương thức `fetchRules`, `createRule`, `updateRule`, `toggleRuleActive`, `deleteRule` để bóc tách thông báo lỗi theo chuẩn Envelope `{ success: false, error: { message } }` trước khi fallback.
- **Bổ sung Unit/Integration Tests**: Bổ sung ca kiểm thử cho Migration Runner (kiểm tra khả năng lọc lệnh `psql`), kiểm tra `requirePageRole` khi bảng `page_members` tồn tại, và kiểm thử xử lý lỗi API envelope trong Zustand store.

## Capabilities

### New Capabilities
<!-- Không có capability mới -->

### Modified Capabilities
- `multi-page-rbac`: Đảm bảo schema bảng `page_members` và dữ liệu phân quyền thành viên Fanpage được khởi tạo thành công vào database thông qua Migration Runner chuẩn hóa.
- `automation-rules`: Nâng cấp cơ chế bóc tách lỗi phòng vệ (Defensive Data Parsing) trong store `automation.store.ts` để hiển thị chính xác thông báo lỗi từ Backend và tải danh sách rules trơn tru sau khi xác thực RBAC.

## Impact

- **Backend**:
  - `backend/src/infrastructure/database/migrate.ts`: Thêm hàm tiền xử lý / loại bỏ lệnh `\set` của `psql`.
  - Database PostgreSQL: Khởi tạo bảng `page_members` kèm dữ liệu backfill.
- **Frontend**:
  - `frontend/src/lib/automation.store.ts`: Đồng bộ logic bóc tách `err.response?.data?.error?.message`.
- **Testing & Tooling**:
  - Lệnh `npm run db:migrate` chạy thành công trên mọi môi trường phát triển và production mà không phụ thuộc vào `psql` CLI.
