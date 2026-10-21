import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RuleCard } from '@/components/automation/rule-card';
import { RuleModal } from '@/components/automation/rule-modal';
import { DeleteRuleDialog } from '@/components/automation/delete-rule-dialog';
import AutomationPage from '../page';
import { useAutomationStore } from '@/lib/automation.store';
import { usePageStore } from '@/lib/page.store';
import { AutomationRule } from '@/types/automation';

// Mock apiClient
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: { rules: [] } } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    put: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

describe('Automation Rules Subsystem (TASK-18)', () => {
  const sampleRule: AutomationRule = {
    id: 'rule_101',
    pageId: 'page_meta_1',
    ruleName: 'Tự động báo giá váy hoa',
    hidePhoneEnabled: true,
    triggerKeywords: ['giá', 'bao nhiêu', 'inbox'],
    autoCommentTemplate: 'Dạ shop đã gửi chi tiết qua tin nhắn cho bạn {{customer_name}} rồi ạ!',
    autoPrivateReplyTemplate: 'Chào {{customer_name}}, váy hoa nhí giá 290k freeship toàn quốc nhé!',
    isActive: true,
    createdAt: '2026-10-21T08:00:00.000Z',
    updatedAt: '2026-10-21T08:00:00.000Z',
  };

  const sampleRule2: AutomationRule = {
    id: 'rule_102',
    pageId: 'page_meta_1',
    ruleName: 'Tư vấn chọn size giày',
    hidePhoneEnabled: false,
    triggerKeywords: ['size', 'chân'],
    autoCommentTemplate: null,
    autoPrivateReplyTemplate: 'Dạ bạn đi size bao nhiêu để shop kiểm tra kho nha!',
    isActive: false,
    createdAt: '2026-10-21T09:00:00.000Z',
    updatedAt: '2026-10-21T09:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    usePageStore.setState({
      pages: [
        {
          id: 'page_meta_1',
          pageId: 'page_meta_1',
          pageName: 'Shop Thời Trang Nữ Cao Cấp',
          userId: 'user_1',
          isActive: true,
          webhookSubscribed: true,
          createdAt: '2026-10-20T00:00:00.000Z',
          updatedAt: '2026-10-20T00:00:00.000Z',
        },
      ],
      selectedPage: {
        id: 'page_meta_1',
        pageId: 'page_meta_1',
        pageName: 'Shop Thời Trang Nữ Cao Cấp',
        userId: 'user_1',
        isActive: true,
        webhookSubscribed: true,
        createdAt: '2026-10-20T00:00:00.000Z',
        updatedAt: '2026-10-20T00:00:00.000Z',
      },
      isLoading: false,
      error: null,
    });

    useAutomationStore.setState({
      rules: [sampleRule, sampleRule2],
      isLoading: false,
      error: null,
      searchQuery: '',
    });
  });

  describe('1. RuleCard Component', () => {
    it('hiển thị đầy đủ thông tin tên quy tắc, từ khóa và nhãn ẩn SĐT', () => {
      const onToggle = vi.fn();
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <RuleCard
          rule={sampleRule}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

      expect(screen.getByText('Tự động báo giá váy hoa')).toBeInTheDocument();
      expect(screen.getByText('● Đang kích hoạt')).toBeInTheDocument();
      expect(screen.getByText('#giá')).toBeInTheDocument();
      expect(screen.getByText('#bao nhiêu')).toBeInTheDocument();
      expect(screen.getByText('#inbox')).toBeInTheDocument();
      expect(screen.getByText(/Tự động ẩn SĐT khách hàng/i)).toBeInTheDocument();
      expect(screen.getByText('Chỉnh sửa')).toBeInTheDocument();
      expect(screen.getByText('Xóa')).toBeInTheDocument();
    });

    it('kích hoạt sự kiện onToggle khi nhấn switch chuyển trạng thái', () => {
      const onToggle = vi.fn();
      render(
        <RuleCard
          rule={sampleRule}
          onToggle={onToggle}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      );

      const switchBtn = screen.getByRole('switch');
      fireEvent.click(switchBtn);

      expect(onToggle).toHaveBeenCalledWith(sampleRule, false);
    });

    it('kích hoạt onEdit và onDelete khi bấm các nút tương ứng', () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <RuleCard
          rule={sampleRule}
          onToggle={vi.fn()}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

      fireEvent.click(screen.getByText('Chỉnh sửa'));
      expect(onEdit).toHaveBeenCalledWith(sampleRule);

      fireEvent.click(screen.getByText('Xóa'));
      expect(onDelete).toHaveBeenCalledWith(sampleRule);
    });
  });

  describe('2. RuleModal Component', () => {
    it('cho phép thêm và xóa tag từ khóa kích hoạt', () => {
      render(
        <RuleModal
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={vi.fn().mockResolvedValue(true)}
        />
      );

      const keywordInput = screen.getByPlaceholderText(/Nhập từ khóa và bấm Enter/i);
      fireEvent.change(keywordInput, { target: { value: 'freeship' } });
      fireEvent.keyDown(keywordInput, { key: 'Enter', code: 'Enter' });

      expect(screen.getByText('#freeship')).toBeInTheDocument();

      // Xóa tag từ khóa
      const deleteKeywordBtn = screen.getByRole('button', { name: /Xóa từ khóa freeship/i });
      fireEvent.click(deleteKeywordBtn);

      expect(screen.queryByText('#freeship')).not.toBeInTheDocument();
    });

    it('cho phép chèn biến động vào mẫu phản hồi', () => {
      render(
        <RuleModal
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={vi.fn().mockResolvedValue(true)}
        />
      );

      const insertNameBtn = screen.getByText(/\+ Tên khách hàng/i);
      fireEvent.click(insertNameBtn);

      const commentTextarea = screen.getByPlaceholderText(/Dạ shop đã gửi thông tin qua tin nhắn/i) as HTMLTextAreaElement;
      expect(commentTextarea.value).toContain('{{customer_name}}');
    });

    it('hiển thị cảnh báo lỗi khi submit tên quy tắc trống', async () => {
      const onSubmit = vi.fn();
      render(
        <RuleModal
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={onSubmit}
        />
      );

      const submitBtn = screen.getByText('Lưu kịch bản mới');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập tên quy tắc')).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('submit thành công khi dữ liệu hợp lệ', async () => {
      const onSubmit = vi.fn().mockResolvedValue(true);
      const onClose = vi.fn();

      render(
        <RuleModal
          isOpen={true}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      );

      const nameInput = screen.getByPlaceholderText(/Ví dụ: Tự động báo giá son dưỡng/i);
      fireEvent.change(nameInput, { target: { value: 'Kịch bản Test Thành Công' } });

      const submitBtn = screen.getByText('Lưu kịch bản mới');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            rule_name: 'Kịch bản Test Thành Công',
            hide_phone_enabled: true,
          })
        );
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('3. DeleteRuleDialog Component', () => {
    it('hiển thị tên quy tắc cần xóa và gọi onConfirm khi bấm xác nhận', async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();

      render(
        <DeleteRuleDialog
          isOpen={true}
          rule={sampleRule}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      );

      expect(screen.getByText(/Bạn có chắc chắn muốn xóa vĩnh viễn kịch bản/i)).toBeInTheDocument();
      expect(screen.getByText('"Tự động báo giá váy hoa"')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Đồng ý xóa'));
      expect(onConfirm).toHaveBeenCalled();

      fireEvent.click(screen.getByText('Hủy bỏ'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('4. AutomationPage Assembly', () => {
    it('kết nối đồng bộ và hiển thị đầy đủ danh sách kịch bản và metrics', () => {
      render(<AutomationPage />);

      expect(screen.getByText('Kịch Bản Tự Động & Ẩn SĐT')).toBeInTheDocument();
      expect(screen.getByText('Tự động báo giá váy hoa')).toBeInTheDocument();
      expect(screen.getByText('Tư vấn chọn size giày')).toBeInTheDocument();

      // Metrics cards
      expect(screen.getByText('Tổng kịch bản')).toBeInTheDocument();
      expect(screen.getByText('Đang kích hoạt')).toBeInTheDocument();
      expect(screen.getByText('Ẩn SĐT tự động')).toBeInTheDocument();
      expect(screen.getByText('Phản hồi Inbox')).toBeInTheDocument();
    });

    it('lọc kịch bản theo thanh tìm kiếm', () => {
      render(<AutomationPage />);

      const searchInput = screen.getByPlaceholderText(/Tìm theo tên hoặc từ khóa/i);
      fireEvent.change(searchInput, { target: { value: 'váy hoa' } });

      expect(screen.getByText('Tự động báo giá váy hoa')).toBeInTheDocument();
      expect(screen.queryByText('Tư vấn chọn size giày')).not.toBeInTheDocument();
    });

    it('mở modal tạo mới kịch bản khi nhấn nút "+ Tạo Kịch Bản Mới"', () => {
      render(<AutomationPage />);

      const createBtn = screen.getByTestId('create-rule-btn');
      fireEvent.click(createBtn);

      expect(screen.getByText('Tạo mới kịch bản tự động')).toBeInTheDocument();
    });

    it('hiển thị Empty State khi chưa có kịch bản nào', () => {
      useAutomationStore.setState({ rules: [] });

      render(<AutomationPage />);

      expect(screen.getByText('Chưa có kịch bản tự động hóa nào')).toBeInTheDocument();
      expect(screen.getByText('Tạo kịch bản đầu tiên')).toBeInTheDocument();
    });
  });
});
