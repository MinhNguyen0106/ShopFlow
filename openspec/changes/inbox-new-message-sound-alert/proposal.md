# Proposal: Phát Âm Thanh "Ting" Thông Báo Khi Khách Hàng Nhắn Tin Mới

## Why

Trong quá trình trực bán hàng và phản hồi tin nhắn khách hàng trên ShopFlow, chủ shop và nhân viên thường xuyên phải chuyển đổi qua lại giữa các tab trình duyệt, soạn thảo bài viết, hoặc xử lý đơn hàng trên hệ thống. Khi khách hàng nhắn tin hoặc bình luận mới, nếu chỉ có thay đổi số đếm hiển thị trên giao diện mà không có tín hiệu âm thanh cảnh báo, nhân viên rất dễ bỏ lỡ tin nhắn khẩn cấp, dẫn đến việc phản hồi chậm trễ và giảm tỷ lệ chốt đơn. Việc bổ sung âm thanh chuông "ting" (chime alert) trong trẻo, tức thì ngay khi có tin nhắn từ khách hàng đến là tính năng thiết yếu giúp nâng cao tốc độ phản hồi và trải nghiệm vận hành.

## What Changes

- **Hệ thống Phát Âm Thanh Thông Báo Web Audio API (`SoundNotificationService` / `soundNotifier`):**
  - Xây dựng tiện ích tổng hợp âm thanh chuông "ting" chuẩn qua Web Audio API (`AudioContext`) với tần số kép hài hòa (sine wave 880Hz -> 1320Hz kết hợp exponential decay) êm dịu, hiện đại, không phụ thuộc tệp âm thanh tải ngoài (zero network dependency, không lo lỗi 404 hay chậm trễ mạng).
  - Tự động kích hoạt unlock `AudioContext` sau tương tác đầu tiên của người dùng để tuân thủ chính sách Autoplay của trình duyệt.
- **Bộ Điều Tiết Âm Thanh & Chống Spam (Sound Throttling & Debounce):**
  - Giới hạn tần suất phát âm thanh (tối thiểu cách nhau 1.5 giây giữa các lần reo chuông) để chống tình trạng chói tai hoặc quá tải âm thanh khi khách hàng gửi liên tiếp nhiều tin nhắn ngắn trong vài giây.
  - Bộ lọc chỉ phát âm thanh khi tin nhắn nhận được là từ khách hàng (`sender_type === 'customer'`), tuyệt đối không phát âm thanh khi tin nhắn do nhân viên/shop gửi đi hoặc tin nhắn echo.
- **Nút Bật / Tắt Âm Thanh Thông Báo (Sound Mute/Unmute Toggle):**
  - Bổ sung nút chuyển đổi bật/tắt chuông thông báo (kèm icon loa `Volume2` / `VolumeX`) trên thanh công cụ Hộp thư Live Chat và lưu trạng thái ưu tiên của người dùng vào `localStorage` (`shopflow_sound_notification_enabled`).
- **Tích Hợp Tự Động Vào Luồng Nhận Tin Nhắn Realtime:**
  - Kết nối tiện ích phát âm thanh vào hàm tiếp nhận sự kiện WebSocket `handleSocketNewItem` trong `useInboxStore` và sự kiện `NEW_INBOX_ITEM` trong Live Chat Inbox.

## Capabilities

### New Capabilities
- `centralized-inbox`: Nền tảng quản lý tin nhắn và hội thoại tập trung, bao gồm nhận tin nhắn thời gian thực qua WebSocket, tự động phát âm thanh chuông "ting" thông báo khi có tin nhắn từ khách hàng, điều tiết tần suất âm thanh, và quản lý tùy chọn bật/tắt âm thanh của nhân viên.

### Modified Capabilities
<!-- Không có capability hiện có nào bị thay đổi spec-level requirements -->

## Impact

- **Mã nguồn Frontend:**
  - `frontend/src/lib/sound-notifier.ts`: Triển khai singleton phát âm thanh "ting" bằng Web Audio API kèm cơ chế unlock autoplay, debounce và mute state.
  - `frontend/src/lib/inbox.store.ts`: Kích hoạt `soundNotifier.playNotificationSound()` khi `handleSocketNewItem` tiếp nhận tin nhắn từ `sender_type === 'customer'`.
  - `frontend/src/components/inbox/column-channels.tsx` hoặc Topbar/Header của Inbox: Bổ sung nút toggle Bật/Tắt chuông thông báo.
- **Mã nguồn Backend:** Không có breaking change ở API hay DB schema; giữ nguyên cấu trúc phát sóng WebSocket `NEW_INBOX_ITEM`.
- **Phụ thuộc bên ngoài:** Zero external dependencies (tận dụng Web Audio API native của trình duyệt).
