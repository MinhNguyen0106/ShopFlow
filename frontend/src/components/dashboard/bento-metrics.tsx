'use client';

import React from 'react';
import {
  MessageSquareText,
  ShieldCheck,
  CalendarClock,
  ClockAlert,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { DashboardMetrics, DEFAULT_DASHBOARD_METRICS } from '@/types/dashboard';

interface BentoMetricsProps {
  metrics?: DashboardMetrics;
}

export function BentoMetrics({ metrics = DEFAULT_DASHBOARD_METRICS }: BentoMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng hội thoại mới */}
      <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Tổng hội thoại hôm nay
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <MessageSquareText className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            1,248
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            +{metrics.conversationsGrowthPercent}%
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Tương tác qua Messenger & Bình luận
        </p>
      </div>

      {/* 2. Bình luận chứa SĐT đã ẩn */}
      <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Tự động ẩn SĐT
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {metrics.hiddenPhoneCount}
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            100% An toàn
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Độ trễ trung bình: {metrics.hiddenPhoneAvgResponseSeconds}s (SLA &lt; 3.0s)
        </p>
      </div>

      {/* 3. Bài viết đã lên lịch hôm nay */}
      <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Lịch đăng hôm nay
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <CalendarClock className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {metrics.scheduledPostsToday} / 10
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">bài viết</span>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
          <Sparkles className="h-3 w-3" />
          Trải đều các khung giờ vàng hôm nay
        </p>
      </div>

      {/* 4. Tỷ lệ phản hồi Meta 24h Window */}
      <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Tuân thủ Cửa sổ Meta 24h
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <ClockAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {metrics.metaWindowComplianceRate}%
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Đạt chuẩn
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Chính sách Meta Platform Policy
        </p>
      </div>
    </div>
  );
}
