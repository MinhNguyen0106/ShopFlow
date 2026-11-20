import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ColumnChannels } from '../column-channels';
import { ColumnThreads } from '../column-threads';
import { ChatWindow } from '../chat-window';
import { CustomerPanel } from '../customer-panel';
import { useInboxStore } from '@/lib/inbox.store';
import { usePageStore } from '@/lib/page.store';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Inbox 4-Pane Bento Components', () => {
  const mockConversation = {
    id: 'conv_1',
    page_id: 'page_1',
    page_name: 'Shop Áo Sơ Mi',
    type: 'messenger' as const,
    status: 'open' as const,
    last_message_text: 'Cho mình hỏi áo này còn size M không?',
    last_message_at: '2026-10-20T10:00:00Z',
    unread_count: 1,
    window_24h_expires_at: new Date(Date.now() + 10000000).toISOString(),
    is_within_24h: true,
    customer: {
      id: 'cust_1',
      customer_name: 'Trần Thị Mai',
      phone_number: '0912345678',
      address: '123 Đường Cầu Giấy, Hà Nội',
      tags: ['Khách mới'],
    },
  };

  const mockMessages = [
    {
      id: 'msg_1',
      conversation_id: 'conv_1',
      sender_type: 'customer' as const,
      content: 'Cho mình lấy 2 cái áo polo đen size L nhé shop! SĐT mình 0912345678',
      is_hidden: false,
      created_at: '2026-10-20T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    usePageStore.setState({
      pages: [
        {
          id: 'page_1',
          userId: 'usr_1',
          pageId: 'fb_1',
          pageName: 'Shop Áo Sơ Mi',
          isActive: true,
          webhookSubscribed: true,
          createdAt: '',
          updatedAt: '',
        },
      ],
      selectedPage: null,
    });

    useInboxStore.setState({
      conversations: [mockConversation as any],
      selectedConversation: null,
      messages: [],
      filters: {},
      isLoadingConversations: false,
      isLoadingMessages: false,
    });
  });

  it('Pane 1: ColumnChannels render đúng các bộ lọc và Fanpage selector', () => {
    render(<ColumnChannels />);
    expect(screen.getByText('Hộp Thư')).toBeDefined();
    expect(screen.getByText(/Tất cả Fanpage/)).toBeDefined();
    expect(screen.getByText('Messenger')).toBeDefined();
    expect(screen.getByText('Bình luận Post')).toBeDefined();
  });

  it('Pane 2: ColumnThreads render danh sách hội thoại và badge SĐT', () => {
    render(<ColumnThreads />);
    expect(screen.getByText('Trần Thị Mai')).toBeDefined();
    expect(screen.getByText('Cho mình hỏi áo này còn size M không?')).toBeDefined();
    expect(screen.getByText('🛡️ Đã ẩn SĐT')).toBeDefined();
  });

  it('Pane 3: ChatWindow hiển thị thông tin cuộc trò chuyện khi được chọn', () => {
    useInboxStore.setState({
      selectedConversation: mockConversation as any,
      messages: mockMessages as any,
    });

    render(<ChatWindow />);
    expect(screen.getByRole('heading', { name: 'Trần Thị Mai' })).toBeDefined();
    expect(screen.getByText(/Shop Áo Sơ Mi/)).toBeDefined();
    expect(screen.getByText('Cho mình lấy 2 cái áo polo đen size L nhé shop! SĐT mình 0912345678')).toBeDefined();
    expect(screen.getByText('/size')).toBeDefined();
    expect(screen.getByText('/gia')).toBeDefined();
  });

  it('Pane 4: CustomerPanel hiển thị CRM và Thẻ Trích Xuất Đơn Hàng AI', () => {
    useInboxStore.setState({
      selectedConversation: mockConversation as any,
      messages: mockMessages as any,
    });

    render(<CustomerPanel />);
    expect(screen.getByText('CRM Khách Hàng')).toBeDefined();
    expect(screen.getByText('0912345678')).toBeDefined();
    expect(screen.getByText('123 Đường Cầu Giấy, Hà Nội')).toBeDefined();
    expect(screen.getByText('Trích Xuất Đơn Hàng')).toBeDefined();
    expect(screen.getByText(/1-Click Tạo Đơn Hàng Ngay/)).toBeDefined();
  });

  it('Pane 2: ColumnThreads xóa badge chưa đọc khi hội thoại được chọn (đã đọc)', () => {
    // Ban đầu có unread_count = 1 -> hiển thị unread badge
    const { rerender } = render(<ColumnThreads />);
    expect(screen.getByTestId('unread-badge')).toBeDefined();
    expect(screen.getByTestId('unread-badge').textContent).toBe('1');

    // Sau khi chọn hội thoại, unread_count được cập nhật về 0
    act(() => {
      useInboxStore.setState({
        conversations: [{ ...mockConversation, unread_count: 0, unreadCount: 0 } as any],
        selectedConversation: { ...mockConversation, unread_count: 0, unreadCount: 0 } as any,
      });
    });
    rerender(<ColumnThreads />);

    expect(screen.queryByTestId('unread-badge')).toBeNull();
  });

  it('Pane 1: ColumnChannels ẩn nhãn số tin mới khi tất cả hội thoại đã đọc', () => {
    // Ban đầu có totalUnread = 1 -> hiển thị "1 mới"
    const { rerender } = render(<ColumnChannels />);
    expect(screen.getByTestId('channel-total-unread')).toBeDefined();
    expect(screen.getByTestId('channel-total-unread').textContent).toContain('1 mới');

    // Đánh dấu đã đọc -> totalUnread = 0
    act(() => {
      useInboxStore.setState({
        conversations: [{ ...mockConversation, unread_count: 0, unreadCount: 0 } as any],
      });
    });
    rerender(<ColumnChannels />);

    expect(screen.queryByTestId('channel-total-unread')).toBeNull();
  });
});
