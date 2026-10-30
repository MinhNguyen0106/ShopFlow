/**
 * ShopFlow - Customer CRM Service
 * File: backend/src/core/services/customer.service.ts
 *
 * Xử lý nghiệp vụ quản lý khách hàng & CRM Leads:
 * - Tìm kiếm, lọc theo tags, tính toán LTV, AOV.
 * - Thao tác gán/xóa nhãn tags và cập nhật ghi chú nội bộ.
 * - Bảo vệ PII: Che giấu số điện thoại khách hàng cho vai trò staff.
 */

import {
  CustomerRepository,
  customerRepository as defaultCustomerRepository,
  CustomerWithStats,
  CustomerOrderSummary,
  CustomerMetricsSummary,
} from '../../infrastructure/repositories/customer.repository.js';
import {
  GetCustomersQueryDto,
  UpdateCustomerDto,
} from '../../api/dtos/customer.dto.js';
import { AppError } from '../errors/app-error.js';
import { maskPhoneNumber } from '../../utils/phone-regex.js';
import { PageRole } from '../../infrastructure/repositories/page-member.repository.js';

export interface CustomerResponseDto {
  id: string;
  pageId: string;
  customerFbId: string;
  customerName: string | null;
  phoneNumber: string | null;
  address: string | null;
  tags: string[];
  notes: string | null;
  lifetimeValue: number;
  totalOrders: number;
  lastOrderAt: Date | null;
  lastInteractionAt: Date;
  createdAt: Date;
  aov?: number;
}

export interface CustomerOrderResponseDto {
  id: string;
  orderCode: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  finalAmount: number;
  createdAt: Date;
}

export interface PaginatedCustomersResponse {
  customers: CustomerResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CustomerService {
  constructor(
    private readonly customerRepo: CustomerRepository = defaultCustomerRepository
  ) {}

  /**
   * Chuyển đổi Customer entity sang CustomerResponseDto (camelCase) và áp dụng PII Data Masking nếu là staff.
   */
  private formatCustomer(
    customer: CustomerWithStats,
    role?: PageRole | string
  ): CustomerResponseDto {
    const isStaff = role === 'staff';
    const rawPhone = customer.phone_number;
    const maskedPhone = isStaff && rawPhone ? maskPhoneNumber(rawPhone) : rawPhone;

    return {
      id: customer.id,
      pageId: customer.page_id,
      customerFbId: customer.customer_fb_id,
      customerName: customer.customer_name,
      phoneNumber: maskedPhone,
      address: customer.address,
      tags: customer.tags || [],
      notes: customer.notes,
      lifetimeValue: customer.lifetime_value,
      totalOrders: customer.total_orders,
      lastOrderAt: customer.last_order_at,
      lastInteractionAt: customer.last_interaction_at,
      createdAt: customer.created_at,
      aov: customer.aov,
    };
  }

  /**
   * Truy vấn danh bạ khách hàng có phân trang, bộ lọc đa tags và bảo mật PII.
   */
  async getCustomers(
    queryDto: GetCustomersQueryDto,
    role?: PageRole | string
  ): Promise<PaginatedCustomersResponse> {
    const result = await this.customerRepo.findWithStats({
      pageId: queryDto.pageId,
      search: queryDto.search,
      tags: queryDto.tags,
      sortBy: queryDto.sortBy,
      sortOrder: queryDto.sortOrder,
      page: queryDto.page,
      limit: queryDto.limit,
    });

    const formattedCustomers = result.customers.map((c) => this.formatCustomer(c, role));

    return {
      customers: formattedCustomers,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Lấy tổng hợp 4 chỉ số CRM Metrics (Tổng KH, Leads SĐT, Khách VIP, Tổng LTV).
   */
  async getMetrics(pageId: string): Promise<CustomerMetricsSummary> {
    return this.customerRepo.getMetricsSummary(pageId);
  }

  /**
   * Xem chi tiết hồ sơ một khách hàng kèm các chỉ số thống kê (LTV, totalOrders, AOV).
   */
  async getCustomerById(
    customerId: string,
    role?: PageRole | string
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerRepo.findDetailStatsById(customerId);
    if (!customer) {
      throw new AppError('Khách hàng không tồn tại', 404, 'CUSTOMER_NOT_FOUND');
    }

    return this.formatCustomer(customer, role);
  }

  /**
   * Lấy lịch sử mua hàng của khách hàng.
   */
  async getCustomerOrders(
    customerId: string,
    limit: number = 20
  ): Promise<CustomerOrderResponseDto[]> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new AppError('Khách hàng không tồn tại', 404, 'CUSTOMER_NOT_FOUND');
    }

    const orders: CustomerOrderSummary[] = await this.customerRepo.getCustomerOrders(customerId, limit);

    return orders.map((o) => ({
      id: o.id,
      orderCode: o.order_code,
      status: o.status,
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      totalAmount: o.total_amount,
      finalAmount: o.final_amount,
      createdAt: o.created_at,
    }));
  }

  /**
   * Cập nhật thông tin khách hàng (tên, số điện thoại, địa chỉ, ghi chú nội bộ).
   */
  async updateCustomer(
    customerId: string,
    data: UpdateCustomerDto,
    role?: PageRole | string
  ): Promise<CustomerResponseDto> {
    const existing = await this.customerRepo.findById(customerId);
    if (!existing) {
      throw new AppError('Khách hàng không tồn tại', 404, 'CUSTOMER_NOT_FOUND');
    }

    await this.customerRepo.update(customerId, {
      customer_name: data.customerName,
      phone_number: data.phoneNumber,
      address: data.address,
      notes: data.notes,
      tags: data.tags,
    });

    return this.getCustomerById(customerId, role);
  }

  /**
   * Thêm tag vào hồ sơ khách hàng.
   */
  async addTag(
    customerId: string,
    tag: string,
    role?: PageRole | string
  ): Promise<CustomerResponseDto> {
    const existing = await this.customerRepo.findById(customerId);
    if (!existing) {
      throw new AppError('Khách hàng không tồn tại', 404, 'CUSTOMER_NOT_FOUND');
    }

    await this.customerRepo.addTag(customerId, tag);
    return this.getCustomerById(customerId, role);
  }

  /**
   * Gỡ bỏ tag khỏi hồ sơ khách hàng.
   */
  async removeTag(
    customerId: string,
    tag: string,
    role?: PageRole | string
  ): Promise<CustomerResponseDto> {
    const existing = await this.customerRepo.findById(customerId);
    if (!existing) {
      throw new AppError('Khách hàng không tồn tại', 404, 'CUSTOMER_NOT_FOUND');
    }

    await this.customerRepo.removeTag(customerId, tag);
    return this.getCustomerById(customerId, role);
  }
}

export const customerService = new CustomerService();
