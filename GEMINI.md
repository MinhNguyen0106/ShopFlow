# Quy Tắc Hoạt Động Của AI Agent (Antigravity & Gemini) - Dự Án ShopFlow

Tệp tin này được tự động phát hiện và áp dụng cho toàn bộ phạm vi dự án **ShopFlow** (Next.js + Express.js + PostgreSQL).

---

## 1. Tham Chiếu Cẩm Nang Chỉ Dẫn Chính
AI Agent bắt buộc đọc và tuân theo toàn bộ hướng dẫn tại [AGENTS.md](file:///C:/Users/Dell/Desktop/ShopFlow/AGENTS.md).
Toàn bộ tài liệu phân tích nghiệp vụ gốc nằm tại [deep-research-report.md](file:///C:/Users/Dell/Desktop/ShopFlow/docs/deep-research-report.md).

---

## 2. Công Nghệ Nền Tảng (Core Stack)
- **Frontend:** Next.js 14+ (App Router, React 18+, Tailwind CSS, macOS Clean Utility Bento Grid).
- **Backend API & Webhooks:** Express.js (Node.js 20+ LTS, TypeScript Strict Mode, Clean Architecture).
- **Cơ Sở Dữ Liệu:** PostgreSQL 15+ (15 bảng quan hệ ACID, JSONB, Triggers, Repository Pattern qua `pg.Pool`).
- **Hàng Đợi & Caching:** Redis 7+ & BullMQ (Delay jobs, Spam limiter, Redis Cache-Aside).
- **Trí Tuệ Nhân Tạo:** Google Gemini API (Gemini 2.5 Flash Structured JSON mode).
- **Cổng Thanh Toán & Vận Chuyển:** VietQR Napas 247 EMVCo QR Code & Carrier Strategy Adapters.
- **Hạ Tầng Production:** Docker Compose 5 containers & Nginx Reverse Proxy Gateway.

---

## 3. Các Quy Tắc Bắt Buộc (Strict Directives)
1. **Ngôn ngữ phản hồi:** Luôn trả lời và giải thích bằng tiếng Việt (giữ nguyên các thuật ngữ kỹ thuật tiếng Anh).
2. **Định dạng liên kết:** Luôn đính kèm đường dẫn tệp tin dưới dạng markdown link có thể nhấp chuột (`[file_name](file:///path/to/file)`).
3. **Bảo mật tuyệt đối:** Không bao giờ hardcode token, app secret, hoặc password vào mã nguồn. Luôn đọc từ biến môi trường (`.env`).
4. **An toàn hệ thống:** Hỏi ý kiến người dùng trước khi thực thi các lệnh có tính hủy diệt (`rm -rf`, `DROP TABLE`, `git push --force`).
5. **Giao Thức Bộ Ba Bộ Nhớ (Triple-Memory Protocol):** Sau mỗi Task hoàn thành, bắt buộc rà soát và cập nhật đồng bộ CẢ 3 TỆP trong [`.agents/memory/`](file:///c:/Users/Dell/Desktop/ShopFlow/.agents/memory) (`history.md`, `project_context.md`, `decisions.md`) và chạy `npm run memory:check` đạt 100% PASS trước khi commit và push lên GitHub.
