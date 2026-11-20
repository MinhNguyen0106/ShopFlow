# Tasks: Tuỳ Chỉnh Thời Hạn Token Theo Ghi Nhớ Đăng Nhập & Thu Hồi Token Khi Đăng Xuất

## 1. Backend Token & Remember Me Enhancements

- [x] 1.1 Cập nhật `LoginDtoSchema` trong `backend/src/api/dtos/auth.dto.ts` để tiếp nhận `rememberMe?: boolean` (mặc định `false`) và cập nhật `auth.dto.test.ts` xác minh validation
- [x] 1.2 Mở rộng `generateTokens` trong `backend/src/utils/auth.helper.ts` nhận tham số `rememberMe?: boolean` (thời hạn 24h khi false và 30d khi true) và viết unit test trong `auth.helper.test.ts`
- [x] 1.3 Cập nhật `AuthService.login` và `AuthService.refreshToken` trong `backend/src/core/services/auth.service.ts` để truyền `rememberMe` và kế thừa thời hạn của phiên; viết unit test trong `auth.service.test.ts`

## 2. Server-side Token Blacklisting qua Redis & Logout Endpoint

- [x] 2.1 Xây dựng service quản lý Token Blacklist qua Redis (`backend/src/core/services/token-blacklist.service.ts`) lưu mã băm SHA-256 kèm TTL tự động; viết unit test xác minh
- [x] 2.2 Cập nhật middleware `authenticateToken` trong `backend/src/api/middlewares/auth.middleware.ts` để kiểm tra Redis blacklist và từ chối 401 khi token đã đăng xuất; cập nhật unit test trong `auth.middleware.test.ts`
- [x] 2.3 Thêm endpoint `POST /api/v1/auth/logout` trong `backend/src/api/controllers/auth.controller.ts` và `auth.routes.ts` để đưa access token vào blacklist; viết test trong `auth.routes.test.ts`

## 3. Frontend Store & Form Integration

- [x] 3.1 Cập nhật hàm `login` trong `frontend/src/lib/auth.store.ts` tiếp nhận tham số `rememberMe?: boolean` và truyền lên `apiClient.post('/auth/login', { email, password, rememberMe })`
- [x] 3.2 Cập nhật `frontend/src/app/(auth)/login/page.tsx` để truyền giá trị `data.rememberMe` từ form vào `login(data.email, data.password, data.rememberMe)`
- [x] 3.3 Cập nhật hàm `logout` trong `frontend/src/lib/auth.store.ts` đảm bảo gọi `apiClient.post('/auth/logout')` lên server và làm sạch `localStorage`; cập nhật test `auth.store.test.ts`

## 4. End-to-End Verification & Quality Gates

- [x] 4.1 Chạy toàn bộ test suites backend (`npm run test:unit --prefix backend`) đạt 100% PASS
- [x] 4.2 Chạy toàn bộ test suites frontend và type-check (`npm run test --prefix frontend`, `npm run type-check --prefix frontend`) đạt 100% PASS
