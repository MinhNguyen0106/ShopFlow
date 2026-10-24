/**
 * ShopFlow - Analytics Dashboard Integration Tests
 * File: frontend/src/app/(dashboard)/analytics/__tests__/analytics.test.tsx
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnalyticsPage from '../page';
import { useAnalyticsStore } from '@/lib/analytics.store';
import { usePageStore } from '@/lib/page.store';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
  },
}));

describe('Analytics Dashboard Integration Tests (TASK-24)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    usePageStore.setState({
      pages: [
        {
          id: 'page-1',
          userId: 'user-1',
          pageId: 'meta-p1',
          pageName: 'Shop Quần Áo Nam',
          isActive: true,
          webhookSubscribed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      selectedPage: null,
      isLoading: false,
      error: null,
    });

    useAnalyticsStore.setState({
      timeRange: '7d',
      selectedPageId: null,
      summary: {
        totalRevenue: 45000000,
        revenueGrowthRate: 15.2,
        totalOrders: 180,
        ordersGrowthRate: 8.5,
        averageOrderValue: 250000,
        aovGrowthRate: 6.2,
        conversionRate: 12.8,
        conversionRateGrowthRate: 1.5,
      },
      revenueSeries: [
        {
          date: '2026-10-23',
          formattedDate: '23/10',
          revenue: 20000000,
          ordersCount: 80,
          vietqrRevenue: 12000000,
          codRevenue: 8000000,
        },
        {
          date: '2026-10-24',
          formattedDate: '24/10',
          revenue: 25000000,
          ordersCount: 100,
          vietqrRevenue: 15000000,
          codRevenue: 10000000,
        },
      ],
      channelBreakdown: [
        {
          channel: 'facebook_comment',
          channelName: 'Bình luận Fanpage',
          ordersCount: 100,
          revenue: 25000000,
          successRate: 91.5,
          cancelRate: 3.2,
        },
        {
          channel: 'facebook_inbox',
          channelName: 'Hộp thư Messenger',
          ordersCount: 60,
          revenue: 15000000,
          successRate: 88.0,
          cancelRate: 4.1,
        },
        {
          channel: 'manual',
          channelName: 'Tạo đơn thủ công',
          ordersCount: 20,
          revenue: 5000000,
          successRate: 95.0,
          cancelRate: 1.0,
        },
      ],
      topProducts: [
        {
          productId: 'prod-1',
          sku: 'SP-POLO-01',
          productName: 'Áo Polo Thể Thao Nam',
          imageUrl: null,
          totalQuantitySold: 65,
          totalRevenue: 16250000,
          revenuePercentage: 36.1,
        },
        {
          productId: 'prod-2',
          sku: 'SP-JEAN-02',
          productName: 'Quần Jeans Slimfit',
          imageUrl: null,
          totalQuantitySold: 40,
          totalRevenue: 14000000,
          revenuePercentage: 31.1,
        },
      ],
      heatmap: [
        {
          dayOfWeek: 1,
          dayLabel: 'Thứ 2',
          hour: 12,
          hourLabel: '12:00',
          orderCount: 15,
          totalAmount: 3750000,
          isGoldenHour: true,
        },
      ],
      isLoading: false,
      error: null,
    });
  });

  it('render đầy đủ tiêu đề, các nút điều khiển và 4 thẻ Bento KPIs', () => {
    render(<AnalyticsPage />);

    expect(
      screen.getByText('Báo Cáo Phân Tích Kinh Doanh')
    ).toBeInTheDocument();
    expect(screen.getByText('Doanh Thu Thuần')).toBeInTheDocument();
    expect(screen.getByText('Tổng Số Đơn Hàng')).toBeInTheDocument();
    expect(screen.getByText('Tỷ Lệ Chốt Đơn (CR)')).toBeInTheDocument();
    expect(screen.getByText('Giá Trị Trung Bình Đơn (AOV)')).toBeInTheDocument();

    // Huy hiệu tăng trưởng
    expect(screen.getByText('+15.2%')).toBeInTheDocument();
    expect(screen.getByText('+8.5%')).toBeInTheDocument();
  });

  it('render các khối biểu đồ xu hướng doanh thu và phân rã nguồn kênh', () => {
    render(<AnalyticsPage />);

    expect(
      screen.getByText('Biểu Đồ Xu Hướng Doanh Thu & Đơn Hàng')
    ).toBeInTheDocument();
    expect(screen.getByText('Phân Rã Nguồn Đơn Hàng')).toBeInTheDocument();
    expect(screen.getByText('Bình luận Fanpage')).toBeInTheDocument();
    expect(screen.getByText('Hộp thư Messenger')).toBeInTheDocument();
  });

  it('render bảng xếp hạng Top sản phẩm bán chạy và ma trận khung giờ vàng', () => {
    render(<AnalyticsPage />);

    expect(screen.getByText('Top Sản Phẩm Bán Chạy Nhất')).toBeInTheDocument();
    expect(screen.getByText('Áo Polo Thể Thao Nam')).toBeInTheDocument();
    expect(screen.getByText('SP-POLO-01')).toBeInTheDocument();
    expect(screen.getByText('Bản Đồ Nhiệt Khung Giờ Vàng Chốt Đơn')).toBeInTheDocument();
  });

  it('cho phép người dùng chuyển đổi mốc thời gian phân tích', () => {
    render(<AnalyticsPage />);

    const thirtyDaysBtn = screen.getByText('30 ngày qua');
    fireEvent.click(thirtyDaysBtn);

    expect(useAnalyticsStore.getState().timeRange).toBe('30d');
  });

  it('cho phép người dùng chọn lọc dữ liệu theo từng Fanpage', () => {
    render(<AnalyticsPage />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'page-1' } });

    expect(useAnalyticsStore.getState().selectedPageId).toBe('page-1');
  });

  it('kích hoạt xuất báo cáo CSV khi người dùng bấm nút', () => {
    const exportSpy = vi.spyOn(useAnalyticsStore.getState(), 'exportCsv');

    render(<AnalyticsPage />);

    const exportBtn = screen.getByText('Xuất Báo Cáo CSV');
    fireEvent.click(exportBtn);

    expect(exportSpy).toHaveBeenCalled();
  });
});
