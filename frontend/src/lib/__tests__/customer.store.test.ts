/**
 * ShopFlow - Unit Tests: Customer CRM Zustand Store (TASK-27)
 * File: frontend/src/lib/__tests__/customer.store.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCustomerStore } from '../customer.store';
import { apiClient } from '../api-client';
import { DEFAULT_CUSTOMER_METRICS, DEFAULT_CUSTOMER_FILTERS } from '../../types/customer';

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useCustomerStore', () => {
  const mockCustomer = {
    id: 'cust-123',
    pageId: 'page-456',
    customerFbId: 'fb-user-999',
    customerName: 'Trần Văn Long',
    phoneNumber: '0981234567',
    address: 'Quận 1, TP.HCM',
    tags: ['Co_SDT', 'Khach_VIP'],
    notes: 'Ưu tiên giao sáng',
    lifetimeValue: 2400000,
    totalOrders: 4,
    lastOrderAt: '2026-10-25T10:00:00.000Z',
    lastInteractionAt: '2026-10-25T10:00:00.000Z',
    createdAt: '2026-10-01T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useCustomerStore.setState({
      customers: [],
      selectedCustomer: null,
      customerOrders: [],
      metrics: DEFAULT_CUSTOMER_METRICS,
      filters: DEFAULT_CUSTOMER_FILTERS,
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      isLoading: false,
      isLoadingOrders: false,
      isUpdatingTag: false,
      error: null,
    });
  });

  describe('fetchCustomers()', () => {
    it('tải danh sách khách hàng và chuẩn hóa dữ liệu thành công', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockCustomer],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
      });

      await useCustomerStore.getState().fetchCustomers('page-456');

      const state = useCustomerStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.customers).toHaveLength(1);
      expect(state.customers[0]?.customerName).toBe('Trần Văn Long');
      expect(state.pagination.total).toBe(1);
    });

    it('bắt lỗi và lưu thông báo error khi API gặp sự cố', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network Error'));

      await useCustomerStore.getState().fetchCustomers('page-456');

      const state = useCustomerStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network Error');
    });
  });

  describe('fetchMetrics()', () => {
    it('cập nhật 4 chỉ số CRM Metrics thành công', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            totalCustomers: 200,
            leadsWithPhone: 150,
            vipCustomers: 25,
            totalLifetimeValue: 80000000,
          },
        },
      });

      await useCustomerStore.getState().fetchMetrics('page-456');

      const state = useCustomerStore.getState();
      expect(state.metrics.totalCustomers).toBe(200);
      expect(state.metrics.totalLifetimeValue).toBe(80000000);
    });
  });

  describe('addTag() - Optimistic Update & Rollback', () => {
    it('cập nhật lạc quan ngay lập tức và đồng bộ khi API thành công', async () => {
      useCustomerStore.setState({
        customers: [{ ...mockCustomer, tags: ['Co_SDT'] }],
        selectedCustomer: { ...mockCustomer, tags: ['Co_SDT'] },
      });

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...mockCustomer, tags: ['Co_SDT', 'Khach_VIP'] },
        },
      });

      const promise = useCustomerStore.getState().addTag('cust-123', 'Khach_VIP');

      // Kiểm tra optimistic: state phải có tag mới ngay lập tức
      expect(useCustomerStore.getState().customers[0]?.tags).toContain('Khach_VIP');

      const success = await promise;
      expect(success).toBe(true);
      expect(useCustomerStore.getState().isUpdatingTag).toBe(false);
    });

    it('tự động rollback về mảng tags cũ khi API trả về lỗi', async () => {
      useCustomerStore.setState({
        customers: [{ ...mockCustomer, tags: ['Co_SDT'] }],
        selectedCustomer: { ...mockCustomer, tags: ['Co_SDT'] },
      });

      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Server Error'));

      const success = await useCustomerStore.getState().addTag('cust-123', 'Khach_VIP');

      expect(success).toBe(false);
      // Đã rollback lại mảng tags ban đầu
      expect(useCustomerStore.getState().customers[0]?.tags).toEqual(['Co_SDT']);
      expect(useCustomerStore.getState().error).toBe('Server Error');
    });
  });

  describe('removeTag() - Optimistic Update & Rollback', () => {
    it('gỡ tag lạc quan ngay lập tức và đồng bộ khi API thành công', async () => {
      useCustomerStore.setState({
        customers: [{ ...mockCustomer, tags: ['Co_SDT', 'Khach_VIP'] }],
      });

      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...mockCustomer, tags: ['Khach_VIP'] },
        },
      });

      const success = await useCustomerStore.getState().removeTag('cust-123', 'Co_SDT');

      expect(success).toBe(true);
      expect(useCustomerStore.getState().customers[0]?.tags).not.toContain('Co_SDT');
    });

    it('tự động rollback tag đã xóa khi API lỗi', async () => {
      useCustomerStore.setState({
        customers: [{ ...mockCustomer, tags: ['Co_SDT', 'Khach_VIP'] }],
      });

      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Timeout'));

      const success = await useCustomerStore.getState().removeTag('cust-123', 'Co_SDT');

      expect(success).toBe(false);
      expect(useCustomerStore.getState().customers[0]?.tags).toContain('Co_SDT');
    });
  });

  describe('Filters & Selection', () => {
    it('cập nhật bộ lọc tìm kiếm và reset về trang 1', () => {
      useCustomerStore.setState({
        pagination: { page: 3, limit: 20, total: 50, totalPages: 3 },
      });

      useCustomerStore.getState().setSearchQuery('Áo thun');

      expect(useCustomerStore.getState().filters.search).toBe('Áo thun');
      expect(useCustomerStore.getState().filters.page).toBe(1);
    });

    it('cập nhật bộ lọc tags', () => {
      useCustomerStore.getState().setTagsFilter(['Co_SDT']);
      expect(useCustomerStore.getState().filters.tags).toEqual(['Co_SDT']);
    });

    it('chọn khách hàng và tự động tải danh sách đơn hàng', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            {
              id: 'ord-1',
              orderCode: 'ORD-001',
              status: 'completed',
              finalAmount: 500000,
            },
          ],
        },
      });

      useCustomerStore.getState().selectCustomer(mockCustomer);

      expect(useCustomerStore.getState().selectedCustomer?.id).toBe('cust-123');
      // Đợi call ngầm fetchCustomerOrders
      await vi.waitFor(() => {
        expect(useCustomerStore.getState().customerOrders).toHaveLength(1);
      });
    });
  });
});
