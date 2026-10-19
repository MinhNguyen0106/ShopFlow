# ShopFlow Project History & Milestone Changelog

Nhật ký theo dõi các mốc phát triển, thay đổi kiến trúc và trạng thái của dự án ShopFlow.

---

## [2026-10-19] - Đồng Bộ Hóa Toàn Diện Bộ Nhớ Agent (Memory Re-alignment)
- **Tác giả:** System Architect & Lead AI Assistant (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Đồng bộ hóa 100% tệp bộ nhớ ngữ cảnh [project_context.md](file:///C:/Users/Dell/Desktop/ShopFlow/.agent/memory/project_context.md) theo thiết kế mới: PostgreSQL 15+, `pg` (node-postgres) + Repository Pattern, Monorepo (`backend/` & `frontend/`), Cloudinary, BullMQ, Socket.io.
  - Bổ sung 5 quyết định kiến trúc mới (ADR-007 đến ADR-011) vào [decisions.md](file:///C:/Users/Dell/Desktop/ShopFlow/.agent/memory/decisions.md).
  - Cập nhật kế hoạch triển khai sprint tiếp theo bám sát bộ tài liệu module hóa.

---

## [2026-10-19] - Mô-đun Hóa Bộ Tài Liệu Thiết Kế Thành 5 File Chuyên Biệt
- **Tác giả:** System Architect & Lead AI Assistant (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Giải quyết vấn đề quá tải Context Window do tệp `DESIGN.md` nguyên khối (> 1000 dòng).
  - Phân tách và cấu trúc lại hệ thống tài liệu trong thư mục `docs/`:
    - [00_INDEX.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/00_INDEX.md): Chỉ mục trung tâm, kim chỉ nam & Ma trận hướng dẫn AI Coding Agent ("Code phần nào đọc file nào").
    - [01_PRD.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/01_PRD.md): Khảo sát yêu cầu sản phẩm, Persona, phạm vi MVP & chính sách Meta.
    - [02_ARCHITECTURE_AND_FLOWS.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/02_ARCHITECTURE_AND_FLOWS.md): 3 luồng người dùng, sơ đồ kiến trúc tổng thể, chốt tech stack, cây thư mục và file `.env.example`.
    - [03_DATABASE_SCHEMA.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/03_DATABASE_SCHEMA.md): Mô hình ERD, định nghĩa 9 bảng và toàn bộ mã SQL DDL Runnable (PostgreSQL 15+).
    - [04_API_AND_WEBSOCKET.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/04_API_AND_WEBSOCKET.md): Chuẩn JSON Envelope, 24+ REST APIs, Socket.io events & Sơ đồ upload media Cloudinary 14 bước.
  - Lưu trữ tệp cũ an toàn tại `docs/archive/DESIGN_monolith_backup.md` và `docs/archive/PRD_So_Bo_Quan_Ly_Fanpage_backup.md`.

---

## [2026-10-19] - Hoàn Thiện & Ban Hành Mục IV: Đặc Tả Kỹ Thuật Chi Tiết & API Nội Bộ
- **Tác giả:** Software Architect & AI Assistant
- **Nội dung hoàn thành:**
  - Chốt dứt khoát kiến trúc Monorepo (`backend/` dùng Node.js + Express + TypeScript và `frontend/` dùng Next.js 14+ App Router + Tailwind CSS).
  - Chốt sử dụng `pg` (node-postgres) thay cho Prisma để tương thích tuyệt đối với PostgreSQL DDL, partial indexes và triggers tự động.
  - Chốt `Zod` validation middleware cho toàn bộ request body, query, params và env parsing.
  - Chốt cấu hình BullMQ Retry & Exponential Backoff cho Meta Rate Limits (`attempts: 5`, `delay: 3000ms`).
  - Thiết kế luồng upload media đám mây qua Multer MemoryStorage + Cloudinary Stream Upload cấp Public HTTPS URL cho Meta Graph API.
  - Thiết kế màn hình Live Chat tập trung (Centralized Inbox) giao diện 3 cột chuyên dụng thời gian thực qua Socket.io.

---

## [2026-10-17] - Khởi Tạo Không Gian Làm Việc AI Agent Toàn Diện
- **Tác giả:** System Architect (Antigravity Ecosystem)
- **Nội dung hoàn thành:**
  - Thiết lập cấu trúc thư mục cấu hình AI Agent hoàn chỉnh tại `.agent/`.
  - Ban hành tệp loại trừ chuẩn `.agentignore` tại thư mục gốc.
  - Cấu hình tích hợp MCP servers, sandbox và agent settings.
  - Ban hành bộ quy chuẩn kỹ thuật: `project-rules.md`, `security.md`, `testing-standards.md`.
  - Xây dựng quy trình làm việc tự động (workflows): `test.md`, `deploy.md`, `code-review.md`.
  - Phân định vai trò các Agent chuyên biệt: `planner`, `coder`, `security-auditor`, `devops`.

---

## [Giai Đoạn Trước] - Nghiên Cứu Nghiệp Vụ & Khảo Sát Thị Trường
- **Tài liệu hoàn thành:** [deep-research-report.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/deep-research-report.md)
- **Nội dung:** Khảo sát chi tiết bài toán kinh doanh của các shop thời trang/B2C tại Việt Nam trên nền tảng Facebook Fanpage, đánh giá tính khả thi của Facebook Graph API, phân tích rủi ro chính sách Meta (xóa quyền `publish_to_groups`, chống spam).

---

## [Kế Hoạch Tiếp Theo] - MVP Implementation Sprint 1
- [ ] Khởi tạo khung thư mục Monorepo chuẩn hóa (`backend/` và `frontend/`).
- [ ] Khởi tạo tệp `docker-compose.yml` cho PostgreSQL 15+ và Redis 7+.
- [ ] Thực thi tệp SQL DDL từ `docs/03_DATABASE_SCHEMA.md` khởi tạo toàn bộ 9 bảng, partial indexes và triggers.
- [ ] Xây dựng tầng hạ tầng kết nối cơ sở dữ liệu `backend/src/infrastructure/database/db.client.ts` (`pg.Pool` Singleton).
- [ ] Xây dựng generic validation middleware `validateRequest` với Zod.
- [ ] Triển khai Module Xác thực `auth` (Đăng ký, Đăng nhập, JWT Access/Refresh tokens).
- [ ] Triển khai Webhook Ingestion Router & Controller kèm HMAC-SHA256 Verifier.
- [ ] Triển khai BullMQ Queue & Worker quét Regex ẩn SĐT trong < 3 giây.
