# Tasks

## 1. CI Pipeline Workflow (GitHub Actions)

- [x] 1.1 Khởi tạo `.github/workflows/ci.yml` với trigger `pull_request` (target `main`) và `push` (branch `main`), phân chia các jobs song song (`quality-gate`, `test-backend`, `test-frontend`, `build-check`) cùng caching `actions/cache@v4` cho npm và `.next/cache`.
- [x] 1.2 Thẩm định cú pháp tệp `ci.yml`, kiểm tra các câu lệnh thực thi `npm run lint`, `npm run type-check`, `npm run memory:check`, `npm test` và `npm run build` đảm bảo tương thích tuyệt đối với cấu trúc monorepo.

## 2. Deploy Pipeline Workflow (Container Build & Registry Push)

- [x] 2.1 Khởi tạo `.github/workflows/deploy.yml` với trigger `push` vào `main` và `workflow_dispatch`, cấu hình Docker Buildx, đăng nhập GitHub Container Registry (`ghcr.io`), build multi-stage Docker images cho `backend` và `frontend`, gán tag commit SHA & `latest`, và push lên GHCR.
- [x] 2.2 Bổ sung bước deploy an toàn với health check verification kiểm tra endpoint `/health` (backend HTTP 200) và `/` (frontend HTTP 200) kèm cơ chế rollback khi container không vượt qua kiểm tra sức khỏe.

## 3. Production Runbook Documentation

- [x] 3.1 Biên soạn tài liệu hướng dẫn vận hành chi tiết `docs/07_PRODUCTION_RUNBOOK.md`: kiến trúc cụm 5 container Production (`docker-compose.prod.yml`), hướng dẫn cấu hình `.env.production`, quy trình khởi chạy, quản lý & xoay vòng secrets, kiểm tra logs & giám sát tài nguyên, và quy trình bảo trì định kỳ.
- [x] 3.2 Cập nhật danh mục tài liệu hệ thống trong `docs/00_INDEX.md` để liên kết tới `07_PRODUCTION_RUNBOOK.md`.

## 4. Disaster Recovery Plan & Backup Scripts

- [x] 4.1 Biên soạn tài liệu kế hoạch phòng ngừa & ứng cứu thảm họa `docs/08_DISASTER_RECOVERY.md`: cam kết chỉ số RTO (< 30 phút) và RPO (< 1 giờ), chiến lược sao lưu định kỳ PostgreSQL (`pg_dump`) và Redis (AOF/RDB), quy trình rollback phiên bản tức thời, và các kịch bản khắc phục sự cố nghiêm trọng.
- [x] 4.2 Xây dựng script sao lưu tự động `scripts/backup-db.sh` và script phục hồi mẫu `scripts/restore-db.sh` hỗ trợ nén gzip, xoay vòng lưu trữ 30 ngày và kiểm tra tính toàn vẹn dữ liệu.
- [x] 4.3 Cập nhật danh mục tài liệu hệ thống trong `docs/00_INDEX.md` để liên kết tới `08_DISASTER_RECOVERY.md`.

## 5. Verification & Sprint Quality Gates

- [x] 5.1 Thực hiện kiểm thử toàn diện trên máy cục bộ: `npm run lint`, `npm run type-check`, `npm test` trên cả backend và frontend, `npm run memory:check` đạt 100% PASS.
- [x] 5.2 Cập nhật đồng bộ Triple-Memory (`history.md`, `project_context.md`, `decisions.md`) bổ sung Architecture Decision Record (ADR) mới cho kiến trúc CI/CD & Production Deployment.
