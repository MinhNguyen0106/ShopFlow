/**
 * ShopFlow - Integration Tests: Customer CRM Endpoints (/api/v1/customers)
 * File: backend/src/api/routes/__tests__/customer.routes.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import { customerService } from '../../../core/services/customer.service.js';
import { pageMemberRepository } from '../../../infrastructure/repositories/page-member.repository.js';
import { customerRepository } from '../../../infrastructure/repositories/customer.repository.js';
import { generateTokens } from '../../../utils/auth.helper.js';
import { User } from '../../../core/entities/user.entity.js';

describe('Customer CRM Routes Integration (/api/v1/customers)', () => {
  const app = createApp();

  const testUser: User = {
    id: 'user-uuid-999',
    email: 'crm-owner@shopflow.vn',
    password_hash: 'hashed',
    full_name: 'Shop Owner',
    role: 'owner',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const { accessToken } = generateTokens(testUser);
  const validPageId = '11111111-2222-3333-4444-555555555555';
  const validCustomerId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(pageMemberRepository, 'findByPageAndUser').mockResolvedValue({
      id: 'pm-1',
      page_id: validPageId,
      user_id: testUser.id,
      role: 'owner',
      invited_by: null,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    });

    vi.spyOn(customerRepository, 'findById').mockResolvedValue({
      id: validCustomerId,
      page_id: validPageId,
      customer_fb_id: 'fb-user-1',
      customer_name: 'Hoàng Nam',
      phone_number: '0981234567',
      address: 'Hà Nội',
      tags: ['Co_SDT'],
      notes: null,
      last_interaction_at: new Date(),
      created_at: new Date(),
    });
  });

  describe('Authentication Check', () => {
    it('nên trả về 401 Unauthorized khi không có Bearer token', async () => {
      const res = await request(app).get(`/api/v1/customers?pageId=${validPageId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/customers', () => {
    it('nên trả về 400 Bad Request khi thiếu pageId', async () => {
      const res = await request(app)
        .get('/api/v1/customers')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('nên trả về 200 OK với danh sách khách hàng và pagination', async () => {
      vi.spyOn(customerService, 'getCustomers').mockResolvedValueOnce({
        customers: [
          {
            id: validCustomerId,
            pageId: validPageId,
            customerFbId: 'fb-user-1',
            customerName: 'Hoàng Nam',
            phoneNumber: '0981234567',
            address: 'Hà Nội',
            tags: ['Co_SDT', 'Khach_VIP'],
            notes: null,
            lifetimeValue: 1500000,
            totalOrders: 3,
            lastOrderAt: new Date('2026-10-25T10:00:00Z'),
            lastInteractionAt: new Date('2026-10-25T10:00:00Z'),
            createdAt: new Date('2026-10-01T10:00:00Z'),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const res = await request(app)
        .get(`/api/v1/customers?pageId=${validPageId}&tags=Co_SDT,Khach_VIP&page=1&limit=20`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].customerName).toBe('Hoàng Nam');
      expect(res.body.pagination.total).toBe(1);
    });
  });

  describe('GET /api/v1/customers/metrics', () => {
    it('nên trả về 200 OK với 4 chỉ số tổng hợp CRM', async () => {
      vi.spyOn(customerService, 'getMetrics').mockResolvedValueOnce({
        totalCustomers: 120,
        leadsWithPhone: 85,
        vipCustomers: 15,
        totalLifetimeValue: 54000000,
      });

      const res = await request(app)
        .get(`/api/v1/customers/metrics?pageId=${validPageId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCustomers).toBe(120);
      expect(res.body.data.totalLifetimeValue).toBe(54000000);
    });
  });

  describe('GET /api/v1/customers/:id', () => {
    it('nên trả về 200 OK với chi tiết hồ sơ khách hàng', async () => {
      vi.spyOn(customerService, 'getCustomerById').mockResolvedValueOnce({
        id: validCustomerId,
        pageId: validPageId,
        customerFbId: 'fb-user-1',
        customerName: 'Hoàng Nam',
        phoneNumber: '0981234567',
        address: 'Hà Nội',
        tags: ['Co_SDT'],
        notes: 'Khách hay mua buổi tối',
        lifetimeValue: 1500000,
        totalOrders: 3,
        lastOrderAt: new Date('2026-10-25T10:00:00Z'),
        lastInteractionAt: new Date('2026-10-25T10:00:00Z'),
        createdAt: new Date('2026-10-01T10:00:00Z'),
        aov: 500000,
      });

      const res = await request(app)
        .get(`/api/v1/customers/${validCustomerId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(validCustomerId);
      expect(res.body.data.aov).toBe(500000);
    });
  });

  describe('GET /api/v1/customers/:id/orders', () => {
    it('nên trả về 200 OK với danh sách đơn hàng của khách', async () => {
      vi.spyOn(customerService, 'getCustomerOrders').mockResolvedValueOnce([
        {
          id: 'order-1',
          orderCode: 'ORD-2026-001',
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: 'vietqr',
          totalAmount: 500000,
          finalAmount: 500000,
          createdAt: new Date(),
        },
      ]);

      const res = await request(app)
        .get(`/api/v1/customers/${validCustomerId}/orders`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].orderCode).toBe('ORD-2026-001');
    });
  });

  describe('PATCH /api/v1/customers/:id', () => {
    it('nên cập nhật thông tin thành công và trả về 200 OK', async () => {
      vi.spyOn(customerService, 'updateCustomer').mockResolvedValueOnce({
        id: validCustomerId,
        pageId: validPageId,
        customerFbId: 'fb-user-1',
        customerName: 'Hoàng Nam Cập Nhật',
        phoneNumber: '0987654321',
        address: 'Đà Nẵng',
        tags: ['Co_SDT'],
        notes: 'Ghi chú mới',
        lifetimeValue: 1500000,
        totalOrders: 3,
        lastOrderAt: new Date(),
        lastInteractionAt: new Date(),
        createdAt: new Date(),
      });

      const res = await request(app)
        .patch(`/api/v1/customers/${validCustomerId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          customerName: 'Hoàng Nam Cập Nhật',
          phoneNumber: '0987654321',
          address: 'Đà Nẵng',
          notes: 'Ghi chú mới',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerName).toBe('Hoàng Nam Cập Nhật');
    });
  });

  describe('POST & DELETE /api/v1/customers/:id/tags', () => {
    it('POST /:id/tags nên gán tag mới thành công', async () => {
      vi.spyOn(customerService, 'addTag').mockResolvedValueOnce({
        id: validCustomerId,
        pageId: validPageId,
        customerFbId: 'fb-user-1',
        customerName: 'Hoàng Nam',
        phoneNumber: '0981234567',
        address: null,
        tags: ['Co_SDT', 'VIP_Moi'],
        notes: null,
        lifetimeValue: 0,
        totalOrders: 0,
        lastOrderAt: null,
        lastInteractionAt: new Date(),
        createdAt: new Date(),
      });

      const res = await request(app)
        .post(`/api/v1/customers/${validCustomerId}/tags`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ tag: 'VIP_Moi' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tags).toContain('VIP_Moi');
    });

    it('DELETE /:id/tags/:tag nên gỡ bỏ tag thành công', async () => {
      vi.spyOn(customerService, 'removeTag').mockResolvedValueOnce({
        id: validCustomerId,
        pageId: validPageId,
        customerFbId: 'fb-user-1',
        customerName: 'Hoàng Nam',
        phoneNumber: '0981234567',
        address: null,
        tags: ['Co_SDT'],
        notes: null,
        lifetimeValue: 0,
        totalOrders: 0,
        lastOrderAt: null,
        lastInteractionAt: new Date(),
        createdAt: new Date(),
      });

      const res = await request(app)
        .delete(`/api/v1/customers/${validCustomerId}/tags/VIP_Moi`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tags).not.toContain('VIP_Moi');
    });
  });
});
