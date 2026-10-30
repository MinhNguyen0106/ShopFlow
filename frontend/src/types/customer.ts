/**
 * ShopFlow - Customer CRM Types & DTO Interfaces (TASK-27)
 * File: frontend/src/types/customer.ts
 *
 * Định nghĩa cấu trúc khách hàng CRM, Leads, Metrics, bộ lọc và các hàm phòng vệ dữ liệu.
 * Tuân thủ quy định tại .agents/rules/api-contract-sync.md.
 */

export interface Customer {
  id: string;
  pageId: string;
  customerFbId: string;
  customerName: string;
  phoneNumber: string | null;
  address: string | null;
  tags: string[];
  notes: string | null;
  lifetimeValue: number;
  totalOrders: number;
  lastOrderAt: string | null;
  lastInteractionAt: string;
  createdAt: string;
  aov?: number;
}

export interface CustomerOrder {
  id: string;
  orderCode: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  finalAmount: number;
  createdAt: string;
}

export interface CustomerMetrics {
  totalCustomers: number;
  leadsWithPhone: number;
  vipCustomers: number;
  totalLifetimeValue: number;
}

export const DEFAULT_CUSTOMER_METRICS: CustomerMetrics = {
  totalCustomers: 0,
  leadsWithPhone: 0,
  vipCustomers: 0,
  totalLifetimeValue: 0,
};

export interface CustomerFilters {
  search: string;
  tags: string[];
  sortBy: 'lastInteractionAt' | 'lifetimeValue' | 'totalOrders' | 'createdAt' | 'customerName';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = {
  search: '',
  tags: [],
  sortBy: 'lastInteractionAt',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
};

/**
 * Hàm phòng vệ bóc tách dữ liệu Customer từ Backend API (Defensive Normalization)
 */
export function normalizeCustomer(raw: unknown): Customer {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const id = typeof data.id === 'string' ? data.id : '';
  const pageId = typeof data.pageId === 'string' ? data.pageId : '';
  const customerFbId = typeof data.customerFbId === 'string' ? data.customerFbId : '';
  const customerName = typeof data.customerName === 'string' && data.customerName.trim()
    ? data.customerName.trim()
    : 'Khách hàng Facebook';
  const phoneNumber = typeof data.phoneNumber === 'string' && data.phoneNumber.trim()
    ? data.phoneNumber.trim()
    : null;
  const address = typeof data.address === 'string' ? data.address : null;
  const tags = Array.isArray(data.tags) ? (data.tags.filter((t) => typeof t === 'string') as string[]) : [];
  const notes = typeof data.notes === 'string' ? data.notes : null;
  const lifetimeValue = typeof data.lifetimeValue === 'number' ? data.lifetimeValue : 0;
  const totalOrders = typeof data.totalOrders === 'number' ? data.totalOrders : 0;
  const lastOrderAt = typeof data.lastOrderAt === 'string' ? data.lastOrderAt : null;
  const lastInteractionAt = typeof data.lastInteractionAt === 'string' ? data.lastInteractionAt : new Date().toISOString();
  const createdAt = typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString();
  const aov = typeof data.aov === 'number' ? data.aov : 0;

  return {
    id,
    pageId,
    customerFbId,
    customerName,
    phoneNumber,
    address,
    tags,
    notes,
    lifetimeValue,
    totalOrders,
    lastOrderAt,
    lastInteractionAt,
    createdAt,
    aov,
  };
}
