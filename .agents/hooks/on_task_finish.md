---
event: on_task_finish
description: Quality assurance, triple-memory synchronization and state persistence hook executed when a task completes.
enabled: true
---

# Hook: Nghiệm Thu & Đồng Bộ Bộ Nhớ Toàn Diện (On Task Finish)

Hook này được tự động kích hoạt khi AI Agent chuẩn bị hoàn tất nhiệm vụ và phản hồi cho người dùng. Mọi tác vụ phát triển, nâng cấp hoặc sửa lỗi đều phải vượt qua toàn bộ các bước nghiệm thu dưới đây.

---

## Các Bước Nghiệm Thu Bắt Buộc

### 1. Kiểm Tra Tính Toàn Vẹn Mã Nguồn (Quality Gates)
- Đảm bảo toàn bộ bài kiểm thử hiện có vượt qua 100%: `npm test` hoặc `npm run test:unit`.
- Kiểm tra linter và TypeScript typecheck đạt 0 lỗi: `npx tsc --noEmit`.

### 2. Dọn Dẹp Tài Nguyên Tạm (Housekeeping)
- Xóa bỏ các tệp scratch, log thử nghiệm hoặc dữ liệu nháp không cần thiết.
- Không để lại các port bị treo hoặc tiến trình background zombie.

### 3. Quy Chuẩn Đồng Bộ Bộ Ba Bộ Nhớ Bắt Buộc (Mandatory Triple-Memory Protocol)
Trước khi kết thúc task, AI Agent **BẮT BUỘC** phải rà soát và cập nhật đồng bộ **CẢ 3 TỆP** trong [`.agents/memory/`](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory):
1. **[history.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory/history.md):**
   - Thêm mục mới ở đầu tệp: `## [<YYYY-MM-DD>] - Hoàn Thành <TASK-ID>: <Tên Task> (<feature-name>)`.
   - Ghi nhận chi tiết những thay đổi ở các tầng: DTOs, Services, Repositories, APIs, Stores, UI Components, Tests.
   - **Đồng bộ phần cuối tệp:** Cập nhật bảng checklist tiến độ Sprint, đảm bảo Sprint hiện tại và các Sprint đã xong khớp chính xác với [Task.md](file:///c:/Users/Dell/Desktop/ShopFlow/Task.md).
2. **[project_context.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory/project_context.md):**
   - Cập nhật khi task có: Thêm/sửa bảng cơ sở dữ liệu (Database Schema), thêm endpoints REST API, thêm sự kiện WebSocket, thêm màn hình Frontend mới, tích hợp third-party SDK mới, hoặc biến môi trường `.env`.
3. **[decisions.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory/decisions.md):**
   - Bổ sung Architecture Decision Record (ADR) mới khi task đưa ra: Quyết định kiến trúc, lựa chọn công nghệ/thư viện, thiết kế thuật toán cốt lõi, cơ chế bảo mật (HMAC, PII, CSRF), giải pháp chống spam/rate limit, hoặc chiến lược caching/invalidation.

### 4. Thẩm Định Bộ Nhớ Tự Động (Automated Memory Audit)
Chạy lệnh kiểm tra tính toàn vẹn của bộ nhớ:
```bash
npm run memory:check
```
*Yêu cầu nghiêm ngặt:* Lệnh phải trả về **`100% PASS`**. Nếu script báo lỗi lệch pha, agent **KHÔNG ĐƯỢC PHÉP** coi task là hoàn thành mà phải cập nhật đầy đủ các tệp memory tương ứng.

### 5. Cập Nhật Task.md & Đồng Bộ Lên GitHub
- Đánh dấu `[x]` task tương ứng và ghi dòng tóm tắt vào bảng *Nhật Ký Cập Nhật Tiến Độ Sprint* ở cuối [Task.md](file:///c:/Users/Dell/Desktop/ShopFlow/Task.md).
- Commit toàn bộ thay đổi (gồm cả mã nguồn và 3 tệp memory) theo chuẩn Conventional Commits.
- Push lên remote GitHub: `git push origin <branch>/main`.

### 6. Trình Bày Kết Quả & Âm Thanh Thông Báo
- Tóm tắt súc tích những gì đã làm, cung cấp đường link tệp tin dạng `[file_name](file:///path/to/file)`.
- Vòng lặp `Stop` tự động kích hoạt hook `task-completion-sound` trong [hooks.json](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/hooks.json), thực thi script [notify_task_completed.ps1](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/hooks/notify_task_completed.ps1) phát âm thanh thông báo trên Windows.
