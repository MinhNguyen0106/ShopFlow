/**
 * ShopFlow - Analytics Management Zustand Store (TASK-24)
 * File: frontend/src/lib/analytics.store.ts
 *
 * Quản lý trạng thái bộ lọc mốc thời gian, Fanpage, nạp dữ liệu báo cáo đa chiều
 * và xuất báo cáo CSV tiếng Việt có BOM UTF-8.
 */

import { create } from 'zustand';
import { apiClient } from './api-client';
import {
  TimeRangeFilter,
  AnalyticsSummary,
  RevenueDataPoint,
  ChannelMetric,
  TopProductItem,
  HeatmapCell,
  normalizeSummary,
  normalizeRevenueSeries,
  normalizeChannelBreakdown,
  normalizeTopProducts,
  normalizeHeatmap,
} from '../types/analytics';

export interface AnalyticsState {
  timeRange: TimeRangeFilter;
  customDateRange: {
    startDate: string;
    endDate: string;
  };
  selectedPageId: string | null;
  summary: AnalyticsSummary;
  revenueSeries: RevenueDataPoint[];
  channelBreakdown: ChannelMetric[];
  topProducts: TopProductItem[];
  heatmap: HeatmapCell[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setTimeRange: (range: TimeRangeFilter) => void;
  setCustomDateRange: (range: { startDate: string; endDate: string }) => void;
  setSelectedPageId: (pageId: string | null) => void;
  fetchAnalytics: () => Promise<void>;
  exportCsv: () => void;
  clearError: () => void;
}

const DEFAULT_SUMMARY: AnalyticsSummary = {
  totalRevenue: 0,
  revenueGrowthRate: 0,
  totalOrders: 0,
  ordersGrowthRate: 0,
  averageOrderValue: 0,
  aovGrowthRate: 0,
  conversionRate: 0,
  conversionRateGrowthRate: 0,
};

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  timeRange: '7d',
  customDateRange: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  },
  selectedPageId: null,
  summary: DEFAULT_SUMMARY,
  revenueSeries: [],
  channelBreakdown: [],
  topProducts: [],
  heatmap: [],
  isLoading: false,
  error: null,

  setTimeRange: (timeRange: TimeRangeFilter) => {
    set({ timeRange });
    get().fetchAnalytics();
  },

  setCustomDateRange: (customDateRange) => {
    set({ customDateRange, timeRange: 'custom' });
    get().fetchAnalytics();
  },

  setSelectedPageId: (selectedPageId: string | null) => {
    set({ selectedPageId });
    get().fetchAnalytics();
  },

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });

    const { timeRange, customDateRange, selectedPageId } = get();

    const params: Record<string, string> = {
      timeRange,
    };

    if (selectedPageId) {
      params.pageId = selectedPageId;
    }

    if (timeRange === 'custom') {
      if (customDateRange.startDate) params.startDate = customDateRange.startDate;
      if (customDateRange.endDate) params.endDate = customDateRange.endDate;
    }

    try {
      const [summaryRes, seriesRes, channelsRes, productsRes, heatmapRes] =
        await Promise.allSettled([
          apiClient.get('/analytics/summary', { params }),
          apiClient.get('/analytics/revenue-series', { params }),
          apiClient.get('/analytics/channel-breakdown', { params }),
          apiClient.get('/analytics/top-products', { params: { ...params, limit: 10 } }),
          apiClient.get('/analytics/sales-heatmap', { params }),
        ]);

      const summaryData =
        summaryRes.status === 'fulfilled' ? summaryRes.value.data?.data : null;
      const seriesData =
        seriesRes.status === 'fulfilled' ? seriesRes.value.data?.data : [];
      const channelsData =
        channelsRes.status === 'fulfilled' ? channelsRes.value.data?.data : [];
      const productsData =
        productsRes.status === 'fulfilled' ? productsRes.value.data?.data : [];
      const heatmapData =
        heatmapRes.status === 'fulfilled' ? heatmapRes.value.data?.data : [];

      set({
        summary: normalizeSummary(summaryData),
        revenueSeries: normalizeRevenueSeries(seriesData),
        channelBreakdown: normalizeChannelBreakdown(channelsData),
        topProducts: normalizeTopProducts(productsData),
        heatmap: normalizeHeatmap(heatmapData),
        isLoading: false,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Không thể tải dữ liệu báo cáo kinh doanh';
      set({ error: message, isLoading: false });
    }
  },

  exportCsv: () => {
    if (typeof window === 'undefined') return;

    const { summary, revenueSeries, topProducts, timeRange } = get();

    const rows: string[] = [];

    // Tiêu đề & Tóm tắt
    rows.push(`BÁO CÁO PHÂN TÍCH KINH DOANH SHOPFLOW`);
    rows.push(`Thời gian xuất: ${new Date().toLocaleString('vi-VN')}`);
    rows.push(`Kỳ báo cáo: ${timeRange}`);
    rows.push('');

    // Bảng 1: Chỉ số KPIs tổng quan
    rows.push('--- CHỈ SỐ KPIs TỔNG QUAN ---');
    rows.push('Chỉ số,Giá trị,Tăng trưởng');
    rows.push(`Tổng doanh thu,${summary.totalRevenue} VNĐ,${summary.revenueGrowthRate}%`);
    rows.push(`Tổng số đơn hàng,${summary.totalOrders},${summary.ordersGrowthRate}%`);
    rows.push(`Giá trị trung bình đơn (AOV),${summary.averageOrderValue} VNĐ,${summary.aovGrowthRate}%`);
    rows.push(`Tỷ lệ chốt đơn (Conversion Rate),${summary.conversionRate}%,${summary.conversionRateGrowthRate}%`);
    rows.push('');

    // Bảng 2: Doanh thu theo ngày
    rows.push('--- DOANH THU THEO NGÀY ---');
    rows.push('Ngày,Doanh thu (VNĐ),Số đơn,Doanh thu VietQR (VNĐ),Doanh thu COD (VNĐ)');
    for (const d of revenueSeries) {
      rows.push(`"${d.date}",${d.revenue},${d.ordersCount},${d.vietqrRevenue},${d.codRevenue}`);
    }
    rows.push('');

    // Bảng 3: Top sản phẩm bán chạy
    rows.push('--- TOP SẢN PHẨM BÁN CHẠY NHẤT ---');
    rows.push('Mã SKU,Tên sản phẩm,Số lượng bán,Doanh thu (VNĐ),Đóng góp (%)');
    for (const p of topProducts) {
      rows.push(`"${p.sku}","${p.productName}",${p.totalQuantitySold},${p.totalRevenue},${p.revenuePercentage}%`);
    }

    // Ghép UTF-8 BOM để Excel không lỗi font tiếng Việt
    const csvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `ShopFlow_BaoCaoDoanhThu_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  clearError: () => set({ error: null }),
}));
