# Tasks

## 1. Backend DTOs & Domain Service

- [x] 1.1 Tạo `backend/src/api/dtos/settings.dto.ts` với Zod schemas cho `UpdateProfileDto` và `ChangePasswordDto`, xác thực bằng unit test DTO
- [x] 1.2 Xây dựng `backend/src/core/services/settings.service.ts` xử lý `getProfile`, `updateProfile`, `changePassword` (Bcrypt 12 rounds), `getMetaLimits` (thống kê hạn ngạch Meta Graph API 4,800 calls/24h và thời hạn token) và viết unit test `settings.service.test.ts`

## 2. Backend Controller & Routing Integration

- [x] 2.1 Xây dựng `backend/src/api/controllers/settings.controller.ts` xử lý 4 endpoints với format chuẩn `ApiResponse<T>`, viết unit test `settings.controller.test.ts`
- [x] 2.2 Xây dựng `backend/src/api/routes/settings.routes.ts`, gắn middleware `authenticateToken`, `validateRequest` và đăng ký route `/api/v1/settings` trong `backend/src/app.ts`
- [x] 2.3 Viết integration test `backend/src/api/routes/__tests__/settings.routes.test.ts` kiểm tra trọn vẹn 4 endpoints với Supertest

## 3. Frontend Store & Settings Components

- [x] 3.1 Xây dựng Zustand store `frontend/src/lib/settings.store.ts` tích hợp `apiClient`, defensive data parsing và viết unit test `settings.store.test.ts`
- [x] 3.2 Xây dựng component `frontend/src/components/settings/profile-settings-tab.tsx` quản lý hồ sơ cá nhân, avatar và thông tin thương hiệu
- [x] 3.3 Xây dựng component `frontend/src/components/settings/security-password-tab.tsx` hỗ trợ đổi mật khẩu an toàn kèm Password Strength Indicator
- [x] 3.4 Xây dựng component `frontend/src/components/settings/api-limits-monitor-tab.tsx` giám sát hạn ngạch Meta Graph API, tốc độ gọi/phút, trạng thái Webhook HMAC và Redis TTL
- [x] 3.5 Xây dựng màn hình `frontend/src/app/(dashboard)/settings/page.tsx` phong cách macOS Clean Utility Segmented Tabs và cập nhật Sidebar navigation `frontend/src/components/layout/sidebar.tsx`

## 4. Kiểm Thử Hệ Thống, Type-Check & Quality Gate

- [x] 4.1 Viết unit tests cho trang Settings `frontend/src/app/(dashboard)/settings/__tests__/settings.test.tsx`
- [x] 4.2 Chạy kiểm tra tĩnh toàn diện `npm run type-check` trên cả backend và frontend, đảm bảo 0 lỗi TypeScript
- [x] 4.3 Chạy toàn bộ test suites của backend và frontend, đảm bảo 100% pass và test coverage đạt chuẩn
- [x] 4.4 Thực hiện Triple-Memory Sync cập nhật `history.md`, `project_context.md`, `decisions.md` và chạy `npm run memory:check` đạt 100% PASS
