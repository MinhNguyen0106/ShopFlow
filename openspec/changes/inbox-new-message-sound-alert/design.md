# Design: Hệ Thống Phát Âm Thanh Thông Báo Tin Nhắn Web Audio API

## Context

Xem [proposal.md](proposal.md) để biết bối cảnh và lý do thay đổi.

Hiện tại, hệ thống ShopFlow đã có kênh truyền thông thời gian thực qua Socket.io:
- Khi có tin nhắn từ khách hàng trên Facebook Messenger hoặc bình luận bài viết, backend phát sóng sự kiện `NEW_INBOX_ITEM`.
- Frontend tiếp nhận sự kiện trong `frontend/src/lib/inbox.store.ts` (`handleSocketNewItem`) và `frontend/src/app/(dashboard)/inbox/page.tsx`.
- Tuy nhiên, hệ thống mới chỉ cập nhật danh sách tin nhắn và tăng số đếm chưa đọc trên giao diện mà chưa có âm thanh cảnh báo tới nhân viên trực chat.

Trình duyệt hiện đại áp dụng chính sách Autoplay nghiêm ngặt: `AudioContext` khởi tạo sẽ bị đưa vào trạng thái `suspended` nếu chưa có thao tác tương tác của người dùng (user gesture: click, touch, keydown).

## Goals / Non-Goals

**Goals:**
- Phát âm thanh chuông "ting" (chime tone) trong trẻo, êm dịu ngay khi khách hàng gửi tin nhắn mới.
- Sử dụng Web Audio API native tổng hợp âm thanh bằng phần cứng âm thanh của thiết bị, đạt độ trễ 0ms, không phụ thuộc tệp âm thanh tải ngoài (zero network dependency), không lo lỗi 404.
- Tự động mở khóa (unlock) `AudioContext` sau tương tác người dùng đầu tiên trên trang.
- Điều tiết tần suất (throttle 1.5s) để chống dồn dập âm thanh khi khách hàng gửi liên tục nhiều tin nhắn ngắn.
- Cho phép người dùng bật/tắt (Mute/Unmute) chuông thông báo và lưu trạng thái vào `localStorage`.

**Non-Goals:**
- Không hỗ trợ tải tệp âm thanh tùy chỉnh (MP3/WAV upload) để tránh rủi ro bảo mật và phình dữ liệu.
- Không phát âm thanh thông báo cho các hành động do chính nhân viên/shop thực hiện (gửi tin nhắn, trả lời bình luận, hoặc tin nhắn echo).

## Decisions

### 1. Web Audio API Oscillator vs Tệp File Âm Thanh Ngoài (MP3/WAV)
- **Lựa chọn:** Sử dụng Web Audio API (`AudioContext`) với bộ tạo dao động hình sin (Sine Wave Oscillator) và bộ điều khiển biên độ (GainNode) để tổng hợp trực tiếp âm thanh chuông "ting".
- **Thông số âm thanh (Notification Chime Envelope):**
  - Tần số kép hài hòa: Nốt cơ bản 880Hz (A5) kết hợp nốt hòa âm 1320Hz (E6) tạo cảm giác trong trẻo, hiện đại tương tự âm thanh thông báo của macOS / iOS.
  - Biên độ âm thanh (Gain Envelope): Khởi đầu cực nhanh (attack 0.005s) đến đỉnh 0.25 (âm lượng vừa phải, không chói tai), sau đó giảm dần tự nhiên theo hàm số mũ (exponential decay trong 0.35s).
- **Lý do lựa chọn:**
  - Khởi tạo tức thì không cần tải file qua mạng, không bao giờ bị nghẽn hay lỗi 404.
  - Nhẹ nhàng, hoạt động ngoại tuyến (offline-ready) và không tốn băng thông máy chủ.
- **Phương án thay thế đã cân nhắc:** Dùng thẻ `<audio src="/sounds/ting.mp3">` - Dễ bị lỗi do mạng chậm, tốn request HTTP, và gặp vấn đề cache trình duyệt.

### 2. Cấu Trúc Mô-đun Singleton `SoundNotifier` (`frontend/src/lib/sound-notifier.ts`)
- **Lựa chọn:** Xây dựng tiện ích singleton `soundNotifier` quản lý tập trung:
  - `audioCtx`: Phiên bản `AudioContext` lười khởi tạo (Lazy Initialization).
  - `isMuted`: Trạng thái bật/tắt âm thanh, đọc và lưu vào `localStorage` key `'shopflow_sound_notification_enabled'`.
  - `lastPlayedTimestamp`: Mốc thời gian lần phát gần nhất để thực thi cơ chế throttle 1,500ms.
  - `initAutoplayUnlock()`: Tự động lắng nghe sự kiện `'click'` và `'keydown'` trên `window` (với tùy chọn `{ once: true }`) để gọi `audioCtx.resume()`.
- **Lý do lựa chọn:** Đảm bảo toàn bộ ứng dụng dùng chung một context âm thanh duy nhất, dễ dàng mock trong unit test và dễ tái sử dụng ở bất kỳ màn hình nào.

### 3. Điểm Tích Hợp (Trigger Points)
- **Tại `inbox.store.ts` (`handleSocketNewItem`):**
  - Kiểm tra điều kiện:
    ```typescript
    if (typed.message && typed.message.sender_type === 'customer') {
      soundNotifier.playNotificationSound();
    }
    ```
- **Tại `column-channels.tsx` (Thanh tiêu đề Inbox):**
  - Bổ sung nút bấm chuông thông báo (icon `Volume2` khi bật, `VolumeX` khi tắt) cho phép người dùng click để đảo trạng thái (toggle mute).

## Risks / Trade-offs

- **[Rủi ro] Trình duyệt chặn âm thanh khi người dùng vừa F5 tải lại trang:**
  - *Giải pháp:* Đăng ký sự kiện unlock `audioCtx.resume()` ngay tại component gốc `MacWindowShell` hoặc `SoundNotifier` ngay khi người dùng thực hiện cú click chuột đầu tiên vào trang.
- **[Rủi ro] Khách hàng spam nhiều tin nhắn liên tiếp gây chói tai:**
  - *Giải pháp:* Cơ chế throttle 1.5s trong `soundNotifier.playNotificationSound()` tự động bỏ qua các yêu cầu phát âm thanh nếu cách lần phát trước dưới 1500ms.
- **[Rủi ro] Lỗi môi trường Test (Node.js/JSDOM không hỗ trợ Web Audio API):**
  - *Giải pháp:* Kiểm tra điều kiện `typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)` trước khi khởi tạo, đồng thời cung cấp mock chuẩn cho Vitest.
