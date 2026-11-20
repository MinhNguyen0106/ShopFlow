'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { usePageStore } from '@/lib/page.store';
import { useAuthStore } from '@/lib/auth.store';
import { BentoMetrics } from '@/components/dashboard/bento-metrics';
import { TrafficChart } from '@/components/dashboard/traffic-chart';
import { MetaWindowWidget } from '@/components/dashboard/meta-window-widget';
import { HotLeadsWidget } from '@/components/dashboard/hot-leads-widget';
import { QuickActions } from '@/components/dashboard/quick-actions';

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const { pages, selectedPage, selectPage, fetchPages, isLoading } = usePageStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    const updateFormattedTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateFormattedTime();
    const timer = setInterval(updateFormattedTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Chào buổi sáng';
    if (hour >= 11 && hour < 14) return 'Chào buổi trưa';
    if (hour >= 14 && hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPages();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Chủ Shop';

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {greeting}, <span className="text-blue-600 dark:text-blue-400">{displayName}</span>! 👋
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Hệ thống trực tuyến
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tổng quan hiệu suất tương tác, chốt đơn & tự động hoá Fanpage hôm nay.
          </p>
        </div>

        {/* Action Bar / Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Fanpage Selector */}
          <div className="relative inline-block text-left">
            <select
              aria-label="Chọn Fanpage"
              value={selectedPage?.id || 'all'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'all') {
                  selectPage(null);
                } else {
                  const target = pages.find((p) => p.id === val);
                  if (target) selectPage(target);
                }
              }}
              className="appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium py-2 pl-3.5 pr-8 rounded-lg border border-slate-300/90 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer shadow-xs"
            >
              <option value="all">🌐 Tất cả Fanpage ({pages.length})</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  📄 {p.pageName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Làm mới dữ liệu"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300/90 dark:border-slate-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${
                isRefreshing || isLoading ? 'animate-spin text-blue-600' : ''
              }`}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <section aria-label="Chỉ số hiệu suất chính">
        <BentoMetrics />
      </section>

      {/* Main Grid: Left (Traffic + Hot Leads) | Right (Quick Actions + Meta Window) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          <section aria-label="Biểu đồ tương tác">
            <TrafficChart />
          </section>

          <section aria-label="Khách hàng tiềm năng nóng">
            <HotLeadsWidget />
          </section>
        </div>

        {/* Right Column (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-6">
          <section aria-label="Thao tác nhanh">
            <QuickActions />
          </section>

          <section aria-label="Cảnh báo cửa sổ 24h Meta">
            <MetaWindowWidget />
          </section>
        </div>
      </div>
    </div>
  );
}
