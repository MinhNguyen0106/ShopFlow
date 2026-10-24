'use client';

/**
 * ShopFlow - Business Analytics & Performance Dashboard
 * Route: /analytics
 * File: frontend/src/app/(dashboard)/analytics/page.tsx
 *
 * Màn hình Báo Cáo Phân Tích Doanh Thu & Hiệu Quả Bán Hàng (TASK-24).
 * Chuẩn macOS Clean Utility Bento Grid, Interactive SVG Charts, Golden Hour Heatmap.
 */

import React, { useEffect } from 'react';
import { usePageStore } from '@/lib/page.store';
import { useAnalyticsStore } from '@/lib/analytics.store';
import { AnalyticsHeader } from '@/components/analytics/analytics-header';
import { AnalyticsMetrics } from '@/components/analytics/analytics-metrics';
import { RevenueTrendChart } from '@/components/analytics/revenue-trend-chart';
import { ChannelBreakdownChart } from '@/components/analytics/channel-breakdown-chart';
import { TopProductsTable } from '@/components/analytics/top-products-table';
import { GoldenHourHeatmap } from '@/components/analytics/golden-hour-heatmap';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const { fetchPages } = usePageStore();
  const { fetchAnalytics, error, clearError } = useAnalyticsStore();

  useEffect(() => {
    fetchPages();
    fetchAnalytics();
  }, [fetchPages, fetchAnalytics]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Controls */}
      <AnalyticsHeader />

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchAnalytics()}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white border border-rose-300 rounded-lg hover:bg-rose-100 font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Thử lại</span>
            </button>
            <button
              onClick={clearError}
              className="text-rose-500 hover:text-rose-700 font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. Executive Bento Metrics */}
      <AnalyticsMetrics />

      {/* 3. Tầng 1: Biểu đồ xu hướng doanh thu & Phân rã kênh nguồn */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart />
        </div>
        <div className="lg:col-span-1">
          <ChannelBreakdownChart />
        </div>
      </div>

      {/* 4. Tầng 2: Top sản phẩm bán chạy nhất & Ma trận khung giờ vàng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TopProductsTable />
        </div>
        <div>
          <GoldenHourHeatmap />
        </div>
      </div>
    </div>
  );
}
