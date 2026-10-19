/**
 * ShopFlow - Messages & Comments Repository
 * File: backend/src/infrastructure/repositories/message-comment.repository.ts
 *
 * Quản lý lưu trữ bình luận Facebook và tin nhắn trong bảng `conversations` và `messages_and_comments`.
 */

import { query } from '../database/db.client.js';

export interface Conversation {
  id: string;
  page_id: string;
  customer_id: string;
  type: 'messenger' | 'comment_thread';
  meta_thread_id: string;
  last_message_text: string | null;
  status: 'open' | 'resolved' | 'archived';
}

export interface MessageOrComment {
  id: string;
  conversation_id: string;
  page_id: string;
  meta_id: string;
  sender_type: 'customer' | 'page' | 'system';
  sender_fb_id: string;
  content: string | null;
  is_hidden: boolean;
  private_reply_sent: boolean;
  media_payload: unknown;
  created_at: Date;
}

export interface SaveCommentParams {
  pageInternalId: string;
  customerId: string;
  metaThreadId: string; // Facebook Post ID hoặc Parent Comment ID
  commentId: string;    // Facebook Comment ID (meta_id)
  senderFbId: string;
  content: string;
  isHidden: boolean;
}

export class MessageCommentRepository {
  /**
   * Đảm bảo cuộc hội thoại (comment thread) đã tồn tại. Nếu chưa thì tạo mới.
   */
  async ensureConversation(
    pageInternalId: string,
    customerId: string,
    metaThreadId: string,
    type: 'comment_thread' | 'messenger' = 'comment_thread'
  ): Promise<Conversation> {
    const sql = `
      INSERT INTO conversations (page_id, customer_id, type, meta_thread_id, status)
      VALUES ($1, $2, $3, $4, 'open')
      ON CONFLICT (meta_thread_id) DO UPDATE
      SET last_message_at = CURRENT_TIMESTAMP
      RETURNING id, page_id, customer_id, type, meta_thread_id, last_message_text, status
    `;

    const result = await query<Conversation>(sql, [
      pageInternalId,
      customerId,
      type,
      metaThreadId,
    ]);

    return result.rows[0]!;
  }

  /**
   * Lưu bình luận vào bảng messages_and_comments.
   * Nếu meta_id đã tồn tại, cập nhật cờ is_hidden và content.
   */
  async saveComment(params: SaveCommentParams): Promise<MessageOrComment> {
    // 1. Đảm bảo conversation tồn tại
    const conversation = await this.ensureConversation(
      params.pageInternalId,
      params.customerId,
      params.metaThreadId,
      'comment_thread'
    );

    // 2. Lưu/cập nhật bản ghi bình luận
    const sql = `
      INSERT INTO messages_and_comments (
        conversation_id, page_id, meta_id, sender_type, sender_fb_id, content, is_hidden
      )
      VALUES ($1, $2, $3, 'customer', $4, $5, $6)
      ON CONFLICT (meta_id) DO UPDATE
      SET
        is_hidden = EXCLUDED.is_hidden,
        content = EXCLUDED.content
      RETURNING id, conversation_id, page_id, meta_id, sender_type, sender_fb_id, content, is_hidden, private_reply_sent, media_payload, created_at
    `;

    const result = await query<MessageOrComment>(sql, [
      conversation.id,
      params.pageInternalId,
      params.commentId,
      params.senderFbId,
      params.content,
      params.isHidden,
    ]);

    // 3. Cập nhật preview tin nhắn cuối trong conversation
    await query(
      `UPDATE conversations SET last_message_text = $1, last_message_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [params.content, conversation.id]
    ).catch(() => {});

    return result.rows[0]!;
  }
}

export const messageCommentRepository = new MessageCommentRepository();
