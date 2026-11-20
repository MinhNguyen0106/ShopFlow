# Proposal: Tự Động Đánh Dấu Đã Đọc & Xóa Chấm Báo Chưa Đọc Khi Xem Hội Thoại Hộp Thư

## Why

Hiện tại trên giao diện Hộp thư Live Chat (`/inbox`), khi người dùng nhấn vào bất kỳ cuộc hội thoại nào trong danh sách, hệ thống chỉ tải tin nhắn của hội thoại đó mà không tự động chuyển trạng thái cuộc hội thoại thành đã đọc (`unread_count = 0`). Do đó, chấm báo số tin nhắn chưa đọc (unread counter pill) màu xanh lá ở từng mục hội thoại khách hàng, nhãn tổng số tin chưa đọc ở cột kênh, và con số hiển thị trên Sidebar menu vẫn tiếp tục hiển thị mà không biến mất, gây nhầm lẫn cho nhân viên quản trị và trải nghiệm người dùng chưa hoàn thiện.

Đề xuất này thiết lập cơ chế tự động đánh dấu đã đọc (Mark as Read) tức thời ngay khi nhân viên click chọn xem hội thoại, đồng bộ cập nhật xuống cơ sở dữ liệu Backend và phát sóng trạng thái đã đọc qua WebSocket để xóa toàn bộ các chấm và huy hiệu thông báo chưa đọc tương ứng.

## What Changes

- **Tự động kích hoạt Đánh dấu đã đọc khi chọn hội thoại (Optimistic Read Update):**
  - Khi nhân viên click chọn một hội thoại trong danh sách (`selectConversation`), Frontend lập tức cập nhật lạc quan `unread_count = 0` / `unreadCount = 0` cho hội thoại đó trong `inbox.store`.
  - Gọi API Backend `GET /api/v1/inbox/conversations/:id` hoặc `PATCH /api/v1/inbox/conversations/:id/read` để cập nhật `unread_count = 0` trong bảng `conversations`.
- **Đồng bộ xóa chấm và huy hiệu báo tin nhắn chưa đọc (Clear Unread Badges):**
  - **Danh sách hội thoại (`ColumnThreads`):** Ngay khi hội thoại được xem, huy hiệu số lượng tin chưa đọc (unread counter pill) lập tức biến mất; kiểu chữ tên khách hàng và đoạn trích tin nhắn cuối chuyển từ in đậm (`font-bold`, `font-semibold`) sang bình thường.
  - **Cột kênh & bộ lọc (`ColumnChannels`):** Chỉ số tổng số tin chưa đọc `{totalUnread} mới` tự động giảm trừ ngay lập tức khi hội thoại được đọc, và ẩn hoàn toàn khi tổng số chưa đọc về 0.
  - **Menu Sidebar (`Sidebar`):** Loại bỏ giá trị mock tĩnh (`unreadInboxCount = 18`), thay thế bằng giá trị tính toán động từ tổng số tin nhắn chưa đọc thực tế; ẩn huy hiệu khi không còn tin nhắn chưa đọc.
- **Đồng bộ thời gian thực qua WebSocket:**
  - Backend phát sự kiện `INBOX_UPDATED` (với `updated_fields: { unread_count: 0 }`) để đồng bộ trạng thái đã đọc trên mọi tab trình duyệt và thiết bị của nhân viên cùng quản trị Fanpage.

## Capabilities

### New Capabilities
- `centralized-inbox`: Quản lý tin nhắn hội thoại tập trung, đánh dấu trạng thái đã đọc/chưa đọc, điều phối thông báo huy hiệu unread trên giao diện Live Chat và thanh điều hướng hệ thống.

### Modified Capabilities
*(Không có spec hiện tại nào bị thay đổi yêu cầu cốt lõi)*

## Impact

- **Frontend:**
  - `frontend/src/lib/inbox.store.ts`: Thêm logic cập nhật `unread_count = 0` trong `selectConversation`, thêm action `markConversationAsRead(id)`.
  - `frontend/src/components/inbox/column-threads.tsx`: Đảm bảo badge unread biến mất và font chữ chuẩn hóa khi hội thoại được đọc.
  - `frontend/src/components/inbox/column-channels.tsx`: Cập nhật tự động `totalUnread` giảm trừ thời gian thực.
  - `frontend/src/components/layout/sidebar.tsx` & `frontend/src/components/layout/mac-window-shell.tsx`: Kết nối huy hiệu chưa đọc ở menu với dữ liệu thực tế thay vì mock tĩnh.
- **Backend:**
  - `backend/src/core/services/inbox.service.ts`: Đảm bảo phương thức đánh dấu đã đọc (`markAsRead`) cập nhật database và phát sóng `socketService.emitInboxUpdated`.
  - `backend/src/api/routes/inbox.routes.ts`: Bổ sung endpoint rõ ràng `PATCH /api/v1/inbox/conversations/:conversationId/read` (hoặc đảm bảo `getConversationDetail` xử lý chuẩn).
- **APIs & Database:**
  - Không thay đổi cấu trúc bảng database; tái sử dụng trường `unread_count` và hàm `conversationRepo.markAsRead(conversationId)`.
