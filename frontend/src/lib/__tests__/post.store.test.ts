import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePostStore } from '../post.store';
import { apiClient } from '../api-client';

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Post Store (usePostStore)', () => {
  const mockPosts = [
    {
      id: 'post_1',
      page_id: 'page_100',
      user_id: 'user_1',
      content_text: 'Siêu sale áo thun mùa hè giảm 50%!',
      media_type: 'photo' as const,
      media_urls: ['https://example.com/photo1.jpg'],
      scheduled_time: '2026-10-22T10:00:00.000Z',
      status: 'scheduled' as const,
      meta_post_id: null,
      error_message: null,
      created_at: '2026-10-21T08:00:00.000Z',
      updated_at: '2026-10-21T08:00:00.000Z',
    },
    {
      id: 'post_2',
      page_id: 'page_200',
      user_id: 'user_1',
      content_text: 'BST Thu Đông mới nhất vừa cập bến!',
      media_type: 'none' as const,
      media_urls: [],
      scheduled_time: '2026-10-21T09:00:00.000Z',
      status: 'failed' as const,
      meta_post_id: null,
      error_message: 'Token Fanpage đã hết hạn',
      created_at: '2026-10-21T07:00:00.000Z',
      updated_at: '2026-10-21T09:01:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    usePostStore.getState().reset();
  });

  it('khởi tạo với state mặc định chính xác', () => {
    const state = usePostStore.getState();
    expect(state.posts).toEqual([]);
    expect(state.selectedPageId).toBe('all');
    expect(state.selectedStatus).toBe('all');
    expect(state.viewMode).toBe('list');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchPosts tải danh sách bài viết và phân trang thành công', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          posts: mockPosts,
          meta: {
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
          },
        },
      },
    });

    await usePostStore.getState().fetchPosts();

    const state = usePostStore.getState();
    expect(state.posts).toHaveLength(2);
    expect(state.posts[0].id).toBe('post_1');
    expect(state.posts[0].contentText).toBe('Siêu sale áo thun mùa hè giảm 50%!');
    expect(state.posts[0].status).toBe('scheduled');
    expect(state.meta.total).toBe(2);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchPosts xử lý lỗi từ API phòng vệ', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce({
      response: {
        data: {
          message: 'Lỗi kết nối máy chủ',
        },
      },
    });

    await usePostStore.getState().fetchPosts();

    const state = usePostStore.getState();
    expect(state.posts).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Lỗi kết nối máy chủ');
  });

  it('filterByStatus cập nhật filter và reset về trang 1', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          posts: [mockPosts[1]],
          meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
        },
      },
    });

    await usePostStore.getState().filterByStatus('failed');

    expect(usePostStore.getState().selectedStatus).toBe('failed');
    expect(apiClient.get).toHaveBeenCalledWith('/posts', expect.objectContaining({
      params: expect.objectContaining({ status: 'failed', page: 1 }),
    }));
  });

  it('filterByPage cập nhật trang mục tiêu và gọi API', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          posts: [],
          meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
        },
      },
    });

    await usePostStore.getState().filterByPage('page_100');

    expect(usePostStore.getState().selectedPageId).toBe('page_100');
    expect(apiClient.get).toHaveBeenCalledWith('/posts', expect.objectContaining({
      params: expect.objectContaining({ page_id: 'page_100', page: 1 }),
    }));
  });

  it('changePage cập nhật page và tải lại dữ liệu', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          posts: [],
          meta: { total: 20, page: 2, limit: 10, totalPages: 2 },
        },
      },
    });

    await usePostStore.getState().changePage(2);

    expect(usePostStore.getState().meta.page).toBe(2);
    expect(apiClient.get).toHaveBeenCalledWith('/posts', expect.objectContaining({
      params: expect.objectContaining({ page: 2 }),
    }));
  });

  it('retryPost gọi endpoint retry và cập nhật trạng thái bài viết thành công', async () => {
    usePostStore.setState({
      posts: [
        {
          id: 'post_2',
          pageId: 'page_200',
          userId: 'user_1',
          contentText: 'BST Thu Đông',
          mediaType: 'none',
          mediaUrls: [],
          scheduledTime: '2026-10-21T09:00:00.000Z',
          status: 'failed',
          metaPostId: null,
          errorMessage: 'Token expired',
          createdAt: '2026-10-21T07:00:00.000Z',
          updatedAt: '2026-10-21T09:00:00.000Z',
        },
      ],
    });

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Đã đưa bài viết vào hàng đợi đăng lại',
        data: {
          post: {
            id: 'post_2',
            page_id: 'page_200',
            user_id: 'user_1',
            content_text: 'BST Thu Đông',
            media_type: 'none',
            media_urls: [],
            scheduled_time: '2026-10-21T09:00:00.000Z',
            status: 'pending',
            meta_post_id: null,
            error_message: null,
            created_at: '2026-10-21T07:00:00.000Z',
            updated_at: '2026-10-21T09:15:00.000Z',
          },
        },
      },
    });

    const success = await usePostStore.getState().retryPost('post_2');

    expect(success).toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith('/posts/post_2/retry');
    const updatedPost = usePostStore.getState().posts.find((p) => p.id === 'post_2');
    expect(updatedPost?.status).toBe('pending');
    expect(updatedPost?.errorMessage).toBeNull();
  });

  it('cancelPost gọi DELETE và chuyển trạng thái sang cancelled', async () => {
    usePostStore.setState({
      posts: [
        {
          id: 'post_1',
          pageId: 'page_100',
          userId: 'user_1',
          contentText: 'Bài viết chờ đăng',
          mediaType: 'none',
          mediaUrls: [],
          scheduledTime: '2026-10-22T10:00:00.000Z',
          status: 'scheduled',
          metaPostId: null,
          errorMessage: null,
          createdAt: '2026-10-21T08:00:00.000Z',
          updatedAt: '2026-10-21T08:00:00.000Z',
        },
      ],
    });

    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Đã hủy lịch đăng bài',
      },
    });

    const success = await usePostStore.getState().cancelPost('post_1');

    expect(success).toBe(true);
    expect(apiClient.delete).toHaveBeenCalledWith('/posts/post_1');
    const updatedPost = usePostStore.getState().posts.find((p) => p.id === 'post_1');
    expect(updatedPost?.status).toBe('cancelled');
  });

  it('handlePostStatusChanged cập nhật bài viết tức thời từ socket payload', () => {
    usePostStore.setState({
      posts: [
        {
          id: 'post_1',
          pageId: 'page_100',
          userId: 'user_1',
          contentText: 'Đang đợi xuất bản',
          mediaType: 'none',
          mediaUrls: [],
          scheduledTime: '2026-10-21T10:00:00.000Z',
          status: 'scheduled',
          metaPostId: null,
          errorMessage: null,
          createdAt: '2026-10-21T08:00:00.000Z',
          updatedAt: '2026-10-21T08:00:00.000Z',
        },
      ],
    });

    usePostStore.getState().handlePostStatusChanged({
      postId: 'post_1',
      status: 'published',
      metaPostId: 'meta_fb_123456789',
      updatedAt: '2026-10-21T10:00:05.000Z',
    });

    const post = usePostStore.getState().posts[0];
    expect(post.status).toBe('published');
    expect(post.metaPostId).toBe('meta_fb_123456789');
  });
});
