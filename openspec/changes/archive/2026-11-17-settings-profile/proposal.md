# Proposal

## Why

ShopFlow hiện thiếu trung tâm quản trị cài đặt tập trung, khiến chủ shop không thể cập nhật thông tin cá nhân, thay đổi mật khẩu bảo mật trực tiếp trên giao diện, và thiếu công cụ kỹ thuật để theo dõi mức độ tiêu thụ hạn ngạch Meta Graph API (ngăn ngừa lỗi Meta Error 613 Rate Limit) cũng như kiểm tra trạng thái hoạt động của hệ sinh thái Webhook/Redis. Việc bổ sung phân hệ Cài đặt Hệ thống và Hồ sơ (`/settings`) giúp hoàn thiện trải nghiệm vận hành khép kín và an toàn cho người dùng trước khi triển khai Production.

## What Changes

- **Backend API endpoints (`/api/v1/settings/*`):**
  - `GET /api/v1/settings/profile`: Lấy thông tin hồ sơ người dùng hiện tại (họ tên, email, vai trò, trạng thái, ngày tạo).
  - `PUT /api/v1/settings/profile`: Cập nhật thông tin hồ sơ cá nhân (`fullName`, số điện thoại, múi giờ, tên thương hiệu shop).
  - `PUT /api/v1/settings/password`: Đổi mật khẩu tài khoản với xác thực mật khẩu hiện tại, kiểm tra độ an toàn (tối thiểu 8 ký tự, chữ hoa, số, ký tự đặc biệt) và băm mật khẩu bằng Bcrypt (12 rounds).
  - `GET /api/v1/settings/meta-limits`: Trả về dữ liệu giám sát trực tiếp hạn mức Meta Graph API (bộ đếm cuộc gọi/giờ, hạn mức tối đa 4,800 calls/24h, % sử dụng, tốc độ gọi/phút, thời gian hết hạn token Fanpage, tình trạng Webhook HMAC và thời gian phản hồi trung bình).
- **Frontend Dashboard (`/settings`):**
  - Tuyến đường `frontend/src/app/(dashboard)/settings/page.tsx` với bố cục macOS Clean Utility Segmented Tabs:
    - Tab 1 (`ProfileSettingsTab`): Quản lý hồ sơ cá nhân, avatar, tên thương hiệu, múi giờ, email, số điện thoại.
    - Tab 2 (`SecurityPasswordTab`): Đổi mật khẩu an toàn, quản lý phiên đăng nhập thiết bị và nút đăng xuất phiên khác.
    - Tab 3 (`ApiLimitsMonitorTab`): Giám sát hạn ngạch Meta Graph API (đồng hồ đo % sử dụng, đếm ngược hạn mức 4,800 cuộc gọi, tốc độ request/phút, tình trạng Webhook signature và Redis Idempotency TTL).
  - Thêm mục Cài Đặt (`/settings`) vào thanh điều hướng Sidebar (`sidebar.tsx`) với icon `Settings`.
  - Store quản lý Zustand `settings.store.ts` kết nối với `apiClient`.
- **Kiểm thử tự động:**
  - Unit & Integration tests cho Backend Controllers, Services, DTO validation.
  - Unit tests cho Frontend Settings components và Zustand store.

## Capabilities

### New Capabilities
- `system-settings`: Quản lý hồ sơ tài khoản cá nhân, đổi mật khẩu bảo mật, và bảng điều khiển giám sát kỹ thuật hạn ngạch Meta Graph API (v19.0) cùng sức khỏe Webhook HMAC-SHA256.

### Modified Capabilities
*(Không có thay đổi đặc tả cho các capability hiện tại)*

## Impact
- **Backend:** Thêm module mới `src/api/routes/settings.routes.ts`, `src/api/controllers/settings.controller.ts`, `src/api/dtos/settings.dto.ts`, `src/core/services/settings.service.ts`. Tích hợp route vào `src/app.ts`.
- **Frontend:** Thêm trang `src/app/(dashboard)/settings/page.tsx`, components trong `src/components/settings/`, store `src/lib/settings.store.ts`, cập nhật Sidebar navigation.
- **Dependencies:** Sử dụng các thư viện sẵn có (`zod`, `bcryptjs`, `lucide-react`, `zustand`, `axios`), không phát sinh dependency mới ngoài hệ sinh thái.
