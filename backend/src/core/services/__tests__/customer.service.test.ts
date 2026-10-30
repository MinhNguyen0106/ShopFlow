/**
 * ShopFlow - Unit Tests: CustomerService (TASK-27)
 * File: backend/src/core/services/__tests__/customer.service.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CustomerService } from '../customer.service.js';
import { CustomerRepository, CustomerWithStats } from '../../../infrastructure/repositories/customer.repository.js';
import { AppError } from '../../errors/app-error.js';

describe('CustomerService', () => {
  let service: CustomerService;
  let mockRepo: CustomerRepository;

  const sampleCustomer: CustomerWithStats = {
    id: 'cust-1',
    page_id: 'page-1',
    customer_fb_id: 'fb-100',
    customer_name: 'Trần Văn Nam',
    phone_number: '0981234567',
    address: 'Hà Nội',
    tags: ['Co_SDT', 'Khach_VIP'],
    notes: 'Khách thân thiết',
    lifetime_value: 1200000,
    total_orders: 3,
    last_order_at: new Date('2026-10-28T09:00:00Z'),
    last_interaction_at: new Date('2026-10-28T09:00:00Z'),
    created_at: new Date('2026-10-01T08:00:00Z'),
    aov: 400000,
  };

  beforeEach(() => {
    mockRepo = {
      findWithStats: vi.fn(),
      findDetailStatsById: vi.fn(),
      findById: vi.fn(),
      getCustomerOrders: vi.fn(),
      getMetricsSummary: vi.fn(),
      update: vi.fn(),
      addTag: vi.fn(),
      removeTag: vi.fn(),
      upsertWithPhone: vi.fn(),
      findByFbId: vi.fn(),
      findByIdAndUserId: vi.fn(),
    } as unknown as CustomerRepository;

    service = new CustomerService(mockRepo);
  });

  describe('getCustomers()', () => {
    it('trả về danh sách khách hàng đầy đủ cho vai trò admin/owner', async () => {
      vi.mocked(mockRepo.findWithStats).mockResolvedValueOnce({
        customers: [sampleCustomer],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await service.getCustomers(
        { pageId: 'page-1', page: 1, limit: 20, sortBy: 'lastInteractionAt', sortOrder: 'desc' },
        'admin'
      );

      expect(result.customers).toHaveLength(1);
      expect(result.customers[0]?.customerName).toBe('Trần Văn Nam');
      expect(result.customers[0]?.phoneNumber).toBe('0981234567'); // Không mask
      expect(result.customers[0]?.lifetimeValue).toBe(1200000);
    });

    it('tự động che số điện thoại PII đối với vai trò staff', async () => {
      vi.mocked(mockRepo.findWithStats).mockResolvedValueOnce({
        customers: [sampleCustomer],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const result = await service.getCustomers(
        { pageId: 'page-1', page: 1, limit: 20, sortBy: 'lastInteractionAt', sortOrder: 'desc' },
        'staff'
      );

      expect(result.customers[0]?.phoneNumber).not.toBe('0981234567');
      expect(result.customers[0]?.phoneNumber).toMatch(/\*{3,}/); // Đã mask PII
    });
  });

  describe('getCustomerById()', () => {
    it('trả về chi tiết khách hàng thành công', async () => {
      vi.mocked(mockRepo.findDetailStatsById).mockResolvedValueOnce(sampleCustomer);

      const customer = await service.getCustomerById('cust-1', 'owner');
      expect(customer.id).toBe('cust-1');
      expect(customer.aov).toBe(400000);
      expect(customer.phoneNumber).toBe('0981234567');
    });

    it('ném lỗi 404 nếu không tìm thấy khách hàng', async () => {
      vi.mocked(mockRepo.findDetailStatsById).mockResolvedValueOnce(null);

      await expect(service.getCustomerById('non-existent', 'owner')).rejects.toThrow(AppError);
    });
  });

  describe('getCustomerOrders()', () => {
    it('trả về danh sách đơn hàng của khách hàng theo thứ tự mới nhất', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValueOnce(sampleCustomer);
      vi.mocked(mockRepo.getCustomerOrders).mockResolvedValueOnce([
        {
          id: 'ord-1',
          order_code: 'ORD-001',
          status: 'completed',
          payment_status: 'paid',
          payment_method: 'vietqr',
          total_amount: 400000,
          final_amount: 400000,
          created_at: new Date('2026-10-28T09:00:00Z'),
        },
      ]);

      const orders = await service.getCustomerOrders('cust-1');
      expect(orders).toHaveLength(1);
      expect(orders[0]?.orderCode).toBe('ORD-001');
      expect(orders[0]?.finalAmount).toBe(400000);
    });

    it('ném lỗi 404 khi xem đơn của khách hàng không tồn tại', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValueOnce(null);

      await expect(service.getCustomerOrders('not-found')).rejects.toThrow(AppError);
    });
  });

  describe('updateCustomer(), addTag(), removeTag()', () => {
    it('cập nhật thông tin khách hàng thành công', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValueOnce(sampleCustomer);
      vi.mocked(mockRepo.update).mockResolvedValueOnce({
        ...sampleCustomer,
        customer_name: 'Tên Mới',
      });
      vi.mocked(mockRepo.findDetailStatsById).mockResolvedValueOnce({
        ...sampleCustomer,
        customer_name: 'Tên Mới',
      });

      const updated = await service.updateCustomer('cust-1', { customerName: 'Tên Mới' }, 'admin');
      expect(updated.customerName).toBe('Tên Mới');
    });

    it('thêm tag thành công', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValueOnce(sampleCustomer);
      vi.mocked(mockRepo.addTag).mockResolvedValueOnce(sampleCustomer);
      vi.mocked(mockRepo.findDetailStatsById).mockResolvedValueOnce({
        ...sampleCustomer,
        tags: [...sampleCustomer.tags, 'Moi_Tao'],
      });

      const res = await service.addTag('cust-1', 'Moi_Tao', 'admin');
      expect(res.tags).toContain('Moi_Tao');
    });

    it('xóa tag thành công', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValueOnce(sampleCustomer);
      vi.mocked(mockRepo.removeTag).mockResolvedValueOnce(sampleCustomer);
      vi.mocked(mockRepo.findDetailStatsById).mockResolvedValueOnce({
        ...sampleCustomer,
        tags: ['Khach_VIP'],
      });

      const res = await service.removeTag('cust-1', 'Co_SDT', 'admin');
      expect(res.tags).not.toContain('Co_SDT');
    });
  });

  describe('getMetrics()', () => {
    it('trả về 4 chỉ số tổng hợp CRM', async () => {
      vi.mocked(mockRepo.getMetricsSummary).mockResolvedValueOnce({
        totalCustomers: 50,
        leadsWithPhone: 40,
        vipCustomers: 10,
        totalLifetimeValue: 25000000,
      });

      const metrics = await service.getMetrics('page-1');
      expect(metrics.totalCustomers).toBe(50);
      expect(metrics.totalLifetimeValue).toBe(25000000);
    });
  });
});
