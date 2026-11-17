# Design

## Context

ShopFlow là dự án Monorepo gồm Express.js Backend (`backend/`), Next.js 14 Frontend (`frontend/`), và các công cụ quản lý cấu hình dữ liệu, bộ ba bộ nhớ `.agents/memory/`. Trước đây hệ thống đã có `backend/Dockerfile`, `frontend/Dockerfile` (standalone mode), và `docker-compose.prod.yml` (TASK-26), nhưng chưa có quy trình kiểm thử tự động trên GitHub Actions (CI) và quy trình build & push container images (CD) chuẩn mực, cũng như chưa có bộ tài liệu vận hành chi tiết `docs/07_PRODUCTION_RUNBOOK.md` và `docs/08_DISASTER_RECOVERY.md`.

Xem thêm [proposal.md](proposal.md) để hiểu bối cảnh và động lực thực hiện.

## Goals / Non-Goals

**Goals:**
- Thiết lập CI Pipeline hoàn chỉnh (`.github/workflows/ci.yml`) với ma trận kiểm thử song song, caching tối ưu, ngăn chặn 100% mã lỗi merge vào `main`.
- Thiết lập CD Pipeline (`.github/workflows/deploy.yml`) đóng gói Docker images đa tầng, tag Git SHA, push lên GitHub Container Registry (GHCR), và kịch bản deploy an toàn với health check verification.
- Biên soạn tài liệu vận hành Production chi tiết (`docs/07_PRODUCTION_RUNBOOK.md`) và kế hoạch phòng ngừa/khôi phục thảm họa (`docs/08_DISASTER_RECOVERY.md`).
- Đồng bộ mục lục tài liệu hệ thống tại `docs/00_INDEX.md`.

**Non-Goals:**
- Không thuê máy chủ Kubernetes phức tạp (giữ nguyên hạ tầng Docker Compose tối ưu cho SME/B2C theo đúng kiến trúc của ShopFlow).
- Không can thiệp sửa đổi các logic nghiệp vụ (CRM, Webhooks, Orders) đã ổn định.

## Decisions

### 1. Phân Tách CI Thành Các Jobs Song Song với Cache Tối Ưu
- **Quyết định:** Trong `.github/workflows/ci.yml`, phân chia thành 3 jobs chạy song song:
  1. `quality-gate`: Chạy `lint`, `type-check`, và `memory:check` (kiểm tra Triple-Memory).
  2. `test-backend`: Chạy toàn bộ unit & integration tests của Express backend trên môi trường Node 20.
  3. `test-frontend`: Chạy toàn bộ tests của Next.js frontend (Vitest / React Testing Library).
  4. `build-check`: Chạy `build:backend` và `build:frontend` để kiểm chứng bundle sau khi các tests hoàn thành.
- **Lý do:** Tận dụng tối đa khả năng chạy song song của GitHub Actions runners, rút ngắn thời gian phản hồi kiểm thử PR xuống dưới 3 phút.
- **Phương án thay thế cân nhắc:** Chạy tuần tự 1 job duy nhất (quá chậm, khó phát hiện lỗi phân tầng).

### 2. Sử Dụng GitHub Container Registry (GHCR) Làm Registry Mặc Định
- **Quyết định:** Sử dụng `ghcr.io/${{ github.repository }}/backend` và `ghcr.io/${{ github.repository }}/frontend`.
- **Lý do:** Tích hợp trực tiếp với quyền `GITHUB_TOKEN` sẵn có trong repository, không cần cấu hình thêm secret bên ngoài của bên thứ 3 (như DockerHub), bảo mật và quản lý phân quyền theo đúng GitHub Repo.
- **Phương án thay thế cân nhắc:** DockerHub hoặc AWS ECR (đòi hỏi secrets token riêng, phức tạp khi setup).

### 3. Chiến Lược Deploy Tự Động Kèm Health Check Verification & Safe Rollback
- **Quyết định:** Trong workflow deploy, cung cấp step deploy qua SSH/Webhook kèm lệnh curl kiểm tra `/health` (backend HTTP 200) và `/` (frontend HTTP 200) với retry 5 lần (khoảng cách 10s). Nếu thất bại, tự động hủy bỏ và rollback container trước đó.
- **Lý do:** Đảm bảo tính sẵn sàng cao (High Availability), tránh trường hợp deploy container lỗi làm gián đoạn hệ thống.

### 4. Xây Dựng Bộ Đôi Tài Liệu Vận Hành & Khôi Phục Thảm Họa Chuyên Sâu
- **Quyết định:** Biên soạn `docs/07_PRODUCTION_RUNBOOK.md` (hướng dẫn vận hành ngày thường, checklist deploy, phân giải sự cố phổ biến) và `docs/08_DISASTER_RECOVERY.md` (chiến lược sao lưu database, RTO < 30 phút, RPO < 1 giờ, quy trình phục hồi khẩn cấp).
- **Lý do:** Giúp đội ngũ vận hành hoặc bất kỳ kỹ sư nào tiếp quản dự án đều có thể triển khai và ứng cứu sự cố chuẩn mực.

## Risks / Trade-offs

- **[Risk] GitHub Actions Runner hết thời gian / ngốn tài nguyên khi build Next.js**  
  → *Mitigation:* Bật caching `actions/cache@v4` cho `.next/cache` và `~/.npm`.
- **[Risk] Lộ secrets biến môi trường trên GitHub Actions**  
  → *Mitigation:* Tuyệt đối không echo bí mật trong workflow; sử dụng GitHub Repository Secrets (`${{ secrets.ENV_NAME }}`) và file `.env.production` mẫu không chứa secrets thật.
- **[Risk] Lỗi quyền truy cập GHCR (`403 Forbidden`)**  
  → *Mitigation:* Cấu hình `permissions: contents: read, packages: write` đầy đủ trong workflow `deploy.yml`.

## Migration Plan

1. Thiết lập `.github/workflows/ci.yml`.
2. Thiết lập `.github/workflows/deploy.yml`.
3. Kiểm tra cú pháp YAML và tính tương thích với `package.json` scripts.
4. Soạn thảo `docs/07_PRODUCTION_RUNBOOK.md` và `docs/08_DISASTER_RECOVERY.md`.
5. Cập nhật `docs/00_INDEX.md`.
6. Thực hiện test CI cục bộ (type-check, tests, memory:check) trước khi commit & push.
