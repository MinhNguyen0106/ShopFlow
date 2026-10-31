# Spec Delta: multi-page-rbac

## MODIFIED Requirements

### Requirement: Page Members Database Schema & Hierarchy
Hệ thống SHALL thiết lập cấu trúc bảng `page_members` lưu trữ thông tin thành viên liên kết với từng Fanpage cụ thể, hỗ trợ 3 cấp bậc vai trò phân định rõ ràng: `owner` (Chủ sở hữu), `manager` (Quản lý) và `staff` (Nhân viên), đồng thời tự động đồng bộ hóa các chủ sở hữu Fanpage hiện có vào bảng với vai trò `owner` thông qua migration script tương thích hoàn toàn với Node.js database client.

#### Scenario: Existing page owner backfill
- **WHEN** hệ thống thực thi migration cơ sở dữ liệu `004_page_members_and_rbac.sql`
- **THEN** tất cả các bản ghi hiện có trong bảng `connected_pages` đều được tự động tạo một bản ghi tương ứng trong `page_members` với `role = 'owner'` và `status = 'active'`, bảo đảm không làm gián đoạn quyền truy cập của người dùng cũ.

#### Scenario: Unique member constraint per fanpage
- **WHEN** cố gắng thêm một người dùng đã là thành viên của Fanpage vào lại bảng `page_members`
- **THEN** cơ sở dữ liệu từ chối với lỗi ràng buộc duy nhất (Unique Constraint Violation trên cặp `(page_id, user_id)`).

#### Scenario: Node migration runner compatibility without psql dependency
- **WHEN** chạy lệnh `npm run db:migrate` qua Node.js Migration Runner
- **THEN** runner tự động tiền xử lý và loại bỏ các lệnh meta-command của `psql` (như `\set ON_ERROR_STOP on`), thực thi an toàn cấu trúc bảng `page_members` và không gây lỗi cú pháp SQL `syntax error at or near "\"`.
