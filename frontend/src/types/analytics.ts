/**
 * ShopFlow - Analytics Types & Interfaces (TASK-24)
 * File: frontend/src/types/analytics.ts
 *
 * Tuân thủ quy chuẩn Defensive Data Parsing tại .agents/rules/api-contract-sync.md.
 */

export type TimeRangeFilter = '7d' | '30d' | '90d' | 'custom';

export interface AnalyticsSummary {
  totalRevenue: number;
  revenueGrowthRate: number;
  totalOrders: number;
  ordersGrowthRate: number;
  averageOrderValue: number;
  aovGrowthRate: number;
  conversionRate: number;
  conversionRateGrowthRate: number;
}

export interface RevenueDataPoint {
  date: string;
  formattedDate: string;
  revenue: number;
  ordersCount: number;
  vietqrRevenue: number;
  codRevenue: number;
}

export interface ChannelMetric {
  channel: 'facebook_comment' | 'facebook_inbox' | 'manual';
  channelName: string;
  ordersCount: number;
  revenue: number;
  successRate: number;
  cancelRate: number;
}

export interface TopProductItem {
  productId: string | null;
  sku: string;
  productName: string;
  imageUrl: string | null;
  totalQuantitySold: number;
  totalRevenue: number;
  revenuePercentage: number;
}

export interface HeatmapCell {
  dayOfWeek: number; // 0 (CN) đến 6 (T7)
  dayLabel: string;
  hour: number; // 0 đến 23
  hourLabel: string;
  orderCount: number;
  totalAmount: number;
  isGoldenHour: boolean;
}

export const DAY_NAMES = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

/**
 * Hàm phòng vệ chuẩn hóa dữ liệu Summary từ Backend
 */
export function normalizeSummary(raw?: Record<string, unknown> | null): AnalyticsSummary {
  if (!raw || typeof raw !== 'object') {
    return {
      totalRevenue: 0,
      revenueGrowthRate: 0,
      totalOrders: 0,
      ordersGrowthRate: 0,
      averageOrderValue: 0,
      aovGrowthRate: 0,
      conversionRate: 0,
      conversionRateGrowthRate: 0,
    };
  }

  return {
    totalRevenue: Number(raw.totalRevenue || raw.total_revenue || 0),
    revenueGrowthRate: Number(raw.revenueGrowthRate || raw.revenue_growth_rate || 0),
    totalOrders: Number(raw.totalOrders || raw.total_orders || 0),
    ordersGrowthRate: Number(raw.ordersGrowthRate || raw.orders_growth_rate || 0),
    averageOrderValue: Number(raw.averageOrderValue || raw.average_order_value || 0),
    aovGrowthRate: Number(raw.aovGrowthRate || raw.aov_growth_rate || 0),
    conversionRate: Number(raw.conversionRate || raw.conversion_rate || 0),
    conversionRateGrowthRate: Number(
      raw.conversionRateGrowthRate || raw.conversion_rate_growth_rate || 0
    ),
  };
}

/**
 * Hàm phòng vệ chuẩn hóa chuỗi dữ liệu doanh thu
 */
export function normalizeRevenueSeries(rawList?: unknown): RevenueDataPoint[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((item: Record<string, unknown>) => {
    const rawDate = String(item.date || item.series_date || '');
    let formattedDate = rawDate;
    if (rawDate.includes('-')) {
      const parts = rawDate.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}`;
      }
    }

    return {
      date: rawDate,
      formattedDate,
      revenue: Number(item.revenue || 0),
      ordersCount: Number(item.ordersCount || item.orders_count || 0),
      vietqrRevenue: Number(item.vietqrRevenue || item.vietqr_revenue || 0),
      codRevenue: Number(item.codRevenue || item.cod_revenue || 0),
    };
  });
}

/**
 * Hàm phòng vệ chuẩn hóa tỷ lệ nguồn kênh
 */
export function normalizeChannelBreakdown(rawList?: unknown): ChannelMetric[] {
  if (!Array.isArray(rawList)) return [];

  const defaultNames: Record<string, string> = {
    facebook_comment: 'Bình luận Fanpage',
    facebook_inbox: 'Hộp thư Messenger',
    manual: 'Tạo đơn thủ công',
  };

  return rawList.map((item: Record<string, unknown>) => {
    const channel = (item.channel || item.source || 'manual') as
      | 'facebook_comment'
      | 'facebook_inbox'
      | 'manual';
    return {
      channel,
      channelName: String(item.channelName || defaultNames[channel] || 'Kênh khác'),
      ordersCount: Number(item.ordersCount || item.orders_count || 0),
      revenue: Number(item.revenue || 0),
      successRate: Number(item.successRate || item.success_rate || 0),
      cancelRate: Number(item.cancelRate || item.cancel_rate || 0),
    };
  });
}

/**
 * Hàm phòng vệ chuẩn hóa Top sản phẩm bán chạy
 */
export function normalizeTopProducts(rawList?: unknown): TopProductItem[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((item: Record<string, unknown>) => ({
    productId: item.productId ? String(item.productId) : null,
    sku: String(item.sku || 'N/A'),
    productName: String(item.productName || item.product_name || 'Sản phẩm'),
    imageUrl: item.imageUrl ? String(item.imageUrl) : null,
    totalQuantitySold: Number(item.totalQuantitySold || item.total_quantity || 0),
    totalRevenue: Number(item.totalRevenue || item.total_revenue || 0),
    revenuePercentage: Number(item.revenuePercentage || item.revenue_percentage || 0),
  }));
}

/**
 * Hàm phòng vệ chuẩn hóa ma trận nhiệt
 */
export function normalizeHeatmap(rawList?: unknown): HeatmapCell[] {
  if (!Array.isArray(rawList)) return [];

  return rawList.map((item: Record<string, unknown>) => {
    const day = Number(item.dayOfWeek !== undefined ? item.dayOfWeek : item.day_of_week || 0);
    const hour = Number(item.hour !== undefined ? item.hour : item.hour_of_day || 0);

    return {
      dayOfWeek: day,
      dayLabel: DAY_NAMES[day] || `Ngày ${day}`,
      hour,
      hourLabel: `${hour.toString().padStart(2, '0')}:00`,
      orderCount: Number(item.orderCount || item.order_count || 0),
      totalAmount: Number(item.totalAmount || item.total_amount || 0),
      isGoldenHour: Boolean(item.isGoldenHour ?? ((hour >= 11 && hour <= 12) || (hour >= 20 && hour <= 21))),
    };
  });
}
