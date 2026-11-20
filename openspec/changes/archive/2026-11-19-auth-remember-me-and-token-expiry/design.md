# Design: Động Hóa Thời Hạn JWT & Thu Hồi Phiên Đăng Nhập Qua Redis Blacklist

## Context

Hệ thống ShopFlow hiện tại cấp phát JWT với cấu hình thời hạn tĩnh trong file môi trường (`env.JWT_ACCESS_EXPIRY = '24h'`, `env.JWT_REFRESH_EXPIRY = '7d'`). Khi người dùng đăng xuất, ứng dụng mới chỉ xóa token ở phía `localStorage` máy khách, chưa có cơ chế thu hồi token ở tầng máy chủ (Server-side Invalidation). Hệ sinh thái của ShopFlow đã có sẵn hạ tầng Redis 7 phục vụ hàng đợi BullMQ, do đó có thể tận dụng Redis để lưu trữ danh sách đen token (Token Blacklist) với độ trễ siêu thấp O(1).

Chi tiết động lực và yêu cầu nghiệp vụ được mô tả tại [proposal.md](file:///c:/Users/Dell/Desktop/ShopFlow/openspec/changes/auth-remember-me-and-token-expiry/proposal.md) và [spec.md](file:///c:/Users/Dell/Desktop/ShopFlow/openspec/changes/auth-remember-me-and-token-expiry/specs/user-auth/spec.md).

## Goals / Non-Goals

**Goals:**
- Mở rộng `generateTokens(user, rememberMe?: boolean)` để cấp phát cặp token theo thời hạn tương ứng:
  - `rememberMe = false` hoặc không truyền: thời hạn là **24 giờ** (`24h`).
  - `rememberMe = true`: thời hạn là **30 ngày** (`30d`).
- Cung cấp endpoint `POST /api/v1/auth/logout` để thu hồi token: tính toán thời gian sống còn lại của token (`ttl = exp - now`) và lưu mã băm SHA-256 của token vào Redis với TTL tương ứng.
- Cập nhật middleware `authenticateToken` kiểm tra token trong Redis Blacklist trước khi cho phép xử lý tiếp.
- Cập nhật luồng Frontend (`login/page.tsx` và `auth.store.ts`): gửi cờ `rememberMe` khi đăng nhập và gọi API `/auth/logout` khi đăng xuất.

**Non-Goals:**
- Không thay đổi bảng cơ sở dữ liệu `users` trong MySQL / Prisma.
- Không thay đổi thuật toán ký JWT (HMAC-SHA256) và các claims cơ bản (`sub`, `email`, `role`).

## Decisions

### 1. Kiến trúc lưu trữ Token Blacklist trên Redis
- **Giải pháp lựa chọn:** Khi đăng xuất, băm token bằng SHA-256 rồi lưu vào Redis theo khóa `bl:token:<sha256_hash>` với giá trị `"1"` và thời gian sống `EX` bằng chính số giây còn lại cho đến khi token tự hết hạn (`payload.exp - Math.floor(Date.now() / 1000)`).
- **Lý do:**
  - Tiết kiệm bộ nhớ RAM của Redis so với việc lưu toàn bộ chuỗi JWT dài hàng trăm ký tự.
  - Ngăn ngừa việc token thô bị đọc trộm nếu Redis bị giám sát log.
  - TTL tự động giúp dọn rác hoàn toàn tự động khi token đã quá hạn, không cần cron job xóa định kỳ.
- **Phương án thay thế đã cân nhắc:**
  - *Lưu vào bảng MySQL `revoked_tokens`:* Bị loại vì thao tác I/O đĩa chậm hơn nhiều so với Redis trong mỗi request qua middleware xác thực.

### 2. Xử lý thời hạn động cho Access Token & Refresh Token
- **Giải pháp lựa chọn:**
  - Khi `rememberMe = false`: Access Token hết hạn sau `24h` và Refresh Token hết hạn sau `24h`.
  - Khi `rememberMe = true`: Access Token hết hạn sau `30d` và Refresh Token hết hạn sau `30d`.
  - Trong payload của Refresh Token bổ sung claim `remember_me: boolean` để khi gọi endpoint `/refresh-token`, token mới sinh ra tiếp tục kế thừa đúng thời hạn 30 ngày hoặc 24 giờ của phiên ban đầu.
- **Phương án thay thế đã cân nhắc:**
  - *Luôn giữ Access Token 15 phút và chỉ kéo dài Refresh Token:* Mặc dù là chuẩn OAuth2 lý thuyết, người dùng yêu cầu rõ ràng: "token sẽ tồn tại trong 1 ngày còn khi nhấn vào ghi nhớ thì sẽ tồn tại trong 30 ngày". Phương án cấp phát trực tiếp theo yêu cầu đảm bảo tính trực quan và đơn giản nhất cho người dùng.

### 3. Khả năng phục hồi khi Redis gặp sự cố (Fault Tolerance)
- **Giải pháp lựa chọn:** Trong middleware `authenticateToken`, việc truy vấn Redis Blacklist được bọc trong khối `try/catch`. Nếu Redis tạm thời mất kết nối hoặc quá tải, middleware sẽ ghi log cảnh báo và cho phép token hợp lệ theo chữ ký mật mã tiếp tục truy cập (Fail-Open cho chức năng blacklist) để tránh làm tê liệt 100% người dùng đăng nhập hệ thống.

## Risks / Trade-offs

- **[Risk] RAM của Redis tăng khi có số lượng lớn người dùng đăng xuất**  
  $\rightarrow$ **Mitigation:** TTL được gán chính xác bằng thời gian còn lại của token; sau khi token hết hạn, Redis tự động giải phóng RAM. Băm SHA-256 giúp kích thước mỗi khóa chỉ khoảng 64 ký tự.
- **[Risk] Thêm 1 truy vấn Redis trong mỗi request HTTP được bảo vệ**  
  $\rightarrow$ **Mitigation:** Lệnh `EXISTS` trong Redis là thao tác O(1) trong bộ nhớ RAM, độ trễ thực tế < 1ms, hoàn toàn đáp ứng SLA của ShopFlow.
