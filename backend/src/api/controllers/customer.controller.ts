/**
 * ShopFlow - Customer CRM Controller (TASK-27)
 * File: backend/src/api/controllers/customer.controller.ts
 */

import { Request, Response, NextFunction } from 'express';
import { CustomerService, customerService } from '../../core/services/customer.service.js';
import { pageMemberRepository } from '../../infrastructure/repositories/page-member.repository.js';
import {
  GetCustomersQueryDto,
  UpdateCustomerDto,
  AddCustomerTagDto,
} from '../dtos/customer.dto.js';
import { BadRequestError, UnauthorizedError } from '../../core/errors/app-error.js';
import { customerRepository } from '../../infrastructure/repositories/customer.repository.js';

export class CustomerController {
  constructor(private readonly service: CustomerService = customerService) {}

  /**
   * Trợ giúp lấy vai trò của người dùng trên Fanpage
   */
  private async resolveUserRole(pageId: string | undefined, currentUserId: string | undefined): Promise<string | undefined> {
    if (!pageId || !currentUserId) return undefined;
    const member = await pageMemberRepository.findByPageAndUser(pageId, currentUserId);
    return member?.role;
  }

  /**
   * GET /api/v1/customers - Lấy danh sách khách hàng & Leads có phân trang và lọc tags
   */
  public getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id || req.user?.sub;
      if (!currentUserId) {
        throw new UnauthorizedError('Chưa xác thực người dùng');
      }

      const queryDto = req.query as unknown as GetCustomersQueryDto;
      if (!queryDto.pageId) {
        throw new BadRequestError('Thiếu tham số pageId');
      }

      const role = (await this.resolveUserRole(queryDto.pageId, currentUserId)) || req.pageMember?.role;
      const result = await this.service.getCustomers(queryDto, role);

      res.status(200).json({
        success: true,
        data: result.customers,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/customers/metrics - Thống kê 4 thẻ KPIs CRM
   */
  public getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id || req.user?.sub;
      if (!currentUserId) {
        throw new UnauthorizedError('Chưa xác thực người dùng');
      }

      const pageId = req.query.pageId as string;
      if (!pageId) {
        throw new BadRequestError('Thiếu tham số pageId');
      }

      const metrics = await this.service.getMetrics(pageId);

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/customers/:id - Chi tiết hồ sơ một khách hàng kèm LTV/AOV
   */
  public getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id || req.user?.sub;
      if (!currentUserId) {
        throw new UnauthorizedError('Chưa xác thực người dùng');
      }

      const customerId = req.params.id as string;
      const customerRecord = await customerRepository.findById(customerId);
      const role = customerRecord
        ? await this.resolveUserRole(customerRecord.page_id, currentUserId)
        : req.pageMember?.role;

      const customer = await this.service.getCustomerById(customerId, role);

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/customers/:id/orders - Lịch sử đơn hàng của khách
   */
  public getCustomerOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.params.id as string;
      const limit = Number(req.query.limit) || 20;

      const orders = await this.service.getCustomerOrders(customerId, limit);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/v1/customers/:id - Cập nhật thông tin khách hàng (tên, SĐT, địa chỉ, ghi chú)
   */
  public updateCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id || req.user?.sub;
      if (!currentUserId) {
        throw new UnauthorizedError('Chưa xác thực người dùng');
      }

      const customerId = req.params.id as string;
      const customerRecord = await customerRepository.findById(customerId);
      const role = customerRecord
        ? await this.resolveUserRole(customerRecord.page_id, currentUserId)
        : req.pageMember?.role;

      const body = req.body as UpdateCustomerDto;
      const updated = await this.service.updateCustomer(customerId, body, role);

      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin khách hàng thành công',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/customers/:id/tags - Gán thêm tag cho khách hàng
   */
  public addTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id || req.user?.sub;
      if (!currentUserId) {
        throw new UnauthorizedError('Chưa xác thực người dùng');
      }

      const customerId = req.params.id as string;
      const customerRecord = await customerRepository.findById(customerId);
      const role = customerRecord
        ? await this.resolveUserRole(customerRecord.page_id, currentUserId)
        : req.pageMember?.role;

      const body = req.body as AddCustomerTagDto;
      const updated = await this.service.addTag(customerId, body.tag, role);

      res.status(200).json({
        success: true,
        message: 'Gán nhãn tag thành công',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/customers/:id/tags/:tag - Gỡ bỏ tag khỏi khách hàng
   */
  public removeTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id || req.user?.sub;
      if (!currentUserId) {
        throw new UnauthorizedError('Chưa xác thực người dùng');
      }

      const customerId = req.params.id as string;
      const tag = req.params.tag as string;
      const customerRecord = await customerRepository.findById(customerId);
      const role = customerRecord
        ? await this.resolveUserRole(customerRecord.page_id, currentUserId)
        : req.pageMember?.role;

      const updated = await this.service.removeTag(customerId, tag, role);

      res.status(200).json({
        success: true,
        message: 'Gỡ nhãn tag thành công',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const customerController = new CustomerController();
