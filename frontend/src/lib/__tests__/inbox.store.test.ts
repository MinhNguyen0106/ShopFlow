import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInboxStore } from '../inbox.store';
import { apiClient } from '../api-client';

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Inbox Store (useInboxStore)', () => {
  const mockConversations = [
    {
      id: 'conv_1',
      page_id: 'page_1',
      page_name: 'Shop Áo Thun',
      type: 'messenger' as const,
      status: 'open' as const,
      last_message_text: 'Shop còn size L áo đen không?',
      last_message_at: '2026-10-20T10:00:00Z',
      unread_count: 2,
      window_24h_expires_at: new Date(Date.now() + 3600000).toISOString(),
      is_within_24h: true,
      customer: {
        id: 'cust_1',
        customer_name: 'Minh Đức',
        phone_number: '0987654321',
        tags: ['Vip'],
      },
    },
  ];

  const mockMessages = [
    {
      id: 'msg_1',
      conversation_id: 'conv_1',
      sender_type: 'customer' as const,
      content: 'Shop còn size L áo đen không?',
      is_hidden: false,
      created_at: '2026-10-20T10:00:00Z',
    },
    {
      id: 'msg_2',
      conversation_id: 'conv_1',
      sender_type: 'page' as const,
      content: 'Dạ còn bạn nhé!',
      is_hidden: false,
      created_at: '2026-10-20T10:01:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useInboxStore.setState({
      conversations: [],
      selectedConversation: null,
      messages: [],
      filters: {},
      isLoadingConversations: false,
      isLoadingMessages: false,
      isSendingMessage: false,
      error: null,
    });
  });

  it('phải tải danh sách hội thoại và bóc tách dữ liệu phòng vệ (defensive unwrap)', async () => {
    // Backend trả về lồng { conversations: [...] }
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          conversations: mockConversations,
        },
      },
    });

    await useInboxStore.getState().fetchConversations();

    const state = useInboxStore.getState();
    expect(state.conversations).toHaveLength(1);
    expect(state.conversations[0].id).toBe('conv_1');
    expect(state.conversations[0].customer.customer_name).toBe('Minh Đức');
  });

  it('phải chọn hội thoại và tải danh sách tin nhắn', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          messages: mockMessages,
        },
      },
    });

    await useInboxStore.getState().selectConversation(mockConversations[0] as any);

    const state = useInboxStore.getState();
    expect(state.selectedConversation?.id).toBe('conv_1');
    expect(state.messages).toHaveLength(2);
    expect(state.messages[0].content).toBe('Shop còn size L áo đen không?');
  });

  it('phải gửi tin nhắn thành công và cập nhật messages state', async () => {
    useInboxStore.setState({
      selectedConversation: mockConversations[0] as any,
      messages: mockMessages as any,
    });

    const newMsg = {
      id: 'msg_3',
      conversation_id: 'conv_1',
      sender_type: 'page' as const,
      content: 'Dạ shop miễn phí ship hôm nay ạ!',
      created_at: new Date().toISOString(),
    };

    (apiClient.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          message: newMsg,
        },
      },
    });

    const ok = await useInboxStore.getState().sendMessage('Dạ shop miễn phí ship hôm nay ạ!');
    expect(ok).toBe(true);

    const state = useInboxStore.getState();
    expect(state.messages).toHaveLength(3);
    expect(state.messages[2].content).toBe('Dạ shop miễn phí ship hôm nay ạ!');
  });

  it('phải ẩn hoặc hiện bình luận Facebook (toggleHideMessage)', async () => {
    useInboxStore.setState({
      messages: mockMessages as any,
    });

    (apiClient.patch as any).mockResolvedValueOnce({
      data: { success: true },
    });

    const ok = await useInboxStore.getState().toggleHideMessage('msg_1', true);
    expect(ok).toBe(true);

    const state = useInboxStore.getState();
    expect(state.messages[0].isHidden || state.messages[0].is_hidden).toBe(true);
  });

  it('phải cập nhật trạng thái hội thoại (updateConversationStatus)', async () => {
    useInboxStore.setState({
      selectedConversation: mockConversations[0] as any,
      conversations: mockConversations as any,
    });

    (apiClient.patch as any).mockResolvedValueOnce({
      data: { success: true },
    });

    const ok = await useInboxStore.getState().updateConversationStatus('resolved');
    expect(ok).toBe(true);

    const state = useInboxStore.getState();
    expect(state.selectedConversation?.status).toBe('resolved');
  });
});
