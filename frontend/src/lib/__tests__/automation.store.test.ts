import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAutomationStore } from '../automation.store';
import { apiClient } from '../api-client';

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Automation Store (useAutomationStore)', () => {
  const mockRawRules = [
    {
      id: 'rule_1',
      page_id: 'page_123',
      rule_name: 'Tự động báo giá son dưỡng',
      hide_phone_enabled: true,
      trigger_keywords: ['giá', 'bao nhiêu', 'inbox'],
      auto_comment_template: 'Dạ shop đã gửi thông tin qua tin nhắn cho bạn {{customer_name}} rồi ạ!',
      auto_private_reply_template: 'Chào {{customer_name}}, son dưỡng có giá 180k đang freeship nhé!',
      is_active: true,
      created_at: '2026-10-21T08:00:00.000Z',
      updated_at: '2026-10-21T08:00:00.000Z',
    },
    {
      id: 'rule_2',
      page_id: 'page_123',
      rule_name: 'Tự động tư vấn size quần áo',
      hide_phone_enabled: false,
      trigger_keywords: ['size', 'chiều cao', 'cân nặng'],
      auto_comment_template: null,
      auto_private_reply_template: 'Dạ bạn gửi chiều cao cân nặng để shop tư vấn size chuẩn nha!',
      is_active: false,
      created_at: '2026-10-21T09:00:00.000Z',
      updated_at: '2026-10-21T09:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAutomationStore.setState({
      rules: [],
      isLoading: false,
      error: null,
      searchQuery: '',
    });
  });

  it('khởi tạo với trạng thái mặc định chính xác', () => {
    const state = useAutomationStore.getState();
    expect(state.rules).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.searchQuery).toBe('');
  });

  it('setSearchQuery cập nhật từ khóa tìm kiếm', () => {
    useAutomationStore.getState().setSearchQuery('báo giá');
    expect(useAutomationStore.getState().searchQuery).toBe('báo giá');
  });

  it('clearError xóa thông báo lỗi', () => {
    useAutomationStore.setState({ error: 'Có lỗi xảy ra' });
    useAutomationStore.getState().clearError();
    expect(useAutomationStore.getState().error).toBeNull();
  });

  describe('fetchRules', () => {
    it('không gọi API và xóa state nếu pageId rỗng', async () => {
      await useAutomationStore.getState().fetchRules('');
      expect(apiClient.get).not.toHaveBeenCalled();
      expect(useAutomationStore.getState().rules).toEqual([]);
    });

    it('tải danh sách kịch bản và chuẩn hóa dữ liệu thành công', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: { rules: mockRawRules },
        },
      });

      await useAutomationStore.getState().fetchRules('page_123');

      expect(apiClient.get).toHaveBeenCalledWith('/pages/page_123/rules');
      const rules = useAutomationStore.getState().rules;
      expect(rules).toHaveLength(2);
      expect(rules[0].ruleName).toBe('Tự động báo giá son dưỡng');
      expect(rules[0].hidePhoneEnabled).toBe(true);
      expect(rules[0].triggerKeywords).toEqual(['giá', 'bao nhiêu', 'inbox']);
      expect(rules[0].isActive).toBe(true);
      expect(rules[1].isActive).toBe(false);
      expect(useAutomationStore.getState().isLoading).toBe(false);
      expect(useAutomationStore.getState().error).toBeNull();
    });

    it('bắt và ghi nhận lỗi khi gọi API thất bại', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        response: { data: { message: 'Không có quyền truy cập Fanpage' } },
      });

      await useAutomationStore.getState().fetchRules('page_invalid');

      expect(useAutomationStore.getState().isLoading).toBe(false);
      expect(useAutomationStore.getState().error).toBe('Không có quyền truy cập Fanpage');
    });
  });

  describe('createRule', () => {
    it('tạo kịch bản mới và thêm vào đầu danh sách thành công', async () => {
      const newRuleRaw = {
        id: 'rule_3',
        page_id: 'page_123',
        rule_name: 'Tự động báo ship',
        hide_phone_enabled: true,
        trigger_keywords: ['freeship', 'ship'],
        auto_comment_template: 'Dạ đơn từ 200k freeship ạ',
        auto_private_reply_template: null,
        is_active: true,
        created_at: '2026-10-21T10:00:00.000Z',
        updated_at: '2026-10-21T10:00:00.000Z',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: { rule: newRuleRaw },
        },
      });

      const result = await useAutomationStore.getState().createRule('page_123', {
        rule_name: 'Tự động báo ship',
        trigger_keywords: ['freeship', 'ship'],
        auto_comment_template: 'Dạ đơn từ 200k freeship ạ',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/pages/page_123/rules', {
        rule_name: 'Tự động báo ship',
        trigger_keywords: ['freeship', 'ship'],
        auto_comment_template: 'Dạ đơn từ 200k freeship ạ',
      });
      expect(result).not.toBeNull();
      expect(result?.ruleName).toBe('Tự động báo ship');
      expect(useAutomationStore.getState().rules).toHaveLength(1);
      expect(useAutomationStore.getState().rules[0].id).toBe('rule_3');
    });

    it('xử lý lỗi khi tạo kịch bản thất bại', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Tên quy tắc đã tồn tại'));

      const result = await useAutomationStore.getState().createRule('page_123', {
        rule_name: 'Lỗi',
        trigger_keywords: ['test'],
      });

      expect(result).toBeNull();
      expect(useAutomationStore.getState().error).toBe('Tên quy tắc đã tồn tại');
    });
  });

  describe('updateRule', () => {
    it('cập nhật kịch bản thành công', async () => {
      useAutomationStore.setState({
        rules: [
          {
            id: 'rule_1',
            pageId: 'page_123',
            ruleName: 'Cũ',
            hidePhoneEnabled: false,
            triggerKeywords: ['cu'],
            autoCommentTemplate: null,
            autoPrivateReplyTemplate: null,
            isActive: false,
            createdAt: '2026-10-21T08:00:00.000Z',
            updatedAt: '2026-10-21T08:00:00.000Z',
          },
        ],
      });

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            rule: {
              id: 'rule_1',
              page_id: 'page_123',
              rule_name: 'Mới đã sửa',
              hide_phone_enabled: true,
              trigger_keywords: ['moi'],
              auto_comment_template: 'Alo',
              auto_private_reply_template: null,
              is_active: true,
              created_at: '2026-10-21T08:00:00.000Z',
              updated_at: '2026-10-21T10:00:00.000Z',
            },
          },
        },
      });

      const updated = await useAutomationStore.getState().updateRule('page_123', 'rule_1', {
        rule_name: 'Mới đã sửa',
        hide_phone_enabled: true,
      });

      expect(apiClient.put).toHaveBeenCalledWith('/pages/page_123/rules/rule_1', {
        rule_name: 'Mới đã sửa',
        hide_phone_enabled: true,
      });
      expect(updated?.ruleName).toBe('Mới đã sửa');
      expect(useAutomationStore.getState().rules[0].ruleName).toBe('Mới đã sửa');
    });
  });

  describe('toggleRuleActive (Optimistic Update)', () => {
    it('cập nhật lạc quan trạng thái isActive thành công', async () => {
      useAutomationStore.setState({
        rules: [
          {
            id: 'rule_1',
            pageId: 'page_123',
            ruleName: 'Rule 1',
            hidePhoneEnabled: true,
            triggerKeywords: ['test'],
            autoCommentTemplate: null,
            autoPrivateReplyTemplate: null,
            isActive: true,
            createdAt: '2026-10-21T08:00:00.000Z',
            updatedAt: '2026-10-21T08:00:00.000Z',
          },
        ],
      });

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { success: true },
      });

      const promise = useAutomationStore.getState().toggleRuleActive('page_123', 'rule_1', false);
      // Ngay lập tức UI được cập nhật lạc quan
      expect(useAutomationStore.getState().rules[0].isActive).toBe(false);

      const success = await promise;
      expect(success).toBe(true);
      expect(apiClient.put).toHaveBeenCalledWith('/pages/page_123/rules/rule_1', {
        is_active: false,
      });
    });

    it('rollback về trạng thái cũ khi API gọi thất bại', async () => {
      useAutomationStore.setState({
        rules: [
          {
            id: 'rule_1',
            pageId: 'page_123',
            ruleName: 'Rule 1',
            hidePhoneEnabled: true,
            triggerKeywords: ['test'],
            autoCommentTemplate: null,
            autoPrivateReplyTemplate: null,
            isActive: true,
            createdAt: '2026-10-21T08:00:00.000Z',
            updatedAt: '2026-10-21T08:00:00.000Z',
          },
        ],
      });

      vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('Mất kết nối mạng'));

      const success = await useAutomationStore.getState().toggleRuleActive('page_123', 'rule_1', false);

      expect(success).toBe(false);
      // Trạng thái đã được rollback lại true
      expect(useAutomationStore.getState().rules[0].isActive).toBe(true);
      expect(useAutomationStore.getState().error).toBe('Mất kết nối mạng');
    });
  });

  describe('deleteRule', () => {
    it('xóa kịch bản thành công và gỡ khỏi danh sách', async () => {
      useAutomationStore.setState({
        rules: [
          {
            id: 'rule_1',
            pageId: 'page_123',
            ruleName: 'Rule 1',
            hidePhoneEnabled: true,
            triggerKeywords: ['test'],
            autoCommentTemplate: null,
            autoPrivateReplyTemplate: null,
            isActive: true,
            createdAt: '2026-10-21T08:00:00.000Z',
            updatedAt: '2026-10-21T08:00:00.000Z',
          },
        ],
      });

      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true },
      });

      const success = await useAutomationStore.getState().deleteRule('page_123', 'rule_1');

      expect(apiClient.delete).toHaveBeenCalledWith('/pages/page_123/rules/rule_1');
      expect(success).toBe(true);
      expect(useAutomationStore.getState().rules).toHaveLength(0);
    });

    it('ghi nhận lỗi khi xóa kịch bản thất bại', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Kịch bản không tồn tại'));

      const success = await useAutomationStore.getState().deleteRule('page_123', 'rule_not_found');

      expect(success).toBe(false);
      expect(useAutomationStore.getState().error).toBe('Kịch bản không tồn tại');
    });
  });
});
