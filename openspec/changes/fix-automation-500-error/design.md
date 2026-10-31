# Design: Khắc Phục Lỗi HTTP 500 Trang Kịch Bản Tự Động & Chuẩn Hóa Migration

## Context

Xem [proposal.md](proposal.md) để biết bối cảnh và lý do thay đổi.
Hiện tại hệ thống ShopFlow sử dụng Node.js `pg.Pool` trong script [migrate.ts](file:///c:/Users/Dell/Desktop/ShopFlow/backend/src/infrastructure/database/migrate.ts) để quản lý migration. Tuy nhiên, các tệp migration SQL chứa lệnh `\set ON_ERROR_STOP on` vốn chỉ tương thích với CLI `psql`, khiến migration runner bị crash và bảng `page_members` chưa được tạo trong PostgreSQL thực tế. Khi truy cập `/automation`, middleware `requirePageRole` gọi tới bảng này và gây ra lỗi 500 unhandled exception.

## Goals / Non-Goals

**Goals:**
- Tự động lọc sạch các câu lệnh `psql` meta-commands (như `\set ...`) trong `migrate.ts` trước khi gửi truy vấn đến PostgreSQL qua `pg.Pool`.
- Thực thi an toàn các migration còn thiếu (`002_products_and_inventory.sql`, `003_orders_and_fulfillment.sql`, `004_page_members_and_rbac.sql`) để bảng `page_members` được tạo lập và backfill dữ liệu chủ sở hữu Fanpage đầy đủ.
- Đồng bộ hóa cơ chế Defensive Error Parsing trong [automation.store.ts](file:///c:/Users/Dell/Desktop/ShopFlow/frontend/src/lib/automation.store.ts) theo chuẩn API Contract Envelope `{ success: false, error: { message, code } }`.
- Đảm bảo các bộ test tự động (unit test, integration test) đạt 100% pass và `npm run memory:check` pass.

**Non-Goals:**
- Không sửa đổi cấu trúc DDL của bảng `page_members` đã được phê duyệt trong thiết kế kiến trúc.
- Không yêu cầu cài đặt thêm công cụ bên ngoài (như cài đặt riêng PostgreSQL CLI `psql`).

## Decisions

### 1. Tiền xử lý SQL trong Migration Runner thay vì sửa tệp SQL gốc
- **Quyết định:** Trong `migrate.ts`, bổ sung hàm tiền xử lý `cleanSqlScript(sql: string): string` sử dụng biểu thức chính quy để loại bỏ các dòng meta-command bắt đầu bằng `\` (ví dụ: `^\s*\\.*$` với flag `multiline`).
- **Lý do:** Giữ nguyên tính toàn vẹn của các file SQL migration (nếu dev muốn chạy bằng `psql` trực tiếp vẫn tương thích), đồng thời bảo đảm runner Node.js thực thi an toàn 100% trên mọi nền tảng OS (Windows, Linux, macOS, Docker).
- **Giải pháp thay thế đã cân nhắc:**
  - *Xóa thủ công `\set ON_ERROR_STOP on` khỏi các file `.sql`*: Dễ gây tái phát nếu dev sau này copy template migration từ `psql` sang. Xử lý tại runner mang tính bền vững hơn.

### 2. Tính lũy tiến và Idempotent của Migration
- **Quyết định:** Tiếp tục sử dụng cơ chế tracking của bảng `_schema_migrations`. Các file SQL đều đã có sẵn `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS` và `ON CONFLICT DO NOTHING`.
- **Lý do:** Cho phép runner chạy an toàn trên database dù một phần schema 001 đã tồn tại trước đó.

### 3. Defensive Error Extraction trong Frontend Store
- **Quyết định:** Chuẩn hóa hàm trích xuất lỗi trong `automation.store.ts`:
  ```typescript
  function extractErrorMessage(err: unknown, fallback: string): string {
    const responseData = (err as { response?: { data?: unknown } })?.response?.data as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return responseData?.error?.message || responseData?.message || (err as Error).message || fallback;
  }
  ```
- **Lý do:** Tuân thủ triệt để quy tắc `api-contract-sync.md`, tránh lỗi hiển thị generic `"Request failed with status code 500"`.

## Risks / Trade-offs

- **[Risk]** Migration `001_initial_schema.sql` có thể đã tạo một số bảng trước đó, nếu chạy lại có thể báo lỗi trigger hoặc duplicate type.
  → *Mitigation*: Tệp migration sử dụng `CREATE TRIGGER IF NOT EXISTS` (hoặc `DROP TRIGGER IF EXISTS` trước khi tạo) và `CREATE TABLE IF NOT EXISTS`. Runner chạy trong transaction cho từng file, nếu có lỗi sẽ rollback file đó và báo rõ ràng.
- **[Risk]** Chưa có dữ liệu chủ shop trong `connected_pages` lúc backfill.
  → *Mitigation*: Câu lệnh `INSERT INTO page_members ... SELECT ... FROM connected_pages ON CONFLICT DO NOTHING` hoàn toàn an toàn khi bảng rỗng hoặc đã có bản ghi.
