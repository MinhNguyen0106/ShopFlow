import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOrderStore } from '../order.store';
import { apiClient } from '../api-client';
import { maskPhoneNumber, normalizeOrder } from '../../types/order';

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Order Store & Normalizer (useOrderStore)', () => {
  const mockRawOrder = {
    id: 'ord-123',
    order_code: 'ORD-2026-001',
    page_id: 'page_123',
    customer: {
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      address: 'Số 10 Tràng Thi, Hà Nội',
    },
    items: [
      {
        id: 'item-1',
        sku: 'AOPOLO01',
        name: 'Áo Polo Nam',
        quantity: 2,
        price: 250000,
        variant: { color: 'Đen', size: 'L' },
      },
    ],
    total_amount: 500000,
    shipping_fee: 30000,
    discount_amount: 0,
    final_amount: 530000,
    status: 'pending',
    payment_status: 'unpaid',
    payment_method: 'cod',
    source: 'facebook_comment',
    timeline: [
      {
        id: 'tl-1',
        status: 'pending',
        note: 'Đơn tạo từ bình luận',
        timestamp: '2026-10-21T08:00:00.000Z',
      },
    ],
    created_at: '2026-10-21T08:00:00.000Z',
    updated_at: '2026-10-21T08:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useOrderStore.setState({
      orders: [],
      selectedOrder: null,
      filters: { status: 'all', search: '', pageId: null },
      pagination: { page: 1, limit: 15, total: 0, totalPages: 1 },
      isLoading: false,
      isUpdating: false,
      error: null,
    });
  });

  describe('maskPhoneNumber() & normalizeOrder()', () => {
    it('che giấu chính xác 4 số giữa của số điện thoại', () => {
      expect(maskPhoneNumber('0987654321')).toBe('098****321');
      expect(maskPhoneNumber('0912345678')).toBe('091****678');
      expect(maskPhoneNumber('12345')).toBe('12345');
      expect(maskPhoneNumber('')).toBe('Chưa có SĐT');
      expect(maskPhoneNumber(null)).toBe('Chưa có SĐT');
    });

    it('chuẩn hóa an toàn dữ liệu từ backend (snake_case -> camelCase)', () => {
      const normalized = normalizeOrder(mockRawOrder);
      expect(normalized.id).toBe('ord-123');
      expect(normalized.orderCode).toBe('ORD-2026-001');
      expect(normalized.customer.name).toBe('Nguyễn Văn A');
      expect(normalized.customer.maskedPhone).toBe('098****321');
      expect(normalized.items).toHaveLength(1);
      expect(normalized.items[0].sku).toBe('AOPOLO01');
      expect(normalized.totalAmount).toBe(500000);
      expect(normalized.finalAmount).toBe(530000);
      expect(normalized.status).toBe('pending');
    });

    it('xử lý an toàn khi payload null/undefined không gây crash', () => {
      const normalized = normalizeOrder(null);
      expect(normalized.id).toContain('err-');
      expect(normalized.orderCode).toBe('ORD-ERR');
      expect(normalized.items).toEqual([]);
      expect(normalized.customer.maskedPhone).toBe('Chưa có SĐT');
    });
  });

  describe('Store Actions', () => {
    it('khởi tạo với trạng thái mặc định chính xác', () => {
      const state = useOrderStore.getState();
      expect(state.orders).toEqual([]);
      expect(state.selectedOrder).toBeNull();
      expect(state.filters.status).toBe('all');
      expect(state.filters.search).toBe('');
    });

    it('setSearchQuery và setStatusFilter cập nhật bộ lọc và reset page = 1', () => {
      useOrderStore.getState().setPage(3);
      useOrderStore.getState().setSearchQuery('0987');
      expect(useOrderStore.getState().filters.search).toBe('0987');
      expect(useOrderStore.getState().pagination.page).toBe(1);

      useOrderStore.getState().setStatusFilter('shipping');
      expect(useOrderStore.getState().filters.status).toBe('shipping');
      expect(useOrderStore.getState().pagination.page).toBe(1);
    });

    it('selectOrder gán đơn hàng được chọn', () => {
      const order = normalizeOrder(mockRawOrder);
      useOrderStore.getState().selectOrder(order);
      expect(useOrderStore.getState().selectedOrder?.id).toBe('ord-123');

      useOrderStore.getState().selectOrder(null);
      expect(useOrderStore.getState().selectedOrder).toBeNull();
    });

    it('fetchOrders không làm gì nếu không có pageId', async () => {
      await useOrderStore.getState().fetchOrders('');
      expect(apiClient.get).not.toHaveBeenCalled();
      expect(useOrderStore.getState().orders).toEqual([]);
    });

    it('fetchOrders nạp danh sách, tính toán metrics và phân trang thành công', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            items: [mockRawOrder],
            pagination: { total: 1 },
          },
        },
      });

      await useOrderStore.getState().fetchOrders('page_123');

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/orders?pageId=page_123')
      );
      const state = useOrderStore.getState();
      expect(state.orders).toHaveLength(1);
      expect(state.orders[0].orderCode).toBe('ORD-2026-001');
      expect(state.metrics.totalToday).toBe(1);
      expect(state.metrics.pendingCount).toBe(1);
      expect(state.metrics.estimatedRevenueToday).toBe(530000);
      expect(state.isLoading).toBe(false);
    });

    it('fetchOrders ghi nhận lỗi khi API thất bại', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network Error'));

      await useOrderStore.getState().fetchOrders('page_123');

      const state = useOrderStore.getState();
      expect(state.error).toBe('Network Error');
      expect(state.isLoading).toBe(false);
    });

    it('updateOrderStatus cập nhật lạc quan (Optimistic) và gọi API', async () => {
      const order = normalizeOrder(mockRawOrder);
      useOrderStore.setState({ orders: [order], selectedOrder: order });

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { success: true },
      });

      const promise = useOrderStore.getState().updateOrderStatus('ord-123', 'confirmed');

      // Ngay lập tức kiểm tra Optimistic state
      expect(useOrderStore.getState().orders[0].status).toBe('confirmed');
      expect(useOrderStore.getState().selectedOrder?.status).toBe('confirmed');

      const result = await promise;
      expect(result).toBe(true);
      expect(apiClient.patch).toHaveBeenCalledWith('/orders/ord-123/status', {
        status: 'confirmed',
      });
      expect(useOrderStore.getState().isUpdating).toBe(false);
    });

    it('updateOrderStatus rollback trạng thái nếu backend gọi lỗi', async () => {
      const order = normalizeOrder(mockRawOrder);
      useOrderStore.setState({ orders: [order], selectedOrder: order });

      vi.mocked(apiClient.patch).mockRejectedValueOnce({
        response: { data: { message: 'Không thể trừ tồn kho' } },
      });

      const result = await useOrderStore.getState().updateOrderStatus('ord-123', 'confirmed');

      expect(result).toBe(false);
      // Đã rollback về pending
      expect(useOrderStore.getState().orders[0].status).toBe('pending');
      expect(useOrderStore.getState().selectedOrder?.status).toBe('pending');
      expect(useOrderStore.getState().error).toBe('Không thể trừ tồn kho');
      expect(useOrderStore.getState().isUpdating).toBe(false);
    });

    it('handleSocketStatusUpdate cập nhật trạng thái đơn hàng thời gian thực', () => {
      const order = normalizeOrder(mockRawOrder);
      useOrderStore.setState({ orders: [order], selectedOrder: order });

      useOrderStore.getState().handleSocketStatusUpdate({
        orderId: 'ord-123',
        status: 'shipping',
        updatedAt: '2026-10-21T10:00:00.000Z',
      });

      expect(useOrderStore.getState().orders[0].status).toBe('shipping');
      expect(useOrderStore.getState().selectedOrder?.status).toBe('shipping');
      expect(useOrderStore.getState().orders[0].timeline).toHaveLength(2);
    });

    it('handleSocketNewOrder chèn đơn mới vào đầu danh sách', () => {
      useOrderStore.setState({
        orders: [normalizeOrder(mockRawOrder)],
        filters: { status: 'all', search: '', pageId: 'page_123' },
        pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
      });

      const newRawOrder = {
        ...mockRawOrder,
        id: 'ord-999',
        order_code: 'ORD-999',
      };

      useOrderStore.getState().handleSocketNewOrder(newRawOrder);

      expect(useOrderStore.getState().orders).toHaveLength(2);
      expect(useOrderStore.getState().orders[0].id).toBe('ord-999');
      expect(useOrderStore.getState().pagination.total).toBe(2);
    });
  });
});
