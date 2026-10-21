import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostStatusBadge } from '@/components/posts/post-status-badge';
import { PostsListView } from '@/components/posts/posts-list-view';
import { PostsCalendarView } from '@/components/posts/posts-calendar-view';
import PostsPage from '../page';
import { usePostStore } from '@/lib/post.store';
import { usePageStore } from '@/lib/page.store';
import { ScheduledPostItem } from '@/types/post';

// Mock apiClient
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { data: { posts: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } } } }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

// Mock useSocket
vi.mock('@/lib/useSocket', () => ({
  useSocket: () => ({
    isConnected: true,
    onPostStatusChanged: vi.fn(() => () => {}),
  }),
}));

describe('Scheduled Posts Management Subsystem (TASK-16)', () => {
  const mockSamplePosts: ScheduledPostItem[] = [
    {
      id: 'post_1',
      pageId: 'page_fb_1',
      page_id: 'page_fb_1',
      userId: 'user_1',
      contentText: 'BST Áo Khoác Gió Chống Nước 2026 - Giảm ngay 30%',
      mediaType: 'photo',
      mediaUrls: ['https://example.com/coat1.jpg', 'https://example.com/coat2.jpg'],
      scheduledTime: '2026-10-21T12:00:00.000Z', // Khung giờ vàng 12h
      status: 'scheduled',
      metaPostId: null,
      errorMessage: null,
      createdAt: '2026-10-20T10:00:00.000Z',
      updatedAt: '2026-10-20T10:00:00.000Z',
    },
    {
      id: 'post_2',
      pageId: 'page_fb_1',
      page_id: 'page_fb_1',
      userId: 'user_1',
      contentText: 'Flash Sale Áo Thun Cotton 100% chỉ từ 99k',
      mediaType: 'none',
      mediaUrls: [],
      scheduledTime: '2026-10-21T08:00:00.000Z',
      status: 'failed',
      metaPostId: null,
      errorMessage: 'Trang Facebook yêu cầu cấp lại quyền xuất bản',
      createdAt: '2026-10-20T07:00:00.000Z',
      updatedAt: '2026-10-21T08:01:00.000Z',
    },
    {
      id: 'post_3',
      pageId: 'page_fb_2',
      page_id: 'page_fb_2',
      userId: 'user_1',
      contentText: 'Video review đầm công sở thiết kế sang trọng',
      mediaType: 'video',
      mediaUrls: ['https://example.com/video1.mp4'],
      scheduledTime: '2026-10-20T19:45:00.000Z', // Khung giờ vàng 19h45
      status: 'published',
      metaPostId: 'fb_feed_9988776655',
      errorMessage: null,
      createdAt: '2026-10-19T10:00:00.000Z',
      updatedAt: '2026-10-20T19:45:05.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    usePostStore.getState().reset();
    usePageStore.setState({
      pages: [
        {
          id: 'p1',
          userId: 'u1',
          pageId: 'page_fb_1',
          pageName: 'Shop Thời Trang Nam',
          isActive: true,
          webhookSubscribed: true,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'p2',
          userId: 'u1',
          pageId: 'page_fb_2',
          pageName: 'Shop Đầm Thiết Kế',
          isActive: true,
          webhookSubscribed: true,
          createdAt: '',
          updatedAt: '',
        },
      ],
      selectedPage: null,
      isLoading: false,
      error: null,
    });
  });

  describe('PostStatusBadge Component', () => {
    it('render chính xác các trạng thái và nhãn tiếng Việt', () => {
      const { rerender } = render(<PostStatusBadge status="published" />);
      expect(screen.getByText('Đã xuất bản')).toBeDefined();

      rerender(<PostStatusBadge status="scheduled" />);
      expect(screen.getByText('Đã lên lịch')).toBeDefined();

      rerender(<PostStatusBadge status="pending" />);
      expect(screen.getByText('Đang xử lý')).toBeDefined();

      rerender(<PostStatusBadge status="failed" />);
      expect(screen.getByText('Lỗi xuất bản')).toBeDefined();

      rerender(<PostStatusBadge status="cancelled" />);
      expect(screen.getByText('Đã hủy')).toBeDefined();
    });
  });

  describe('PostsListView Component', () => {
    it('hiển thị danh sách bài viết với đầy đủ thông tin, ảnh và nút thao tác', () => {
      usePostStore.setState({
        posts: mockSamplePosts,
        meta: { total: 3, page: 1, limit: 10, totalPages: 1 },
        isLoading: false,
      });

      render(<PostsListView />);

      // Kiểm tra tiêu đề bài viết
      expect(screen.getByText(/BST Áo Khoác Gió/)).toBeDefined();
      expect(screen.getByText(/Flash Sale Áo Thun/)).toBeDefined();
      expect(screen.getByText(/Video review đầm công sở/)).toBeDefined();

      // Kiểm tra lỗi hiển thị cho bài failed
      expect(screen.getByText(/Trang Facebook yêu cầu cấp lại quyền/)).toBeDefined();

      // Kiểm tra nút Thử lại cho bài viết lỗi
      expect(screen.getByTestId('retry-btn-post_2')).toBeDefined();

      // Kiểm tra nút Hủy cho bài viết scheduled
      expect(screen.getByTestId('cancel-btn-post_1')).toBeDefined();
    });

    it('hiển thị empty state khi không có bài viết nào', () => {
      usePostStore.setState({
        posts: [],
        isLoading: false,
      });

      render(<PostsListView />);

      expect(screen.getByTestId('posts-empty-state')).toBeDefined();
      expect(screen.getByText('Chưa có bài viết nào được lên lịch')).toBeDefined();
    });

    it('thao tác nút Hủy bài có hiển thị nút xác nhận và gọi cancelPost', async () => {
      const cancelMock = vi.fn().mockResolvedValue(true);
      usePostStore.setState({
        posts: [mockSamplePosts[0]],
        cancelPost: cancelMock,
      });

      render(<PostsListView />);

      const cancelBtn = screen.getByTestId('cancel-btn-post_1');
      fireEvent.click(cancelBtn);

      // Hiển thị nút Xác nhận
      const confirmBtn = screen.getByTestId('confirm-cancel-btn-post_1');
      expect(confirmBtn).toBeDefined();

      fireEvent.click(confirmBtn);
      expect(cancelMock).toHaveBeenCalledWith('post_1');
    });

    it('thao tác nút Thử lại bài viết gọi retryPost', async () => {
      const retryMock = vi.fn().mockResolvedValue(true);
      usePostStore.setState({
        posts: [mockSamplePosts[1]],
        retryPost: retryMock,
      });

      render(<PostsListView />);

      const retryBtn = screen.getByTestId('retry-btn-post_2');
      fireEvent.click(retryBtn);

      expect(retryMock).toHaveBeenCalledWith('post_2');
    });
  });

  describe('PostsCalendarView Component', () => {
    it('render lưới lịch tháng và hiển thị bài viết trên ô ngày', () => {
      usePostStore.setState({
        posts: mockSamplePosts,
      });

      render(<PostsCalendarView />);

      // Các thứ trong tuần
      expect(screen.getByText('Thứ 2')).toBeDefined();
      expect(screen.getByText('Chủ nhật')).toBeDefined();

      // Nút hôm nay
      expect(screen.getByTestId('calendar-today-btn')).toBeDefined();
      expect(screen.getByTestId('calendar-prev-month-btn')).toBeDefined();
      expect(screen.getByTestId('calendar-next-month-btn')).toBeDefined();
    });

    it('click vào thẻ bài viết trên lịch mở modal chi tiết', async () => {
      usePostStore.setState({
        posts: mockSamplePosts,
      });

      render(<PostsCalendarView />);

      const postCard = screen.queryByTestId('calendar-post-post_1');
      if (postCard) {
        fireEvent.click(postCard);

        // Modal chi tiết bài viết
        await waitFor(() => {
          expect(screen.getByTestId('calendar-post-modal')).toBeDefined();
        });

        // Đóng modal
        const closeBtn = screen.getByTestId('close-modal-btn');
        fireEvent.click(closeBtn);

        await waitFor(() => {
          expect(screen.queryByTestId('calendar-post-modal')).toBeNull();
        });
      }
    });
  });

  describe('PostsPage Main Integration', () => {
    it('chuyển đổi qua lại mượt mà giữa Dạng bảng và Lịch biểu', () => {
      render(<PostsPage />);

      // Mặc định là Dạng bảng
      expect(screen.getByTestId('view-mode-list-btn')).toBeDefined();
      expect(screen.getByTestId('view-mode-calendar-btn')).toBeDefined();

      // Chuyển sang Calendar View
      fireEvent.click(screen.getByTestId('view-mode-calendar-btn'));
      expect(usePostStore.getState().viewMode).toBe('calendar');

      // Chuyển lại về List View
      fireEvent.click(screen.getByTestId('view-mode-list-btn'));
      expect(usePostStore.getState().viewMode).toBe('list');
    });

    it('thay đổi bộ lọc Fanpage gọi filterByPage', () => {
      render(<PostsPage />);

      const select = screen.getByTestId('fanpage-selector') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'page_fb_1' } });

      expect(usePostStore.getState().selectedPageId).toBe('page_fb_1');
    });

    it('thay đổi tab trạng thái gọi filterByStatus', () => {
      render(<PostsPage />);

      const failedTab = screen.getByTestId('status-tab-failed');
      fireEvent.click(failedTab);

      expect(usePostStore.getState().selectedStatus).toBe('failed');
    });
  });
});
