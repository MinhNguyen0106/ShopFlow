/**
 * ShopFlow - Analytics Store Unit Tests (TASK-24)
 * File: frontend/src/lib/__tests__/analytics.store.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAnalyticsStore } from '../analytics.store';
import { apiClient } from '../api-client';

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('Analytics Store (useAnalyticsStore)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAnalyticsStore.setState({
      timeRange: '7d',
      selectedPageId: null,
      summary: {
        totalRevenue: 0,
        revenueGrowthRate: 0,
        totalOrders: 0,
        ordersGrowthRate: 0,
        averageOrderValue: 0,
        aovGrowthRate: 0,
        conversionRate: 0,
        conversionRateGrowthRate: 0,
      },
      revenueSeries: [],
      channelBreakdown: [],
      topProducts: [],
      heatmap: [],
      isLoading: false,
      error: null,
    });
  });

  describe('fetchAnalytics', () => {
    it('gọi các endpoints phân tích và chuẩn hóa dữ liệu thành công', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
        if (url === '/analytics/summary') {
          return Promise.resolve({
            data: {
              success: true,
              data: {
                totalRevenue: 25000000,
                revenueGrowthRate: 12.5,
                totalOrders: 100,
                ordersGrowthRate: 5.0,
                averageOrderValue: 250000,
                aovGrowthRate: 7.1,
                conversionRate: 8.5,
                conversionRateGrowthRate: 1.2,
              },
            },
          });
        }
        if (url === '/analytics/revenue-series') {
          return Promise.resolve({
            data: {
              success: true,
              data: [
                {
                  series_date: '2026-10-24',
                  revenue: 5000000,
                  orders_count: 20,
                  vietqr_revenue: 3000000,
                  cod_revenue: 2000000,
                },
              ],
            },
          });
        }
        if (url === '/analytics/channel-breakdown') {
          return Promise.resolve({
            data: {
              success: true,
              data: [
                {
                  source: 'facebook_comment',
                  orders_count: 60,
                  revenue: 15000000,
                  success_rate: 90,
                  cancel_rate: 5,
                },
              ],
            },
          });
        }
        if (url === '/analytics/top-products') {
          return Promise.resolve({
            data: {
              success: true,
              data: [
                {
                  product_id: 'p-1',
                  sku: 'SP01',
                  product_name: 'Váy Hoa Nhí',
                  total_quantity: 30,
                  total_revenue: 9000000,
                  revenue_percentage: 36,
                },
              ],
            },
          });
        }
        if (url === '/analytics/sales-heatmap') {
          return Promise.resolve({
            data: {
              success: true,
              data: [
                {
                  day_of_week: 1,
                  hour_of_day: 12,
                  order_count: 10,
                  total_amount: 2500000,
                  is_golden_hour: true,
                },
              ],
            },
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      await useAnalyticsStore.getState().fetchAnalytics();

      const state = useAnalyticsStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.summary.totalRevenue).toBe(25000000);
      expect(state.summary.revenueGrowthRate).toBe(12.5);
      expect(state.revenueSeries).toHaveLength(1);
      expect(state.revenueSeries[0].formattedDate).toBe('24/10');
      expect(state.channelBreakdown).toHaveLength(1);
      expect(state.channelBreakdown[0].channelName).toBe('Bình luận Fanpage');
      expect(state.topProducts).toHaveLength(1);
      expect(state.topProducts[0].sku).toBe('SP01');
      expect(state.heatmap).toHaveLength(1);
      expect(state.heatmap[0].isGoldenHour).toBe(true);
    });

    it('xử lý an toàn khi API trả về dữ liệu rỗng hoặc lỗi', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network Error')
      );

      await useAnalyticsStore.getState().fetchAnalytics();

      const state = useAnalyticsStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.summary.totalRevenue).toBe(0);
      expect(state.revenueSeries).toEqual([]);
    });
  });

  describe('setTimeRange & setSelectedPageId', () => {
    it('cập nhật timeRange và tự động gọi fetchAnalytics', () => {
      const spyFetch = vi.spyOn(useAnalyticsStore.getState(), 'fetchAnalytics');

      useAnalyticsStore.getState().setTimeRange('30d');
      expect(useAnalyticsStore.getState().timeRange).toBe('30d');
      expect(spyFetch).toHaveBeenCalled();
    });

    it('cập nhật selectedPageId và tự động gọi fetchAnalytics', () => {
      const spyFetch = vi.spyOn(useAnalyticsStore.getState(), 'fetchAnalytics');

      useAnalyticsStore.getState().setSelectedPageId('page-uuid-123');
      expect(useAnalyticsStore.getState().selectedPageId).toBe('page-uuid-123');
      expect(spyFetch).toHaveBeenCalled();
    });
  });

  describe('exportCsv', () => {
    it('khởi tạo thẻ download và gọi click không gây lỗi crash', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      useAnalyticsStore.setState({
        summary: {
          totalRevenue: 10000000,
          revenueGrowthRate: 10,
          totalOrders: 40,
          ordersGrowthRate: 5,
          averageOrderValue: 250000,
          aovGrowthRate: 5,
          conversionRate: 10,
          conversionRateGrowthRate: 1,
        },
        revenueSeries: [
          {
            date: '2026-10-24',
            formattedDate: '24/10',
            revenue: 10000000,
            ordersCount: 40,
            vietqrRevenue: 6000000,
            codRevenue: 4000000,
          },
        ],
        topProducts: [
          {
            productId: 'p-1',
            sku: 'SP01',
            productName: 'Áo Polo',
            imageUrl: null,
            totalQuantitySold: 20,
            totalRevenue: 5000000,
            revenuePercentage: 50,
          },
        ],
      });

      // Mock URL.createObjectURL and revokeObjectURL
      const mockUrl = 'blob:http://localhost/mock-blob';
      window.URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
      window.URL.revokeObjectURL = vi.fn();

      expect(() => useAnalyticsStore.getState().exportCsv()).not.toThrow();
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });
});
