import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MediaUploader } from '@/components/posts/media-uploader';
import { SchedulePicker } from '@/components/posts/schedule-picker';
import { PostEditor } from '@/components/posts/post-editor';
import {
  FacebookPostCard,
  PostPreviewModal,
} from '@/components/posts/post-preview-modal';
import NewPostPage from '../page';
import { usePageStore } from '@/lib/page.store';
import { apiClient } from '@/lib/api-client';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock apiClient
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Post Creator Subsystem (TASK-17)', () => {
  const mockPages = [
    {
      id: 'p1',
      pageId: 'page_fb_100',
      pageName: 'Shop Quần Áo Nam',
      userId: 'u1',
      isActive: true,
      webhookSubscribed: true,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'p2',
      pageId: 'page_fb_200',
      pageName: 'Shop Váy Nữ',
      userId: 'u1',
      isActive: true,
      webhookSubscribed: true,
      createdAt: '',
      updatedAt: '',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    usePageStore.setState({
      pages: mockPages,
      selectedPage: null,
      isLoading: false,
      error: null,
    });
  });

  describe('PostEditor Component', () => {
    it('render dropdown chọn Fanpage và textarea nội dung với bộ đếm ký tự', () => {
      const onChangeMock = vi.fn();
      const onPageChangeMock = vi.fn();

      render(
        <PostEditor
          content="Chào mừng bộ sưu tập mới"
          onChange={onChangeMock}
          selectedPageId="page_fb_100"
          onPageChange={onPageChangeMock}
          pages={mockPages}
        />
      );

      expect(screen.getByTestId('post-character-count')).toBeDefined();
      expect(screen.getByTestId('post-character-count').textContent).toContain('ký tự');

      const textarea = screen.getByTestId('post-content-textarea');
      fireEvent.change(textarea, { target: { value: 'Nội dung thay đổi' } });
      expect(onChangeMock).toHaveBeenCalledWith('Nội dung thay đổi');
    });

    it('bấm gợi ý hashtag tự động chèn vào nội dung bài viết', () => {
      const onChangeMock = vi.fn();

      render(
        <PostEditor
          content="Áo thun polo"
          onChange={onChangeMock}
          selectedPageId="page_fb_100"
          onPageChange={vi.fn()}
          pages={mockPages}
        />
      );

      const hashtagBtn = screen.getByTestId('quick-hashtag-#sale');
      fireEvent.click(hashtagBtn);

      expect(onChangeMock).toHaveBeenCalledWith('Áo thun polo #sale ');
    });
  });

  describe('MediaUploader Component', () => {
    it('render dropzone và gọi API upload khi người dùng chọn ảnh', async () => {
      const onChangeMock = vi.fn();
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            url: 'https://cloudinary.com/test-image.jpg',
            resource_type: 'image',
          },
        },
      });

      render(
        <MediaUploader
          mediaUrls={[]}
          mediaType="none"
          onChange={onChangeMock}
        />
      );

      const fileInput = screen.getByTestId('media-file-input');
      const testFile = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/media/upload',
          expect.any(FormData),
          expect.any(Object)
        );
        expect(onChangeMock).toHaveBeenCalledWith(['https://cloudinary.com/test-image.jpg'], 'photo');
      });
    });

    it('hiển thị danh sách thumbnail và hỗ trợ gỡ bỏ tệp', () => {
      const onChangeMock = vi.fn();

      render(
        <MediaUploader
          mediaUrls={['https://cloudinary.com/img1.jpg', 'https://cloudinary.com/img2.jpg']}
          mediaType="photo"
          onChange={onChangeMock}
        />
      );

      expect(screen.getByTestId('media-thumbnail-0')).toBeDefined();
      expect(screen.getByTestId('media-thumbnail-1')).toBeDefined();

      const removeBtn = screen.getByTestId('remove-media-btn-0');
      fireEvent.click(removeBtn);

      expect(onChangeMock).toHaveBeenCalledWith(['https://cloudinary.com/img2.jpg'], 'photo');
    });
  });

  describe('SchedulePicker Component', () => {
    it('chuyển đổi giữa chế độ Đăng ngay và Lên lịch', () => {
      const onPublishModeChangeMock = vi.fn();
      const onScheduledTimeChangeMock = vi.fn();

      render(
        <SchedulePicker
          publishMode="schedule"
          scheduledTime={new Date(Date.now() + 60 * 60 * 1000).toISOString()}
          onPublishModeChange={onPublishModeChangeMock}
          onScheduledTimeChange={onScheduledTimeChangeMock}
        />
      );

      const nowBtn = screen.getByTestId('publish-mode-now-btn');
      fireEvent.click(nowBtn);
      expect(onPublishModeChangeMock).toHaveBeenCalledWith('now');
    });

    it('kiểm tra và hiển thị cảnh báo khi thời gian đặt lịch < 10 phút', () => {
      const invalidTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      render(
        <SchedulePicker
          publishMode="schedule"
          scheduledTime={invalidTime}
          onPublishModeChange={vi.fn()}
          onScheduledTimeChange={vi.fn()}
        />
      );

      const notice = screen.getByTestId('schedule-validation-notice');
      expect(notice.textContent).toContain('ít nhất 10 phút');
    });
  });

  describe('FacebookPostCard & PostPreviewModal Components', () => {
    it('render bài viết mô phỏng đầy đủ tên Fanpage, hashtag xanh và lưới ảnh', () => {
      render(
        <FacebookPostCard
          pageName="Shop Quần Áo Nam"
          contentText="Siêu phẩm mùa hè #sale cực sốc!"
          mediaUrls={[
            'https://example.com/1.jpg',
            'https://example.com/2.jpg',
            'https://example.com/3.jpg',
            'https://example.com/4.jpg',
            'https://example.com/5.jpg',
          ]}
          mediaType="photo"
          publishMode="now"
          deviceMode="desktop"
        />
      );

      expect(screen.getByText('Shop Quần Áo Nam')).toBeDefined();
      expect(screen.getByText('#sale')).toBeDefined();
      expect(screen.getByText('+2')).toBeDefined(); // 5 ảnh => ô thứ 4 hiển thị +2
    });

    it('mở modal và chuyển đổi giữa chế độ Desktop và Mobile', () => {
      const onCloseMock = vi.fn();

      const { rerender } = render(
        <PostPreviewModal
          isOpen={true}
          onClose={onCloseMock}
          pageName="Shop Quần Áo Nam"
          contentText="Nội dung kiểm thử"
          mediaUrls={[]}
          mediaType="none"
        />
      );

      expect(screen.getByTestId('post-preview-modal')).toBeDefined();

      const mobileBtn = screen.getByTestId('preview-device-mobile-btn');
      fireEvent.click(mobileBtn);

      const closeBtn = screen.getByTestId('close-preview-modal-btn');
      fireEvent.click(closeBtn);
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  describe('NewPostPage Main Flow Integration', () => {
    it('hiển thị cảnh báo lỗi nếu bấm đăng khi chưa nhập nội dung hoặc chưa có media', async () => {
      render(<NewPostPage />);

      const submitBtn = screen.getByTestId('submit-post-btn');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('post-submit-error')).toBeDefined();
        expect(screen.getByTestId('post-submit-error').textContent).toContain('Vui lòng nhập nội dung bài viết');
      });
    });

    it('tạo và lên lịch bài viết thành công gửi payload chuẩn lên API', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Lên lịch xuất bản thành công',
          data: {
            post: { id: 'post_new_123' },
          },
        },
      });

      render(<NewPostPage />);

      // Nhập nội dung bài viết
      const textarea = screen.getByTestId('post-content-textarea');
      fireEvent.change(textarea, { target: { value: 'Bộ sưu tập đầm công sở mới nhất #new' } });

      // Bấm submit
      const submitBtn = screen.getByTestId('submit-post-btn');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/posts',
          expect.objectContaining({
            pageId: 'page_fb_100',
            contentText: 'Bộ sưu tập đầm công sở mới nhất #new',
            mediaType: 'none',
            mediaUrls: [],
          })
        );
        expect(screen.getByTestId('post-submit-success')).toBeDefined();
      });
    });
  });
});
