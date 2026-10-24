'use client';

import React from 'react';
import { useAnalyticsStore } from '../../lib/analytics.store';
import { usePageStore } from '../../lib/page.store';
import { TimeRangeFilter } from '../../types/analytics';
import { Download, RefreshCw, BarChart2, Layers } from 'lucide-react';

export function AnalyticsHeader() {
  const {
    timeRange,
    setTimeRange,
    selectedPageId,
    setSelectedPageId,
    fetchAnalytics,
    exportCsv,
    isLoading,
  } = useAnalyticsStore();

  const { pages } = usePageStore();

  const timeRangeOptions: { id: TimeRangeFilter; label: string }[] = [
    { id: '7d', label: '7 ngày qua' },
    { id: '30d', label: '30 ngày qua' },
    { id: '90d', label: '90 ngày qua' },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-sm">
      {/* Tiêu đề & Icon */}
      <div className="flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Báo Cáo Phân Tích Kinh Doanh
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 rounded-full">
              Realtime
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi doanh thu, tỷ lệ chốt đơn và ma trận khung giờ vàng bán hàng trên Fanpage
          </p>
        </div>
      </div>

      {/* Cụm công cụ điều khiển: Chọn Fanpage + Chọn mốc thời gian + Xuất CSV */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Dropdown Fanpage */}
        <div className="relative flex items-center">
          <Layers className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <select
            value={selectedPageId || ''}
            onChange={(e) => setSelectedPageId(e.target.value || null)}
            className="pl-9 pr-8 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">Tất cả Fanpage</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.pageName}
              </option>
            ))}
          </select>
        </div>

        {/* Segmented Time Range Control */}
        <div className="flex items-center p-1 bg-slate-100/90 border border-slate-200/70 rounded-xl">
          {timeRangeOptions.map((opt) => {
            const isSelected = timeRange === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTimeRange(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white text-blue-600 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Nút Làm mới */}
        <button
          onClick={() => fetchAnalytics()}
          disabled={isLoading}
          title="Tải lại số liệu"
          className="p-2 text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Nút Xuất CSV */}
        <button
          onClick={() => exportCsv()}
          className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất Báo Cáo CSV</span>
        </button>
      </div>
    </div>
  );
}
