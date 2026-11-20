# Tasks

## 1. Tiện Ích Phát Âm Thanh Web Audio API (`SoundNotifier`)

- [ ] 1.1 Xây dựng tiện ích singleton `SoundNotifier` trong `frontend/src/lib/sound-notifier.ts` sử dụng Web Audio API tổng hợp âm thanh chuông "ting" (sine wave 880Hz -> 1320Hz, exponential decay), hỗ trợ cơ chế unlock autoplay qua user gesture, throttle 1.5s chống dồn dập, và quản lý bật/tắt (mute/unmute) lưu vào `localStorage`.
- [ ] 1.2 Viết unit test toàn diện cho `SoundNotifier` trong `frontend/src/lib/__tests__/sound-notifier.test.ts` kiểm tra: tổng hợp âm thanh đúng nốt, cơ chế throttle bỏ qua âm thanh nếu cách nhau dưới 1.5s, không phát âm thanh khi ở trạng thái mute, và tự động gọi resume context khi unlock.

## 2. Tích Hợp Realtime Inbox Store & Luồng Tiếp Nhận Tin Nhắn

- [ ] 2.1 Cập nhật `handleSocketNewItem` trong `frontend/src/lib/inbox.store.ts` để kích hoạt `soundNotifier.playNotificationSound()` khi tin nhắn mới đến có `sender_type === 'customer'` và bỏ qua khi tin nhắn từ trang/nhân viên (`sender_type === 'page'`); xác minh bằng unit test trong `inbox.store.test.ts`.
- [ ] 2.2 Đăng ký khởi tạo unlock autoplay trong `frontend/src/app/(dashboard)/inbox/page.tsx` (hoặc layout chính `mac-window-shell.tsx`) để đảm bảo `AudioContext` luôn sẵn sàng hoạt động ngay sau tương tác đầu tiên của người dùng.

## 3. Giao Diện Điều Khiển Bật/Tắt Âm Thanh (Sound Toggle UI)

- [ ] 3.1 Bổ sung nút chuyển đổi Bật/Tắt chuông thông báo (kèm icon `Volume2` khi bật và `VolumeX` khi tắt) trên thanh tiêu đề của `ColumnChannels` (`column-channels.tsx`), hiển thị tooltip trạng thái và phát âm thanh kiểm tra ngắn khi người dùng bật lại; xác minh bằng component test trong `inbox-components.test.tsx`.

## 4. Quality Gate & Thẩm Định Chất Lượng

- [ ] 4.1 Chạy toàn bộ test suites frontend liên quan: `npm test --workspace=frontend -- sound-notifier` và `npm test --workspace=frontend -- inbox`, đảm bảo 100% tests PASSED.
- [ ] 4.2 Chạy `npm run type-check` và `npm run memory:check`, đảm bảo 0 lỗi kiểu dữ liệu và bộ ba bộ nhớ (.agents/memory/) hoàn toàn nhất quán.
