/**
 * ShopFlow - Customer CRM Routes (TASK-27)
 * File: backend/src/api/routes/customer.routes.ts
 */

import { Router } from 'express';
import { customerController } from '../controllers/customer.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate-request.middleware.js';
import {
  GetCustomersQueryDtoSchema,
  GetCustomerMetricsQueryDtoSchema,
  UpdateCustomerDtoSchema,
  AddCustomerTagDtoSchema,
  CustomerParamDtoSchema,
  CustomerTagParamDtoSchema,
} from '../dtos/customer.dto.js';

export const customerRouter = Router();

// Yêu cầu xác thực JWT cho toàn bộ phân hệ CRM
customerRouter.use(authenticateToken);

/**
 * GET /api/v1/customers - Danh sách khách hàng và CRM Leads
 */
customerRouter.get(
  '/',
  validateRequest({ query: GetCustomersQueryDtoSchema }),
  customerController.getCustomers
);

/**
 * GET /api/v1/customers/metrics - Thống kê 4 thẻ KPIs CRM
 */
customerRouter.get(
  '/metrics',
  validateRequest({ query: GetCustomerMetricsQueryDtoSchema }),
  customerController.getMetrics
);

/**
 * GET /api/v1/customers/:id - Chi tiết một khách hàng kèm LTV/AOV
 */
customerRouter.get(
  '/:id',
  validateRequest({ params: CustomerParamDtoSchema }),
  customerController.getCustomerById
);

/**
 * GET /api/v1/customers/:id/orders - Lịch sử đơn hàng của khách hàng
 */
customerRouter.get(
  '/:id/orders',
  validateRequest({ params: CustomerParamDtoSchema }),
  customerController.getCustomerOrders
);

/**
 * PATCH /api/v1/customers/:id - Cập nhật thông tin khách hàng & ghi chú
 */
customerRouter.patch(
  '/:id',
  validateRequest({ params: CustomerParamDtoSchema, body: UpdateCustomerDtoSchema }),
  customerController.updateCustomer
);

/**
 * POST /api/v1/customers/:id/tags - Gán nhãn tag cho khách hàng
 */
customerRouter.post(
  '/:id/tags',
  validateRequest({ params: CustomerParamDtoSchema, body: AddCustomerTagDtoSchema }),
  customerController.addTag
);

/**
 * DELETE /api/v1/customers/:id/tags/:tag - Gỡ bỏ nhãn tag khỏi khách hàng
 */
customerRouter.delete(
  '/:id/tags/:tag',
  validateRequest({ params: CustomerTagParamDtoSchema }),
  customerController.removeTag
);
