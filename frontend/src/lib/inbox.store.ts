/**
 * ShopFlow - Centralized Inbox Zustand Store
 * File: frontend/src/lib/inbox.store.ts
 *
 * Tuân thủ quy chuẩn: .agent/rules/api-contract-sync.md
 */

import { create } from 'zustand';
import { apiClient } from './api-client';
import {
  ConversationItem,
  MessageItem,
  ConversationType,
  ConversationStatus,
  CustomerProfile,
} from '../types/inbox';

interface InboxFilters {
  pageId?: string;
  type?: ConversationType;
  status?: ConversationStatus;
  search?: string;
}

interface InboxState {
  conversations: ConversationItem[];
  selectedConversation: ConversationItem | null;
  messages: MessageItem[];
  filters: InboxFilters;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;

  // Actions
  setFilters: (newFilters: Partial<InboxFilters>) => void;
  fetchConversations: () => Promise<void>;
  selectConversation: (conversation: ConversationItem | null) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<boolean>;
  sendPrivateReply: (messageId: string, content: string) => Promise<boolean>;
  toggleHideMessage: (messageId: string, isHidden: boolean) => Promise<boolean>;
  updateConversationStatus: (status: ConversationStatus) => Promise<boolean>;
  updateCustomerProfile: (data: Partial<CustomerProfile>) => Promise<boolean>;

  // Realtime Socket Handlers
  handleSocketNewItem: (item: unknown) => void;
  handleSocketInboxUpdated: (update: unknown) => void;
}

export const useInboxStore = create<InboxState>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  messages: [],
  filters: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchConversations();
  },

  fetchConversations: async () => {
    set({ isLoadingConversations: true, error: null });
    try {
      const { filters } = get();
      const params: Record<string, string | number> = {};
      if (filters.pageId) params.page_id = filters.pageId;
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await apiClient.get('/inbox/conversations', { params });
      const rawData = response.data?.data || {};

      // Defensive Parsing theo api-contract-sync.md
      const conversations: ConversationItem[] = Array.isArray(rawData.conversations)
        ? rawData.conversations
        : Array.isArray(rawData)
          ? rawData
          : [];

      const currentSelected = get().selectedConversation;
      let nextSelected = currentSelected;
      if (currentSelected) {
        nextSelected = conversations.find((c) => c.id === currentSelected.id) || currentSelected;
      }

      set({
        conversations,
        selectedConversation: nextSelected,
        isLoadingConversations: false,
      });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể tải danh sách hội thoại';
      set({ error: errorMsg, isLoadingConversations: false });
    }
  },

  selectConversation: async (conversation) => {
    set({ selectedConversation: conversation, messages: [] });
    if (conversation) {
      await get().fetchMessages(conversation.id);
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const response = await apiClient.get(`/inbox/conversations/${conversationId}/messages`);
      const rawData = response.data?.data || {};

      const messages: MessageItem[] = Array.isArray(rawData.messages)
        ? rawData.messages
        : Array.isArray(rawData)
          ? rawData
          : [];

      // Sắp xếp tin nhắn tăng dần theo thời gian (cũ -> mới để hiển thị cuộn chat xuôi)
      const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.createdAt || a.created_at || 0).getTime() - new Date(b.createdAt || b.created_at || 0).getTime()
      );

      set({ messages: sortedMessages, isLoadingMessages: false });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể tải tin nhắn';
      set({ error: errorMsg, isLoadingMessages: false });
    }
  },

  sendMessage: async (content) => {
    const { selectedConversation } = get();
    if (!selectedConversation || !content.trim()) return false;

    set({ isSendingMessage: true, error: null });
    try {
      const response = await apiClient.post(
        `/inbox/conversations/${selectedConversation.id}/messages`,
        { content: content.trim() }
      );
      const rawData = response.data?.data || {};
      const newMessage: MessageItem = rawData.message || rawData;

      if (newMessage && newMessage.id) {
        set((state) => ({
          messages: [...state.messages, newMessage],
          isSendingMessage: false,
        }));
      } else {
        set({ isSendingMessage: false });
      }
      return true;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể gửi tin nhắn';
      set({ error: errorMsg, isSendingMessage: false });
      return false;
    }
  },

  sendPrivateReply: async (messageId, content) => {
    if (!messageId || !content.trim()) return false;
    try {
      await apiClient.post(`/inbox/messages/${messageId}/private-reply`, {
        content: content.trim(),
      });
      // Đánh dấu private_reply_sent = true cho message đó
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, privateReplySent: true, private_reply_sent: true } : m
        ),
      }));
      return true;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể gửi Private Reply';
      set({ error: errorMsg });
      return false;
    }
  },

  toggleHideMessage: async (messageId, isHidden) => {
    try {
      await apiClient.patch(`/inbox/messages/${messageId}/hide`, {
        is_hidden: isHidden,
      });
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, isHidden, is_hidden: isHidden } : m
        ),
      }));
      return true;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể thay đổi trạng thái ẩn tin nhắn';
      set({ error: errorMsg });
      return false;
    }
  },

  updateConversationStatus: async (status) => {
    const { selectedConversation } = get();
    if (!selectedConversation) return false;

    try {
      await apiClient.patch(`/inbox/conversations/${selectedConversation.id}/status`, {
        status,
      });
      set((state) => ({
        selectedConversation: state.selectedConversation
          ? { ...state.selectedConversation, status }
          : null,
        conversations: state.conversations.map((c) =>
          c.id === selectedConversation.id ? { ...c, status } : c
        ),
      }));
      return true;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể cập nhật trạng thái hội thoại';
      set({ error: errorMsg });
      return false;
    }
  },

  updateCustomerProfile: async (data) => {
    const { selectedConversation } = get();
    if (!selectedConversation?.customer?.id) return false;

    try {
      const customerId = selectedConversation.customer.id;
      const payload: Record<string, unknown> = {};
      if (data.customerName !== undefined || data.customer_name !== undefined) {
        payload.customer_name = data.customerName || data.customer_name;
      }
      if (data.phoneNumber !== undefined || data.phone_number !== undefined) {
        payload.phone_number = data.phoneNumber || data.phone_number;
      }
      if (data.address !== undefined) payload.address = data.address;
      if (data.notes !== undefined) payload.notes = data.notes;
      if (data.tags !== undefined) payload.tags = data.tags;

      await apiClient.patch(`/inbox/customers/${customerId}`, payload);

      set((state) => {
        if (!state.selectedConversation) return state;
        const updatedCustomer = {
          ...state.selectedConversation.customer,
          ...data,
        };
        return {
          selectedConversation: {
            ...state.selectedConversation,
            customer: updatedCustomer,
          },
          conversations: state.conversations.map((c) =>
            c.id === state.selectedConversation?.id
              ? { ...c, customer: updatedCustomer }
              : c
          ),
        };
      });
      return true;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể cập nhật thông tin khách hàng';
      set({ error: errorMsg });
      return false;
    }
  },

  handleSocketNewItem: (item: unknown) => {
    // Tự động nhận tin nhắn mới qua WebSocket
    const typed = item as {
      conversation_id?: string;
      message?: MessageItem;
      type?: string;
    };
    const currentSelected = get().selectedConversation;

    if (typed?.conversation_id && typed.conversation_id === currentSelected?.id && typed.message) {
      set((state) => ({
        messages: [...state.messages, typed.message!],
      }));
    }
    // Cập nhật lại danh sách hội thoại để cập nhật unread_count và last_message
    get().fetchConversations();
  },

  handleSocketInboxUpdated: (_update: unknown) => {
    get().fetchConversations();
  },
}));
