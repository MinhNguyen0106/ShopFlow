/**
 * ShopFlow - Centralized Inbox Types & Contracts
 * File: frontend/src/types/inbox.ts
 *
 * Đồng bộ theo quy chuẩn: .agent/rules/api-contract-sync.md
 */

export type ConversationType = 'messenger' | 'comment_thread';
export type ConversationStatus = 'open' | 'resolved' | 'archived';
export type MessageSenderType = 'customer' | 'page' | 'system';

export interface CustomerProfile {
  id: string;
  customerFbId?: string;
  customer_fb_id?: string;
  customerName?: string;
  customer_name?: string;
  phoneNumber?: string | null;
  phone_number?: string | null;
  address?: string | null;
  notes?: string | null;
  tags?: string[];
}

export interface ConversationItem {
  id: string;
  pageId?: string;
  page_id?: string;
  pageName?: string;
  page_name?: string;
  pageFbId?: string;
  page_fb_id?: string;
  type: ConversationType;
  metaThreadId?: string;
  meta_thread_id?: string;
  lastMessageText?: string | null;
  last_message_text?: string | null;
  lastMessageAt?: string | null;
  last_message_at?: string | null;
  unreadCount?: number;
  unread_count?: number;
  window24hExpiresAt?: string | null;
  window_24h_expires_at?: string | null;
  isWithin24h?: boolean;
  is_within_24h?: boolean;
  status: ConversationStatus;
  createdAt?: string;
  created_at?: string;
  customer: CustomerProfile;
}

export interface MessageItem {
  id: string;
  conversationId?: string;
  conversation_id?: string;
  pageId?: string;
  page_id?: string;
  metaId?: string;
  meta_id?: string;
  senderType: MessageSenderType;
  sender_type?: MessageSenderType;
  senderFbId?: string;
  sender_fb_id?: string;
  content: string | null;
  isHidden?: boolean;
  is_hidden?: boolean;
  privateReplySent?: boolean;
  private_reply_sent?: boolean;
  mediaPayload?: unknown;
  media_payload?: unknown;
  createdAt: string;
  created_at?: string;
}

export interface ExtractedOrderAI {
  customerName?: string;
  phone?: string;
  address?: string;
  items: Array<{
    productName: string;
    quantity: number;
    size?: string;
    color?: string;
    price?: number;
  }>;
  totalAmount?: number;
  confidence: number; // 0 -> 100%
  sourceText?: string;
}

export interface QuickMacro {
  shortcut: string;
  label: string;
  text: string;
}
