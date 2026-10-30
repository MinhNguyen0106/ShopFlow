/**
 * ShopFlow - Customer DTOs Unit Tests (TASK-27)
 * File: backend/src/api/dtos/__tests__/customer.dto.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  GetCustomersQueryDtoSchema,
  GetCustomerMetricsQueryDtoSchema,
  UpdateCustomerDtoSchema,
  AddCustomerTagDtoSchema,
  CustomerParamDtoSchema,
  CustomerTagParamDtoSchema,
} from '../customer.dto.js';

describe('Customer DTOs Validation', () => {
  const validPageId = '11111111-2222-3333-4444-555555555555';
  const validCustomerId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

  describe('GetCustomersQueryDtoSchema', () => {
    it('thẩm định thành công với các giá trị mặc định', () => {
      const parsed = GetCustomersQueryDtoSchema.parse({
        pageId: validPageId,
      });

      expect(parsed.pageId).toBe(validPageId);
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(20);
      expect(parsed.sortBy).toBe('lastInteractionAt');
      expect(parsed.sortOrder).toBe('desc');
      expect(parsed.tags).toBeUndefined();
    });

    it('tự động tách chuỗi tags dạng phẩy thành mảng chuỗi chuẩn', () => {
      const parsed = GetCustomersQueryDtoSchema.parse({
        pageId: validPageId,
        tags: 'Co_SDT, Khach_VIP,  Da_mua_hang ',
      });

      expect(parsed.tags).toEqual(['Co_SDT', 'Khach_VIP', 'Da_mua_hang']);
    });

    it('chấp nhận tags dạng mảng', () => {
      const parsed = GetCustomersQueryDtoSchema.parse({
        pageId: validPageId,
        tags: ['Co_SDT', 'Khach_VIP'],
      });

      expect(parsed.tags).toEqual(['Co_SDT', 'Khach_VIP']);
    });

    it('báo lỗi khi pageId không phải UUID', () => {
      expect(() => {
        GetCustomersQueryDtoSchema.parse({
          pageId: 'invalid-id',
        });
      }).toThrow();
    });
  });

  describe('GetCustomerMetricsQueryDtoSchema', () => {
    it('thẩm định thành công khi pageId hợp lệ', () => {
      const parsed = GetCustomerMetricsQueryDtoSchema.parse({
        pageId: validPageId,
      });
      expect(parsed.pageId).toBe(validPageId);
    });

    it('báo lỗi khi thiếu pageId', () => {
      expect(() => {
        GetCustomerMetricsQueryDtoSchema.parse({});
      }).toThrow();
    });
  });

  describe('UpdateCustomerDtoSchema', () => {
    it('thẩm định thành công khi cập nhật tên và số điện thoại Việt Nam hợp lệ', () => {
      const parsed = UpdateCustomerDtoSchema.parse({
        customerName: 'Nguyễn Văn A',
        phoneNumber: '0987654321',
        address: '123 Cầu Giấy, Hà Nội',
        notes: 'Khách thích màu đỏ',
      });

      expect(parsed.customerName).toBe('Nguyễn Văn A');
      expect(parsed.phoneNumber).toBe('0987654321');
      expect(parsed.notes).toBe('Khách thích màu đỏ');
    });

    it('báo lỗi khi số điện thoại không đúng đầu số viễn thông Việt Nam', () => {
      expect(() => {
        UpdateCustomerDtoSchema.parse({
          phoneNumber: '0123456789', // Đầu 012 không hợp lệ
        });
      }).toThrow();
    });
  });

  describe('AddCustomerTagDtoSchema', () => {
    it('thẩm định thành công tag tiếng Việt có dấu hoặc gạch dưới', () => {
      const parsed = AddCustomerTagDtoSchema.parse({
        tag: 'Khách VIP',
      });
      expect(parsed.tag).toBe('Khách VIP');
    });

    it('báo lỗi khi tag chứa ký tự đặc biệt nguy hiểm', () => {
      expect(() => {
        AddCustomerTagDtoSchema.parse({
          tag: '<script>alert(1)</script>',
        });
      }).toThrow();
    });
  });

  describe('CustomerParamDtoSchema & CustomerTagParamDtoSchema', () => {
    it('thẩm định thành công id UUID', () => {
      const parsed = CustomerParamDtoSchema.parse({ id: validCustomerId });
      expect(parsed.id).toBe(validCustomerId);
    });

    it('thẩm định thành công id UUID và tag param', () => {
      const parsed = CustomerTagParamDtoSchema.parse({
        id: validCustomerId,
        tag: 'Khach_VIP',
      });
      expect(parsed.id).toBe(validCustomerId);
      expect(parsed.tag).toBe('Khach_VIP');
    });
  });
});
