# Tasks

## 1. Backend REST API & Service Layer

- [x] 1.1 Triển khai phương thức `markAsRead(conversationId, userId)` trong `InboxService`, thực hiện cập nhật `unread_count = 0` và phát sóng sự kiện WebSocket `INBOX_UPDATED` tới phòng Fanpage; xác minh bằng unit test trong `inbox.service.test.ts`.
- [x] 1.2 Bổ sung endpoint `PATCH /api/v1/inbox/conversations/:conversationId/read` và method `markAsRead` trong `InboxController` và `inbox.routes.ts`; xác minh bằng integration test Supertest trong `inbox.routes.test.ts`.

## 2. Frontend State Management & Optimistic Read Update

- [x] 2.1 Cập nhật `selectConversation` trong `frontend/src/lib/inbox.store.ts` để đặt lạc quan `unreadCount = 0` / `unread_count = 0` cho hội thoại được chọn trong mảng `conversations` và gửi API `PATCH /read`; xác minh bằng unit test trong `inbox.store.test.ts`.
- [x] 2.2 Cập nhật `handleSocketNewItem` trong `inbox.store.ts` để giữ `unread_count = 0` nếu tin nhắn mới thuộc đúng `selectedConversation` đang mở; xác minh bằng ca kiểm thử nhận tin nhắn qua socket.

## 3. UI Badges & Navigation Sidebar Dynamic Sync

- [x] 3.1 Cập nhật `ColumnThreads` (`column-threads.tsx`) đảm bảo huy hiệu unread biến mất và tiêu đề/nội dung tin nhắn chuyển về kiểu chữ bình thường ngay khi click xem hội thoại; xác minh bằng component render test trong `inbox-components.test.tsx`.
- [x] 3.2 Cập nhật `ColumnChannels` (`column-channels.tsx`) để tính toán lại `totalUnread` giảm trừ ngay lập tức khi đọc tin và ẩn nhãn "X mới" khi `totalUnread = 0`; xác minh bằng component test.
- [x] 3.3 Kết nối `Sidebar` (`sidebar.tsx`) và `MacWindowShell` (`mac-window-shell.tsx`) với `useInboxStore` để hiển thị số lượng tin chưa đọc động theo thời gian thực (loại bỏ giá trị mock tĩnh `18`) và ẩn badge khi không có tin chưa đọc; xác minh bằng test case trong `sidebar.test.tsx`.

## 4. Quality Gate & Integration Verification

- [x] 4.1 Chạy toàn bộ test suite `npm test --workspace=backend -- inbox` và `npm test --workspace=frontend -- inbox`, xác minh 100% tests PASSED.
- [x] 4.2 Chạy `npm run type-check` và `npm run memory:check`, xác minh 0 lỗi kiểu dữ liệu và bộ ba bộ nhớ nhất quán.
