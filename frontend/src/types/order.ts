/**
 * ShopFlow - Order Types & DTO Interfaces (TASK-22)
 * File: frontend/src/types/order.ts
 *
 * Định nghĩa cấu trúc đơn hàng, giỏ hàng, timeline, bộ lọc và các hàm phòng vệ.
 * Tuân thủ nghiêm ngặt quy định tại .agents/rules/api-contract-sync.md.
 */

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type PaymentMethod = 'cod' | 'banking' | 'vietqr';

export type OrderSource = 'facebook_comment' | 'facebook_inbox' | 'manual';

export interface OrderItemVariant {
  color?: string;
  size?: string;
  sku?: string;
}

export interface OrderItem {
  id?: string;
  productId?: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
  variant?: OrderItemVariant;
  imageUrl?: string;
}

export interface OrderTimelineEvent {
  id?: string;
  status: OrderStatus;
  note?: string;
  actor?: string;
  timestamp: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  maskedPhone?: string;
  address?: string;
  fbId?: string;
}

export interface Order {
  id: string;
  orderCode: string;
  pageId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  source: OrderSource;
  sourceMetaId?: string;
  notes?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderMetrics {
  totalToday: number;
  totalTodayGrowth: number;
  pendingCount: number;
  shippingCount: number;
  estimatedRevenueToday: number;
}

export const DEFAULT_ORDER_METRICS: OrderMetrics = {
  totalToday: 0,
  totalTodayGrowth: 0,
  pendingCount: 0,
  shippingCount: 0,
  estimatedRevenueToday: 0,
};

/**
 * Tiện ích che giấu số điện thoại cá nhân (PII Masking)
 * Ví dụ: "0987654321" -> "098****321"
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return 'Chưa có SĐT';
  const cleanPhone = phone.trim().replace(/\s+/g, '');
  if (cleanPhone.length < 7) return cleanPhone;
  const start = cleanPhone.slice(0, 3);
  const end = cleanPhone.slice(-3);
  return `${start}****${end}`;
}

/**
 * Hàm chuẩn hóa DTO phòng vệ (Defensive Normalizer)
 * Đảm bảo dữ liệu từ backend dù ở dạng snake_case hay camelCase đều an toàn và không gây crash UI
 */
export function normalizeOrder(raw: unknown): Order {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `err-${Date.now()}`,
      orderCode: 'ORD-ERR',
      pageId: '',
      customer: { name: 'Khách hàng', phone: '', maskedPhone: 'Chưa có SĐT' },
      items: [],
      totalAmount: 0,
      shippingFee: 0,
      discountAmount: 0,
      finalAmount: 0,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'cod',
      source: 'manual',
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const obj = raw as Record<string, unknown>;

  // Customer normalization
  const rawCustomer = (obj.customer as Record<string, unknown>) || {};
  const customerName =
    (rawCustomer.name as string) ||
    (obj.customer_name as string) ||
    (obj.customerName as string) ||
    'Khách hàng ẩn danh';
  const customerPhone =
    (rawCustomer.phone as string) ||
    (obj.customer_phone as string) ||
    (obj.customerPhone as string) ||
    '';
  const customerAddress =
    (rawCustomer.address as string) ||
    (obj.shipping_address as string) ||
    (obj.shippingAddress as string) ||
    '';
  const customerFbId =
    (rawCustomer.fbId as string) ||
    (obj.customer_fb_id as string) ||
    (obj.customerFbId as string) ||
    undefined;

  // Items normalization
  const rawItems = Array.isArray(obj.items) ? obj.items : [];
  const items: OrderItem[] = rawItems.map((itemRaw, index) => {
    const item = (itemRaw as Record<string, unknown>) || {};
    return {
      id: (item.id as string) || `item-${index}`,
      productId: (item.product_id as string) || (item.productId as string) || undefined,
      sku: (item.sku as string) || (item.product_code as string) || (item.productCode as string) || `SP-${index + 1}`,
      name: (item.name as string) || (item.product_name as string) || (item.productName as string) || 'Sản phẩm',
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || Number(item.priceEstimate) || 0,
      variant: (item.variant as OrderItemVariant) || (item.attributes as OrderItemVariant) || undefined,
      imageUrl: (item.image_url as string) || (item.imageUrl as string) || undefined,
    };
  });

  const totalAmount = Number(obj.total_amount ?? obj.totalAmount) || items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = Number(obj.shipping_fee ?? obj.shippingFee) || 0;
  const discountAmount = Number(obj.discount_amount ?? obj.discountAmount) || 0;
  const finalAmount = Number(obj.final_amount ?? obj.finalAmount) || totalAmount + shippingFee - discountAmount;

  // Timeline normalization
  const rawTimeline = Array.isArray(obj.timeline) ? obj.timeline : [];
  const timeline: OrderTimelineEvent[] = rawTimeline.map((evRaw, i) => {
    const ev = (evRaw as Record<string, unknown>) || {};
    return {
      id: (ev.id as string) || `tl-${i}`,
      status: (ev.status as OrderStatus) || 'pending',
      note: (ev.note as string) || undefined,
      actor: (ev.actor as string) || undefined,
      timestamp: (ev.timestamp as string) || (ev.created_at as string) || new Date().toISOString(),
    };
  });

  return {
    id: String(obj.id || `ord-${Date.now()}`),
    orderCode: String(obj.order_code || obj.orderCode || `ORD-${String(obj.id || Date.now()).slice(-6).toUpperCase()}`),
    pageId: String(obj.page_id || obj.pageId || ''),
    customer: {
      name: customerName,
      phone: customerPhone,
      maskedPhone: maskPhoneNumber(customerPhone),
      address: customerAddress,
      fbId: customerFbId,
    },
    items,
    totalAmount,
    shippingFee,
    discountAmount,
    finalAmount,
    status: (obj.status as OrderStatus) || 'pending',
    paymentStatus: (obj.payment_status as PaymentStatus) || (obj.paymentStatus as PaymentStatus) || 'unpaid',
    paymentMethod: (obj.payment_method as PaymentMethod) || (obj.paymentMethod as PaymentMethod) || 'cod',
    source: (obj.source as OrderSource) || 'facebook_comment',
    sourceMetaId: (obj.source_meta_id as string) || (obj.sourceMetaId as string) || undefined,
    notes: (obj.notes as string) || undefined,
    timeline,
    createdAt: (obj.created_at as string) || (obj.createdAt as string) || new Date().toISOString(),
    updatedAt: (obj.updated_at as string) || (obj.updatedAt as string) || new Date().toISOString(),
  };
}
