# Design: Tự Động Đánh Dấu Đã Đọc & Xóa Chấm Báo Chưa Đọc Hộp Thư

## Context

Xem chi tiết bối cảnh và động lực tại `proposal.md`.
Hiện tại:
- `backend/src/infrastructure/repositories/conversation.repository.ts` đã có hàm `markAsRead(conversationId: string): Promise<boolean>` thực hiện `UPDATE conversations SET unread_count = 0 WHERE id = $1`.
- `backend/src/core/services/inbox.service.ts` trong phương thức `getConversationDetail(conversationId, userId)` đã có sẵn logic:
  ```typescript
  if (conv.unread_count > 0) {
    await this.conversationRepo.markAsRead(conversationId);
    conv.unread_count = 0;
  }
  ```
- Tuy nhiên, ở Frontend (`frontend/src/lib/inbox.store.ts`), hàm `selectConversation` chỉ cập nhật state cục bộ và gọi `fetchMessages(id)` chứ không gọi `getConversationDetail` hoặc API đánh dấu đã đọc. Đồng thời state của danh sách `conversations` không được cập nhật `unread_count = 0` ngay tại client, dẫn đến việc badge vẫn giữ nguyên.
- Thanh Sidebar (`frontend/src/components/layout/sidebar.tsx`) đang hardcode giá trị mock: `unreadInboxCount = 18`.

## Goals / Non-Goals

**Goals:**
- Tối ưu trải nghiệm phản hồi người dùng tức thì (Zero-lag Optimistic Update): Khi click vào hội thoại, badge unread tại hội thoại đó và tổng số tin chưa đọc lập tức biến mất trên UI mà không cần đợi API response.
- Đồng bộ chuẩn xuống DB: Gửi request cập nhật trạng thái đã đọc xuống Backend để lưu trữ bền vững.
- Đồng bộ Realtime đa thiết bị: Backend phát sóng WebSocket `INBOX_UPDATED` để các tab khác của cùng tài khoản cập nhật ngay.
- Thay thế hoàn toàn badge cứng trên thanh điều hướng Sidebar bằng giá trị động thực tế từ `inbox.store`.

**Non-Goals:**
- Thay đổi cấu trúc bảng cơ sở dữ liệu (`conversations`, `messages_and_comments`).
- Lập trình tính năng đánh dấu ngược lại từ "đã đọc" thành "chưa đọc" (Mark as unread) thủ công (sẽ dành cho phạm vi tính năng mở rộng sau).

## Decisions

### 1. Cập nhật lạc quan (Optimistic State Update) tại `selectConversation` trong Zustand Store
- **Lý do:** Khi người dùng click vào một cuộc trò chuyện để đọc tin, họ kỳ vọng chấm thông báo biến mất ngay trong mili-giây đầu tiên.
- **Giải pháp:** Trong `useInboxStore.selectConversation(conversation)`:
  - Nếu `conversation.unreadCount > 0` hoặc `conversation.unread_count > 0`:
    - Cập nhật trực tiếp phần tử trong mảng `conversations` với `unreadCount = 0` và `unread_count = 0`.
    - Gọi API đánh dấu đã đọc (qua `apiClient.patch('/inbox/conversations/:id/read')` hoặc `getConversationDetail`).
- **Giải pháp thay thế đã cân nhắc:** Chỉ cập nhật sau khi API backend trả về thành công ➔ Bị loại bỏ vì gây ra độ trễ 200-500ms làm chớp nháy badge.

### 2. Bổ sung Dedicated REST Endpoint: `PATCH /api/v1/inbox/conversations/:conversationId/read`
- **Lý do:** Rõ ràng về mặt ngữ nghĩa (Semantic REST API), nhẹ tải hơn so với việc tải lại toàn bộ detail hội thoại qua `GET`.
- **Backend flow:**
  - `ConversationController.markAsRead(req, res)`
  - `InboxService.markAsRead(conversationId, userId)`: kiểm tra quyền sở hữu hội thoại, gọi `conversationRepo.markAsRead(id)`, phát sóng WebSocket `socketService.emitInboxUpdated(pageId, { conversation_id, updated_fields: { unread_count: 0 } })`.
- **Giải pháp thay thế đã cân nhắc:** Tái sử dụng `GET /api/v1/inbox/conversations/:id` ➔ Vẫn được giữ lại như fallback, nhưng `PATCH /read` chuyên biệt hơn và tiết kiệm băng thông.

### 3. Kết nối Sidebar Unread Badge với `useInboxStore`
- **Lý do:** Hiện tại `Sidebar` nhận prop `unreadInboxCount = 18` mặc định.
- **Giải pháp:**
  - `Sidebar` hoặc `MacWindowShell` lắng nghe `totalUnread` từ `useInboxStore`.
  - Nếu `totalUnread === 0` thì không hiển thị badge (`badge: undefined`). Nếu `> 0` thì hiển thị con số chính xác.

## Risks / Trade-offs

- **[Risk] Lỗi mạng khi gọi API đánh dấu đã đọc sau khi đã cập nhật UI lạc quan**
  ➔ *Mitigation:* Trong trường hợp API thất bại, rollback lại số lượng `unreadCount` cũ và hiển thị thông báo toast lỗi nhẹ nhàng.
- **[Risk] Sự kiện `NEW_INBOX_ITEM` từ WebSocket đến cùng lúc người dùng đang mở hội thoại**
  ➔ *Mitigation:* Nếu tin nhắn mới thuộc đúng `selectedConversation.id` đang mở trước mắt người dùng, tự động giữ `unread_count = 0` vì người dùng đang đọc trực tiếp.

## Migration Plan

- Không yêu cầu database migration vì cột `unread_count` và bảng `conversations` đã có sẵn.
- Triển khai an toàn không làm gián đoạn hệ thống.
