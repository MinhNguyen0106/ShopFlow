---
event: on_task_start
description: Context initialization and triple-memory loading hook executed at the beginning of each agent task or session.
enabled: true
---

# Hook: Khởi Tạo Phiên Làm Việc & Tải Bộ Nhớ (On Task Start)

Hook này được tự động kích hoạt mỗi khi AI Agent bắt đầu một tác vụ mới hoặc nhận chỉ thị từ người dùng.

---

## Các Hành Động Bắt Buộc

### 1. Tải Ngữ Cảnh Bộ Ba Bộ Nhớ Dài Hạn (Triple-Memory Loading):
- **Kiến trúc & Tri thức sống:** Đọc lướt tệp ngữ cảnh dự án [project_context.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory/project_context.md) để nắm cấu trúc 15 bảng database, các màn hình frontend, endpoints API và tech stack.
- **Quyết định kiến trúc (ADRs):** Kiểm tra các quyết định kiến trúc đã ban hành trong [decisions.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory/decisions.md) để tránh đi ngược lại các giải pháp đã chốt.
- **Lộ trình & Cột mốc:** Đọc nhanh [Task.md](file:///c:/Users/Dell/Desktop/ShopFlow/Task.md) và phần cuối của [history.md](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory/history.md) để nắm Sprint hiện tại và mục tiêu của task chuẩn bị làm.

### 2. Kiểm Tra Tính Nhất Quán Bộ Nhớ (Memory Health Check):
- Chạy nhanh lệnh:
  ```bash
  npm run memory:check
  ```
  Nếu phát hiện memory đang bị lệch pha từ trước, chủ động thông báo cho người dùng hoặc khắc phục ngay đầu phiên.

### 3. Kiểm Tra Trạng Thái Kho Mã Nguồn (VCS Sanity Check):
- Chạy lệnh `git status` để nắm các tệp đang thay đổi dở dang.
- Đảm bảo nhánh làm việc chính xác (tuân thủ quy trình tách nhánh `feature/<task-id>-<ten-task>` theo `task-lifecycle.md`, không code trực tiếp trên `main`).

### 4. Áp Dụng Quy Chuẩn Toàn Cục:
- Luôn trả lời và giải thích bằng tiếng Việt chuẩn mực, giữ nguyên thuật ngữ kỹ thuật tiếng Anh.
- Tuyệt đối không hardcode API key, Secret Token vào mã nguồn; luôn dùng biến môi trường `.env`.
- Mọi liên kết tệp tin tạo ra phải có định dạng markdown nhấp chuột được `[tên_file](file:///đường_dẫn)`.
