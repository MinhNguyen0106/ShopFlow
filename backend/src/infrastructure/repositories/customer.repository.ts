/**
 * ShopFlow - Customers Repository
 * File: backend/src/infrastructure/repositories/customer.repository.ts
 *
 * Tương tác với bảng `customers` (CRM khách hàng).
 * Hỗ trợ upsert tự động gán nhãn `["Co_SDT"]`, truy vấn LTV, lọc tags, phân trang và thống kê metrics.
 */

import { query } from '../database/db.client.js';

export interface Customer {
  id: string;
  page_id: string; // UUID tham chiếu connected_pages(id)
  customer_fb_id: string;
  customer_name: string | null;
  phone_number: string | null;
  address: string | null;
  tags: string[];
  notes: string | null;
  last_interaction_at: Date;
  created_at: Date;
}

export interface CustomerWithStats extends Customer {
  lifetime_value: number;
  total_orders: number;
  last_order_at: Date | null;
  aov?: number;
}

export interface CustomerOrderSummary {
  id: string;
  order_code: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  final_amount: number;
  created_at: Date;
}

export interface CustomerMetricsSummary {
  totalCustomers: number;
  leadsWithPhone: number;
  vipCustomers: number;
  totalLifetimeValue: number;
}

export interface FindCustomersOptions {
  pageId: string;
  search?: string;
  tags?: string[];
  sortBy?: 'lastInteractionAt' | 'lifetimeValue' | 'totalOrders' | 'createdAt' | 'customerName';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface PaginatedCustomersResult {
  customers: CustomerWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CustomerRepository {
  /**
   * Tạo mới hoặc cập nhật thông tin khách hàng kèm số điện thoại và nhãn phân loại (tags).
   * Sử dụng PostgreSQL ON CONFLICT để đảm bảo tính Idempotent.
   */
  async upsertWithPhone(
    pageInternalId: string,
    customerFbId: string,
    customerName: string | undefined,
    phoneNumber: string,
    tag: string = 'Co_SDT'
  ): Promise<Customer | null> {
    const sql = `
      INSERT INTO customers (page_id, customer_fb_id, customer_name, phone_number, tags, last_interaction_at)
      VALUES ($1, $2, $3, $4, jsonb_build_array($5::text), CURRENT_TIMESTAMP)
      ON CONFLICT (page_id, customer_fb_id) DO UPDATE
      SET
        phone_number = EXCLUDED.phone_number,
        customer_name = COALESCE(EXCLUDED.customer_name, customers.customer_name),
        tags = CASE
          WHEN customers.tags ? $5 THEN customers.tags
          ELSE customers.tags || jsonb_build_array($5::text)
        END,
        last_interaction_at = CURRENT_TIMESTAMP
      RETURNING id, page_id, customer_fb_id, customer_name, phone_number, address, tags, notes, last_interaction_at, created_at
    `;

    const params = [
      pageInternalId,
      customerFbId,
      customerName ?? null,
      phoneNumber,
      tag,
    ];

    const result = await query<Customer>(sql, params);
    return result.rows[0] ?? null;
  }

  /**
   * Tìm khách hàng theo Facebook ID và Fanpage UUID.
   */
  async findByFbId(
    pageInternalId: string,
    customerFbId: string
  ): Promise<Customer | null> {
    const sql = `
      SELECT id, page_id, customer_fb_id, customer_name, phone_number, address, tags, notes, last_interaction_at, created_at
      FROM customers
      WHERE page_id = $1 AND customer_fb_id = $2
      LIMIT 1
    `;
    const result = await query<Customer>(sql, [pageInternalId, customerFbId]);
    return result.rows[0] ?? null;
  }

  /**
   * Tìm khách hàng theo Customer UUID.
   */
  async findById(customerId: string): Promise<Customer | null> {
    const sql = `
      SELECT id, page_id, customer_fb_id, customer_name, phone_number, address, tags, notes, last_interaction_at, created_at
      FROM customers
      WHERE id = $1
      LIMIT 1
    `;
    const result = await query<Customer>(sql, [customerId]);
    return result.rows[0] ?? null;
  }

  /**
   * Tìm khách hàng theo Customer UUID và kiểm tra quyền sở hữu của user qua connected_pages.
   */
  async findByIdAndUserId(
    customerId: string,
    userId: string
  ): Promise<Customer | null> {
    const sql = `
      SELECT cu.id, cu.page_id, cu.customer_fb_id, cu.customer_name, cu.phone_number, cu.address, cu.tags, cu.notes, cu.last_interaction_at, cu.created_at
      FROM customers cu
      JOIN connected_pages p ON cu.page_id = p.id
      WHERE cu.id = $1 AND p.user_id = $2
      LIMIT 1
    `;
    const result = await query<Customer>(sql, [customerId, userId]);
    return result.rows[0] ?? null;
  }

  /**
   * Truy vấn danh sách khách hàng có thống kê LTV, số đơn hàng, hỗ trợ tìm kiếm, lọc tags và phân trang.
   */
  async findWithStats(options: FindCustomersOptions): Promise<PaginatedCustomersResult> {
    const {
      pageId,
      search,
      tags,
      sortBy = 'lastInteractionAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = options;

    const conditions: string[] = ['cu.page_id = $1'];
    const params: unknown[] = [pageId];
    let paramIndex = 2;

    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(
        `(cu.customer_name ILIKE $${paramIndex} OR cu.phone_number ILIKE $${paramIndex} OR cu.customer_fb_id ILIKE $${paramIndex})`
      );
      params.push(searchPattern);
      paramIndex++;
    }

    if (tags && tags.length > 0) {
      conditions.push(`cu.tags @> $${paramIndex}::jsonb`);
      params.push(JSON.stringify(tags));
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Đếm tổng số bản ghi
    const countSql = `
      SELECT COUNT(*) AS total
      FROM customers cu
      WHERE ${whereClause}
    `;
    const countResult = await query<{ total: string }>(countSql, params);
    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Sắp xếp
    let sortColumn = 'cu.last_interaction_at';
    if (sortBy === 'lifetimeValue') sortColumn = 'lifetime_value';
    else if (sortBy === 'totalOrders') sortColumn = 'total_orders';
    else if (sortBy === 'createdAt') sortColumn = 'cu.created_at';
    else if (sortBy === 'customerName') sortColumn = 'cu.customer_name';

    const orderDir = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const dataSql = `
      SELECT 
        cu.id, 
        cu.page_id, 
        cu.customer_fb_id, 
        cu.customer_name, 
        cu.phone_number, 
        cu.address, 
        cu.tags, 
        cu.notes, 
        cu.last_interaction_at, 
        cu.created_at,
        COALESCE(SUM(o.final_amount), 0)::numeric AS lifetime_value,
        COUNT(o.id)::int AS total_orders,
        MAX(o.created_at) AS last_order_at
      FROM customers cu
      LEFT JOIN orders o ON cu.id = o.customer_id AND o.status != 'cancelled'
      WHERE ${whereClause}
      GROUP BY cu.id
      ORDER BY ${sortColumn} ${orderDir} NULLS LAST
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...params, limit, offset];
    const dataResult = await query<any>(dataSql, dataParams);

    const customers: CustomerWithStats[] = dataResult.rows.map((row) => ({
      id: row.id,
      page_id: row.page_id,
      customer_fb_id: row.customer_fb_id,
      customer_name: row.customer_name,
      phone_number: row.phone_number,
      address: row.address,
      tags: Array.isArray(row.tags) ? row.tags : [],
      notes: row.notes,
      last_interaction_at: row.last_interaction_at,
      created_at: row.created_at,
      lifetime_value: parseFloat(row.lifetime_value || '0'),
      total_orders: parseInt(row.total_orders || '0', 10),
      last_order_at: row.last_order_at ? new Date(row.last_order_at) : null,
    }));

    return {
      customers,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Truy vấn thông tin chi tiết một khách hàng kèm các chỉ số tổng hợp (LTV, totalOrders, AOV).
   */
  async findDetailStatsById(customerId: string): Promise<CustomerWithStats | null> {
    const sql = `
      SELECT 
        cu.id, 
        cu.page_id, 
        cu.customer_fb_id, 
        cu.customer_name, 
        cu.phone_number, 
        cu.address, 
        cu.tags, 
        cu.notes, 
        cu.last_interaction_at, 
        cu.created_at,
        COALESCE(SUM(o.final_amount), 0)::numeric AS lifetime_value,
        COUNT(o.id)::int AS total_orders,
        MAX(o.created_at) AS last_order_at
      FROM customers cu
      LEFT JOIN orders o ON cu.id = o.customer_id AND o.status != 'cancelled'
      WHERE cu.id = $1
      GROUP BY cu.id
      LIMIT 1
    `;

    const result = await query<any>(sql, [customerId]);
    const row = result.rows[0];
    if (!row) return null;

    const lifetimeValue = parseFloat(row.lifetime_value || '0');
    const totalOrders = parseInt(row.total_orders || '0', 10);
    const aov = totalOrders > 0 ? Math.round(lifetimeValue / totalOrders) : 0;

    return {
      id: row.id,
      page_id: row.page_id,
      customer_fb_id: row.customer_fb_id,
      customer_name: row.customer_name,
      phone_number: row.phone_number,
      address: row.address,
      tags: Array.isArray(row.tags) ? row.tags : [],
      notes: row.notes,
      last_interaction_at: row.last_interaction_at,
      created_at: row.created_at,
      lifetime_value: lifetimeValue,
      total_orders: totalOrders,
      last_order_at: row.last_order_at ? new Date(row.last_order_at) : null,
      aov,
    };
  }

  /**
   * Lấy danh sách lịch sử đơn hàng của khách hàng.
   */
  async getCustomerOrders(customerId: string, limit: number = 20): Promise<CustomerOrderSummary[]> {
    const sql = `
      SELECT 
        id, 
        order_code, 
        status, 
        payment_status, 
        payment_method, 
        total_amount::numeric, 
        final_amount::numeric, 
        created_at
      FROM orders
      WHERE customer_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await query<any>(sql, [customerId, limit]);
    return result.rows.map((row) => ({
      id: row.id,
      order_code: row.order_code,
      status: row.status,
      payment_status: row.payment_status,
      payment_method: row.payment_method,
      total_amount: parseFloat(row.total_amount || '0'),
      final_amount: parseFloat(row.final_amount || '0'),
      created_at: row.created_at,
    }));
  }

  /**
   * Thêm một tag vào hồ sơ khách hàng theo cơ chế idempotent.
   */
  async addTag(customerId: string, tag: string): Promise<Customer | null> {
    const cleanTag = tag.trim();
    const sql = `
      UPDATE customers
      SET 
        tags = CASE
          WHEN tags ? $2 THEN tags
          ELSE tags || jsonb_build_array($2::text)
        END,
        last_interaction_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, page_id, customer_fb_id, customer_name, phone_number, address, tags, notes, last_interaction_at, created_at
    `;

    const result = await query<Customer>(sql, [customerId, cleanTag]);
    return result.rows[0] ?? null;
  }

  /**
   * Gỡ bỏ một tag khỏi hồ sơ khách hàng.
   */
  async removeTag(customerId: string, tag: string): Promise<Customer | null> {
    const cleanTag = tag.trim();
    const sql = `
      UPDATE customers
      SET 
        tags = (
          SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
          FROM jsonb_array_elements_text(tags) AS elem
          WHERE elem <> $2
        ),
        last_interaction_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, page_id, customer_fb_id, customer_name, phone_number, address, tags, notes, last_interaction_at, created_at
    `;

    const result = await query<Customer>(sql, [customerId, cleanTag]);
    return result.rows[0] ?? null;
  }

  /**
   * Lấy tổng hợp 4 chỉ số CRM Metrics cho một Fanpage.
   */
  async getMetricsSummary(pageId: string): Promise<CustomerMetricsSummary> {
    const sql = `
      SELECT
        COUNT(DISTINCT cu.id)::int AS total_customers,
        COUNT(DISTINCT cu.id) FILTER (WHERE cu.phone_number IS NOT NULL AND cu.phone_number <> '')::int AS leads_with_phone,
        COUNT(DISTINCT cu.id) FILTER (WHERE cu.tags ? 'Khach_VIP')::int AS vip_customers,
        COALESCE(SUM(o.final_amount), 0)::numeric AS total_lifetime_value
      FROM customers cu
      LEFT JOIN orders o ON cu.id = o.customer_id AND o.status != 'cancelled'
      WHERE cu.page_id = $1
    `;

    const result = await query<any>(sql, [pageId]);
    const row = result.rows[0];

    return {
      totalCustomers: parseInt(row?.total_customers || '0', 10),
      leadsWithPhone: parseInt(row?.leads_with_phone || '0', 10),
      vipCustomers: parseInt(row?.vip_customers || '0', 10),
      totalLifetimeValue: parseFloat(row?.total_lifetime_value || '0'),
    };
  }

  /**
   * Cập nhật thông tin khách hàng (customer_name, phone_number, address, tags, notes).
   */
  async update(
    customerId: string,
    data: {
      customer_name?: string;
      phone_number?: string | null;
      address?: string | null;
      tags?: string[];
      notes?: string | null;
    }
  ): Promise<Customer | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.customer_name !== undefined) {
      fields.push(`customer_name = $${idx++}`);
      values.push(data.customer_name);
    }
    if (data.phone_number !== undefined) {
      fields.push(`phone_number = $${idx++}`);
      values.push(data.phone_number);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${idx++}`);
      values.push(data.address);
    }
    if (data.tags !== undefined) {
      fields.push(`tags = $${idx++}::jsonb`);
      values.push(JSON.stringify(data.tags));
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(data.notes);
    }

    if (fields.length === 0) {
      return this.findById(customerId);
    }

    fields.push(`last_interaction_at = CURRENT_TIMESTAMP`);
    values.push(customerId);

    const sql = `
      UPDATE customers
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, page_id, customer_fb_id, customer_name, phone_number, address, tags, notes, last_interaction_at, created_at
    `;

    const result = await query<Customer>(sql, values);
    return result.rows[0] ?? null;
  }
}

export const customerRepository = new CustomerRepository();
