/**
 * ShopFlow - Unit Tests: customer.repository.ts (TASK-27)
 * File: backend/src/infrastructure/repositories/__tests__/customer.repository.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerRepository, Customer } from '../customer.repository.js';
import * as dbClient from '../../database/db.client.js';

vi.mock('../../database/db.client.js', () => ({
  query: vi.fn(),
}));

describe('CustomerRepository', () => {
  let repo: CustomerRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new CustomerRepository();
  });

  const mockCustomer: Customer = {
    id: 'cust-uuid-1',
    page_id: 'page-uuid-1',
    customer_fb_id: 'fb-user-123',
    customer_name: 'Nguyễn Văn A',
    phone_number: '0981234567',
    address: 'Hà Nội',
    tags: ['Co_SDT'],
    notes: 'Khách VIP',
    last_interaction_at: new Date('2026-10-25T10:00:00Z'),
    created_at: new Date('2026-10-20T10:00:00Z'),
  };

  describe('upsertWithPhone()', () => {
    it('nên chèn/cập nhật thông tin khách hàng kèm nhãn Co_SDT', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [mockCustomer],
        rowCount: 1,
        command: 'INSERT',
      });

      const result = await repo.upsertWithPhone(
        'page-uuid-1',
        'fb-user-123',
        'Nguyễn Văn A',
        '0981234567',
        'Co_SDT'
      );

      expect(result).toEqual(mockCustomer);
      expect(dbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO customers'),
        expect.arrayContaining(['page-uuid-1', 'fb-user-123', 'Nguyễn Văn A', '0981234567', 'Co_SDT'])
      );
    });
  });

  describe('findByFbId()', () => {
    it('nên tìm thấy khách hàng theo page_id và customer_fb_id', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [mockCustomer],
        rowCount: 1,
        command: 'SELECT',
      });

      const result = await repo.findByFbId('page-uuid-1', 'fb-user-123');
      expect(result).toEqual(mockCustomer);
    });

    it('nên trả về null nếu không tìm thấy khách hàng', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
      });

      const result = await repo.findByFbId('page-uuid-1', 'fb-user-not-found');
      expect(result).toBeNull();
    });
  });

  describe('findWithStats()', () => {
    it('nên truy vấn danh sách khách hàng có LTV và phân trang chính xác', async () => {
      // Mock count query
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [{ total: '1' }],
        rowCount: 1,
        command: 'SELECT',
      });

      // Mock data query
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [
          {
            ...mockCustomer,
            lifetime_value: '500000',
            total_orders: 2,
            last_order_at: '2026-10-25T11:00:00Z',
          },
        ],
        rowCount: 1,
        command: 'SELECT',
      });

      const result = await repo.findWithStats({
        pageId: 'page-uuid-1',
        search: 'Nguyễn',
        tags: ['Co_SDT'],
        sortBy: 'lifetimeValue',
        sortOrder: 'desc',
        page: 1,
        limit: 20,
      });

      expect(result.total).toBe(1);
      expect(result.customers).toHaveLength(1);
      expect(result.customers[0]?.lifetime_value).toBe(500000);
      expect(result.customers[0]?.total_orders).toBe(2);
      expect(dbClient.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('findDetailStatsById()', () => {
    it('nên trả về chi tiết khách hàng kèm AOV tính toán', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [
          {
            ...mockCustomer,
            lifetime_value: '1000000',
            total_orders: 4,
            last_order_at: '2026-10-25T12:00:00Z',
          },
        ],
        rowCount: 1,
        command: 'SELECT',
      });

      const result = await repo.findDetailStatsById('cust-uuid-1');
      expect(result).not.toBeNull();
      expect(result?.lifetime_value).toBe(1000000);
      expect(result?.total_orders).toBe(4);
      expect(result?.aov).toBe(250000);
    });

    it('nên trả về null nếu không tìm thấy id', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
      });

      const result = await repo.findDetailStatsById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getCustomerOrders()', () => {
    it('nên trả về danh sách tóm tắt đơn hàng của khách', async () => {
      const mockOrder = {
        id: 'order-1',
        order_code: 'ORD-001',
        status: 'completed',
        payment_status: 'paid',
        payment_method: 'vietqr',
        total_amount: '250000',
        final_amount: '250000',
        created_at: new Date(),
      };

      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [mockOrder],
        rowCount: 1,
        command: 'SELECT',
      });

      const orders = await repo.getCustomerOrders('cust-uuid-1');
      expect(orders).toHaveLength(1);
      expect(orders[0]?.order_code).toBe('ORD-001');
      expect(orders[0]?.final_amount).toBe(250000);
    });
  });

  describe('addTag() & removeTag()', () => {
    it('nên thêm tag thành công', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [{ ...mockCustomer, tags: ['Co_SDT', 'Khach_VIP'] }],
        rowCount: 1,
        command: 'UPDATE',
      });

      const updated = await repo.addTag('cust-uuid-1', 'Khach_VIP');
      expect(updated?.tags).toContain('Khach_VIP');
    });

    it('nên xóa tag thành công', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [{ ...mockCustomer, tags: [] }],
        rowCount: 1,
        command: 'UPDATE',
      });

      const updated = await repo.removeTag('cust-uuid-1', 'Co_SDT');
      expect(updated?.tags).not.toContain('Co_SDT');
    });
  });

  describe('getMetricsSummary()', () => {
    it('nên trả về 4 chỉ số CRM chính xác', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [
          {
            total_customers: 120,
            leads_with_phone: 95,
            vip_customers: 18,
            total_lifetime_value: '45000000',
          },
        ],
        rowCount: 1,
        command: 'SELECT',
      });

      const metrics = await repo.getMetricsSummary('page-uuid-1');
      expect(metrics.totalCustomers).toBe(120);
      expect(metrics.leadsWithPhone).toBe(95);
      expect(metrics.vipCustomers).toBe(18);
      expect(metrics.totalLifetimeValue).toBe(45000000);
    });
  });

  describe('update()', () => {
    it('nên cập nhật thông tin khách hàng', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [{ ...mockCustomer, customer_name: 'Nguyễn Văn B' }],
        rowCount: 1,
        command: 'UPDATE',
      });

      const updated = await repo.update('cust-uuid-1', { customer_name: 'Nguyễn Văn B' });
      expect(updated?.customer_name).toBe('Nguyễn Văn B');
    });
  });
});
