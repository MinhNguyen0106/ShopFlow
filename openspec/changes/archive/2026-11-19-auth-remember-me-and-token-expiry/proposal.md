# Proposal: Tuỳ Chỉnh Thời Hạn Token Theo Ghi Nhớ Đăng Nhập & Thu Hồi Token Khi Đăng Xuất

## Why

Hiện tại hệ thống ShopFlow cấp phát JWT tokens (Access Token & Refresh Token) với thời hạn mặc định cố định (24h cho access token và 7d cho refresh token), bất kể người dùng có tích chọn ô "Ghi nhớ phiên đăng nhập trên thiết bị này" trên biểu mẫu đăng nhập hay không. Đồng thời, khi người dùng bấm Đăng xuất (Logout), hệ thống chỉ xóa token ở phía client (localStorage) mà chưa có cơ chế thu hồi / vô hiệu hóa token tức thì (Token Blacklist) trên máy chủ, dẫn đến nguy cơ token cũ vẫn hợp lệ nếu bị lộ lọt.

Thay đổi này giải quyết hai vấn đề:
1. Cho phép linh hoạt thời hạn phiên làm việc: Token tồn tại **1 ngày** (24h) khi không ghi nhớ, và kéo dài **30 ngày** (30d) khi chủ shop tích chọn "Ghi nhớ phiên đăng nhập trên thiết bị này".
2. Bảo mật chặt chẽ: Khi người dùng bấm Đăng xuất (Logout), token hiện tại sẽ bị vô hiệu hóa ngay lập tức trên máy chủ (Server-side Token Blacklist qua Redis với TTL tương ứng thời gian còn lại của token).

## What Changes

- **Backend Authentication DTO & Controller:**
  - Bổ sung trường `rememberMe?: boolean` (mặc định `false`) vào `LoginDtoSchema`.
  - Cập nhật `POST /api/v1/auth/login` để tiếp nhận `rememberMe` và truyền vào `AuthService`.
  - Thêm endpoint mới `POST /api/v1/auth/logout` (yêu cầu đăng nhập) để tiếp nhận access token / refresh token hiện tại và đưa vào danh sách đen (Blacklist).
- **Token Generation & Expiry Engine:**
  - Cập nhật hàm tạo token (`generateTokens` trong `auth.helper.ts` và `AuthService`):
    - Khi `rememberMe = false`: Access Token hết hạn sau 1 ngày (`24h`), Refresh Token hết hạn sau 1 ngày (`24h`).
    - Khi `rememberMe = true`: Access Token hết hạn sau 30 ngày (`30d`), Refresh Token hết hạn sau 30 ngày (`30d`).
- **Token Blacklisting & Middleware Enforcement:**
  - Xây dựng tiện ích hoặc service quản lý Token Blacklist lưu trên Redis với tiền tố `blacklist:token:<tokenHash>` và TTL tự động hết hạn theo thời hạn còn lại của JWT.
  - Cập nhật middleware `authenticateToken` (`auth.middleware.ts`): Sau khi giải mã chữ ký JWT hợp lệ, kiểm tra xem token có nằm trong Blacklist Redis hay không. Nếu có, từ chối với `401 Unauthorized` ("Phiên đăng nhập đã kết thúc do đăng xuất").
- **Frontend Integration:**
  - Cập nhật hàm `login` trong `auth.store.ts` để truyền cờ `rememberMe` (lấy từ form đăng nhập) xuống backend endpoint `/auth/login`.
  - Cập nhật hàm `logout` trong `auth.store.ts` để gọi `POST /api/v1/auth/logout` lên máy chủ trước khi dọn dẹp `localStorage`.

## Capabilities

### New Capabilities
- `user-auth`: Quản lý xác thực người dùng, cấp phát token động theo cờ `rememberMe` (1 ngày vs 30 ngày) và thu hồi tức thì phiên đăng nhập (Token Invalidation/Blacklist) khi đăng xuất.

### Modified Capabilities
<!-- Không có capability cũ nào thay đổi requirements cơ bản -->

## Impact

- **API Contracts:** Bổ sung trường `rememberMe` vào payload `POST /api/v1/auth/login`; bổ sung endpoint `POST /api/v1/auth/logout`.
- **Backend Components:** `auth.dto.ts`, `auth.controller.ts`, `auth.service.ts`, `auth.routes.ts`, `auth.helper.ts`, `auth.middleware.ts`, `redis.client.ts`.
- **Frontend Components:** `auth.store.ts`, `login/page.tsx`.
- **Infrastructure:** Sử dụng Redis sẵn có trong cụm Docker/Dev để lưu trữ token blacklist với TTL.
