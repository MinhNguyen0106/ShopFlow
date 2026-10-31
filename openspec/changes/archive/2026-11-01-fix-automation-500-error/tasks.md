# Tasks: Khắc Phục Lỗi HTTP 500 Trang Kịch Bản Tự Động & Chuẩn Hóa Migration

## 1. Chuẩn Hóa Migration Runner (Backend)

- [x] 1.1 Bổ sung hàm tiền xử lý `cleanSqlScript(sql: string): string` vào `backend/src/infrastructure/database/migrate.ts` để loại bỏ các meta-command của `psql` (như `\set ...`) trước khi thực thi truy vấn và xác minh bằng lệnh `npm run db:migrate:dry`.
- [x] 1.2 Thêm bộ unit test cho hàm tiền xử lý SQL trong `backend/src/infrastructure/database/__tests__/migrate.test.ts` và xác minh test chạy thành công với Vitest.

## 2. Thực Thi & Kiểm Tra Cơ Sở Dữ Liệu PostgreSQL

- [x] 2.1 Chạy lệnh migration chính thức `npm run db:migrate` từ backend và xác minh toàn bộ các tệp migration (`001` đến `004_page_members_and_rbac.sql`) áp dụng thành công vào PostgreSQL.
- [x] 2.2 Kiểm tra sự tồn tại của bảng `page_members`, các indexes, trigger và kiểm tra dữ liệu backfill chủ sở hữu Fanpage từ `connected_pages` sang `page_members`.

## 3. Đồng Bộ Defensive Error Parsing Trong Frontend Store

- [x] 3.1 Cập nhật `frontend/src/lib/automation.store.ts` để bóc tách thông điệp lỗi phòng vệ theo chuẩn envelope API `{ success: false, error: { message, code } }` ở các phương thức `fetchRules`, `createRule`, `updateRule`, `toggleRuleActive` và `deleteRule`.
- [x] 3.2 Viết unit test cho `useAutomationStore` trong `frontend/src/lib/__tests__/automation.store.test.ts` xác minh việc bắt lỗi API đúng format không bị fallback về thông báo generic.

## 4. Thẩm Định Hệ Thống & Đồng Bộ Bộ Nhớ (Memory Audit)

- [x] 4.1 Kiểm tra API endpoint `GET /api/v1/pages/:pageId/rules` hoạt động trơn tru (trả về HTTP 200 OK thay vì HTTP 500).
- [x] 4.2 Chạy toàn diện bộ kiểm thử tĩnh và unit tests (`npm run test` ở backend, `npm run test` ở frontend) để bảo đảm 100% pass.
- [x] 4.3 Cập nhật đồng bộ bộ ba bộ nhớ ([history.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory/history.md), [project_context.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory/project_context.md), [decisions.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory/decisions.md)) và chạy kiểm tra `npm run memory:check` đạt 100% PASS.
