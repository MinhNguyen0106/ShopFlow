# Proposal

## Why

ShopFlow đã hoàn tất toàn bộ các tính năng cốt lõi cho phiên bản 1.0 (Bento Dashboard, Live Chat Inbox, Quản lý đơn hàng, AI Trích xuất đơn hàng, Đa Fanpage & RBAC, CRM Khách hàng và Cài đặt hồ sơ & Meta limits). Để đảm bảo sản phẩm có thể được triển khai lên môi trường Production một cách tự động, an toàn, ổn định và có thể phục hồi nhanh chóng khi xảy ra sự cố, hệ thống cần một đường ống CI/CD chuẩn hóa với GitHub Actions, quy trình kiểm soát chất lượng tự động trên PR, cơ chế build multi-stage Docker images và triển khai tự động, cùng tài liệu vận hành chi tiết (Production Runbook & Disaster Recovery Plan).

## What Changes

- **CI Pipeline (`.github/workflows/ci.yml`)**:
  - Tự động kích hoạt khi có Pull Request mở hướng vào `main` hoặc push trực tiếp vào `main`.
  - Cấu hình ma trận kiểm thử (Test Matrix) cho cả `backend` và `frontend`.
  - Thực hiện các khâu kiểm soát chất lượng nghiêm ngặt: `lint`, `type-check` (`tsc --noEmit`), chạy toàn bộ Unit Tests & Integration Tests, kiểm tra Triple-Memory (`npm run memory:check`), và build thử nghiệm cả Next.js lẫn Express.js.
  - Tích hợp caching cho `node_modules` và `.next/cache` để tối ưu thời gian chạy dưới 3 phút.
- **Deploy Pipeline (`.github/workflows/deploy.yml`)**:
  - Kích hoạt tự động khi merge vào `main` hoặc trigger thủ công (`workflow_dispatch`).
  - Build multi-stage Docker images cho `backend` và `frontend` gán tag Git SHA và `latest`.
  - Đăng nhập và đẩy image lên GitHub Container Registry (GHCR) hoặc DockerHub an toàn bằng secrets.
  - Hỗ trợ triển khai cập nhật qua SSH runner / Webhook tự động với chiến lược rolling update và kiểm tra health check trước khi hoàn tất.
- **Tài liệu Hướng dẫn Vận hành & Phục hồi Thảm họa**:
  - Tạo `docs/07_PRODUCTION_RUNBOOK.md`: Hướng dẫn chi tiết triển khai cụm container (`docker-compose.prod.yml`), cấu hình biến môi trường production, xoay vòng secrets (JWT, Meta App Secret), giám sát logs, và quy trình bảo trì định kỳ.
  - Tạo `docs/08_DISASTER_RECOVERY.md`: Kế hoạch ứng cứu sự cố, chiến lược sao lưu định kỳ PostgreSQL (pg_dump) & Redis (AOF/RDB), quy trình rollback phiên bản tức thời khi deploy lỗi, và kịch bản khôi phục dữ liệu sau sự cố thảm họa.

## Capabilities

### New Capabilities
- `cicd-deployment`: Tự động hóa kiểm thử mã nguồn liên tục (CI) với GitHub Actions, đóng gói Docker images phân tầng, triển khai tự động lên hạ tầng production (CD), cùng quy chuẩn vận hành và phục hồi thảm họa.

### Modified Capabilities
*(Không có)*

## Impact

- **Mã nguồn & Cấu hình**: Bổ sung thư mục `.github/workflows/` (`ci.yml`, `deploy.yml`), tối ưu các script trong `package.json` nếu cần.
- **Tài liệu dự án**: Tạo mới `docs/07_PRODUCTION_RUNBOOK.md` và `docs/08_DISASTER_RECOVERY.md`, cập nhật `docs/00_INDEX.md`.
- **Hệ thống & Triển khai**: Tối ưu quy trình đóng gói container cho `backend/Dockerfile` và `frontend/Dockerfile`, đảm bảo tương thích hoàn hảo với `docker-compose.prod.yml`.
