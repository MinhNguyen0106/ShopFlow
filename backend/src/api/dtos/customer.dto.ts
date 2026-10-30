/**
 * ShopFlow - Customer CRM DTOs & Validation Schemas (TASK-27)
 * File: backend/src/api/dtos/customer.dto.ts
 */

import { z } from 'zod';

export const GetCustomersQueryDtoSchema = z.object({
  pageId: z.string().uuid('pageId phải là UUID hợp lệ'),
  search: z.string().trim().max(100).optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (Array.isArray(val)) return val.map((t) => t.trim()).filter(Boolean);
      return val
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }),
  sortBy: z
    .enum(['lastInteractionAt', 'lifetimeValue', 'totalOrders', 'createdAt', 'customerName'])
    .default('lastInteractionAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive('Số trang phải >= 1').default(1),
  limit: z.coerce.number().int().positive().max(100, 'Tối đa 100 bản ghi mỗi trang').default(20),
});

export type GetCustomersQueryDto = z.infer<typeof GetCustomersQueryDtoSchema>;

export const GetCustomerMetricsQueryDtoSchema = z.object({
  pageId: z.string().uuid('pageId phải là UUID hợp lệ'),
});

export type GetCustomerMetricsQueryDto = z.infer<typeof GetCustomerMetricsQueryDtoSchema>;

export const UpdateCustomerDtoSchema = z.object({
  customerName: z.string().trim().min(1, 'Tên khách hàng không được để trống').max(255).optional(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^(\+84|0)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại Việt Nam không hợp lệ')
    .optional()
    .nullable(),
  address: z.string().trim().max(500, 'Địa chỉ tối đa 500 ký tự').optional().nullable(),
  notes: z.string().trim().max(2000, 'Ghi chú tối đa 2000 ký tự').optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
});

export type UpdateCustomerDto = z.infer<typeof UpdateCustomerDtoSchema>;

export const AddCustomerTagDtoSchema = z.object({
  tag: z
    .string()
    .trim()
    .min(1, 'Nhãn tag không được để trống')
    .max(50, 'Nhãn tag không được vượt quá 50 ký tự')
    .regex(/^[a-zA-Z0-9_\-\u00C0-\u1EF9\s]+$/, 'Nhãn tag không chứa ký tự đặc biệt nguy hiểm'),
});

export type AddCustomerTagDto = z.infer<typeof AddCustomerTagDtoSchema>;

export const CustomerParamDtoSchema = z.object({
  id: z.string().uuid('Mã khách hàng phải là UUID hợp lệ'),
});

export type CustomerParamDto = z.infer<typeof CustomerParamDtoSchema>;

export const CustomerTagParamDtoSchema = z.object({
  id: z.string().uuid('Mã khách hàng phải là UUID hợp lệ'),
  tag: z.string().trim().min(1, 'Nhãn tag không được để trống').max(50),
});

export type CustomerTagParamDto = z.infer<typeof CustomerTagParamDtoSchema>;
