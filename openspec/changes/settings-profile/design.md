# Design

## Context

Hệ thống ShopFlow hiện tại đã hoàn thiện các module nghiệp vụ lõi (Sprints 1-5) bao gồm Authentication, Fanpage Management, Automation Rules, Post Scheduling, Live Inbox, Order Parsing AI, Products, Orders VietQR, và Sales Analytics. Tuy nhiên, phân hệ Quản trị Cài đặt (`/settings`) theo kế hoạch Sprint 6 (TASK-28) chưa được triển khai. Bảng cơ sở dữ liệu `users` trong PostgreSQL đã có sẵn các trường `id`, `email`, `password_hash`, `full_name`, `role`, `status`, `created_at`, `updated_at`. Xem chi tiết động lực tại `proposal.md` và hợp đồng hành vi tại `specs/system-settings/spec.md`.

## Goals / Non-Goals

**Goals:**
- Xây dựng cụm REST APIs `/api/v1/settings/*` tuân thủ Clean Architecture, Envelope `ApiResponse<T>`, quy ước `camelCase` 100% và bảo vệ bằng `authenticateToken` middleware.
- Thực hiện cơ chế đổi mật khẩu an toàn: xác thực mật khẩu hiện tại, kiểm tra độ phức tạp của mật khẩu mới (Zod regex), băm mật khẩu bằng Bcrypt (12 salt rounds), ngăn chặn đặt lại mật khẩu trùng mật khẩu hiện tại.
- Triển khai endpoint `/api/v1/settings/meta-limits` tổng hợp dữ liệu thực tế từ hệ thống: đếm cuộc gọi API Meta Graph dựa trên hoạt động 24h qua (`webhook_logs`, `messages_and_comments`, `posts_schedule`), tính toán % hạn ngạch (ngưỡng 4,800 cuộc gọi/24h), đo lường tốc độ tức thời và kiểm tra thời hạn Long-Lived Token của Fanpage.
- Xây dựng giao diện Cài đặt `/settings` chuẩn macOS Clean Utility với 3 Tabs chuyển đổi mượt mà (`ProfileSettingsTab`, `SecurityPasswordTab`, `ApiLimitsMonitorTab`).
- Tích hợp liên kết `/settings` vào Sidebar điều hướng chính của hệ thống.
- Đạt 100% bao phủ unit test và integration test theo tiêu chuẩn dự án.

**Non-Goals:**
- Chưa tích hợp dịch vụ SMS OTP hoặc khóa bảo mật FIDO2/WebAuthn vật lý trong phiên bản này.
- Không thay đổi DDL bảng `users` nhằm giữ an toàn tuyệt đối cho hệ thống dữ liệu hiện hữu.

## Decisions

### 1. Kiến Trúc Backend Settings Module
- **DTOs (`settings.dto.ts`):**
  - `UpdateProfileDtoSchema`: `{ fullName: z.string().trim().min(2).max(100) }`
  - `ChangePasswordDtoSchema`: `{ currentPassword: z.string().min(1), newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt') }`
- **Controller & Service (`settings.controller.ts`, `settings.service.ts`):**
  - Tách biệt rõ ràng tầng Controller (validate & đóng gói response) và tầng Service (nghiệp vụ mã hóa, xác minh DB, tính toán quota).
  - Tận dụng `UserRepository` và `auth.helper.ts` (`hashPassword`, `comparePassword`).
- **Thuật toán giám sát hạn ngạch Meta Graph API (`getMetaLimits`):**
  - Truy vấn số lượng sự kiện tương tác và phản hồi tự động trong 24h qua từ các bảng `webhook_logs`, `messages_and_comments`, `posts_schedule`.
  - Hạn mức tiêu chuẩn của Meta App: 4,800 calls/24h (tương đương 200 calls/giờ).
  - Tốc độ gọi API an toàn: `< 80 calls/phút` (trạng thái `safe`), `80 - 150` (trạng thái `warning`), `> 150` (trạng thái `exceeded`).
  - Kiểm tra hạn hiệu lực token từ bảng `connected_pages` (chu kỳ làm mới 60 ngày của Long-Lived Token).

### 2. Thiết Kế Giao Diện Frontend Next.js 14 (`/settings`)
- **Tổ chức Component:**
  - `src/app/(dashboard)/settings/page.tsx`: Khung điều khiển chính, header macOS Traffic Lights, breadcrumbs, Segmented Tabs bar.
  - `src/components/settings/profile-settings-tab.tsx`: Form cập nhật thông tin cá nhân, avatar visual picker, huy hiệu vai trò `Owner/Admin/Staff`.
  - `src/components/settings/security-password-tab.tsx`: Form đổi mật khẩu với Password Strength Indicator trực quan, cảnh báo bảo mật, danh sách phiên thiết bị.
  - `src/components/settings/api-limits-monitor-tab.tsx`: Biểu đồ đồng hồ đo hạn ngạch % SVG, bộ đếm cuộc gọi thời gian thực, nhãn kiểm tra Webhook HMAC-SHA256 (`timingSafeEqual`), và thông số Redis Idempotency TTL.
- **Quản lý State với Zustand (`settings.store.ts`):**
  - Lưu trữ `profile`, `metaLimits`, `isLoading`, `isUpdating`, `error`.
  - Áp dụng Defensive Data Parsing chống lỗi runtime (`null/undefined` check).

## Risks / Trade-offs

- **[Risk] Lộ thông tin mật khẩu trong log hệ thống**  
  → *Mitigation:* Cấm in `req.body.currentPassword` và `req.body.newPassword` ra console/log file; chỉ ghi log kết quả thành công hoặc mã lỗi chung.
- **[Risk] Tấn công dò mật khẩu (Brute-force) tại endpoint đổi mật khẩu**  
  → *Mitigation:* Endpoint đổi mật khẩu được bảo vệ bởi middleware JWT auth và tầng Rate Limiting có sẵn (`authLimiter` hoặc `globalApiLimiter`).
- **[Risk] Chênh lệch cách tính hạn mức Meta thực tế**  
  → *Mitigation:* Ghi rõ nhãn "Ước tính nội bộ theo lượt gọi Graph API" kèm thông số chi tiết của Webhook & Token để quản trị viên có cái nhìn khách quan.

## Migration Plan

- Không có script DDL Migration mới (zero-downtime).
- Endpoint mới được đăng ký tại `/api/v1/settings` độc lập, không làm ảnh hưởng đến các router hiện có.
