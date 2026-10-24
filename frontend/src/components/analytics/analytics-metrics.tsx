'use client';

import React from 'react';
import { useAnalyticsStore } from '../../lib/analytics.store';
import { DollarSign, ShoppingBag, Target, Tag, TrendingUp, TrendingDown } from 'lucide-react';

export function AnalyticsMetrics() {
  const { summary, isLoading } = useAnalyticsStore();

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const cards = [
    {
      id: 'revenue',
      title: 'Doanh Thu Thuần',
      value: isLoading ? '...' : formatVND(summary.totalRevenue),
      growthRate: summary.revenueGrowthRate,
      icon: DollarSign,
      color: 'blue',
      subtext: 'Đơn đã xác nhận & hoàn tất',
    },
    {
      id: 'orders',
      title: 'Tổng Số Đơn Hàng',
      value: isLoading ? '...' : `${summary.totalOrders.toLocaleString('vi-VN')} đơn`,
      growthRate: summary.ordersGrowthRate,
      icon: ShoppingBag,
      color: 'indigo',
      subtext: 'Khởi tạo từ Comment & Inbox',
    },
    {
      id: 'conversion',
      title: 'Tỷ Lệ Chốt Đơn (CR)',
      value: isLoading ? '...' : `${summary.conversionRate}%`,
      growthRate: summary.conversionRateGrowthRate,
      icon: Target,
      color: 'emerald',
      subtext: 'Tỷ lệ chuyển đổi từ lead khách',
    },
    {
      id: 'aov',
      title: 'Giá Trị Trung Bình Đơn (AOV)',
      value: isLoading ? '...' : formatVND(summary.averageOrderValue),
      growthRate: summary.aovGrowthRate,
      icon: Tag,
      color: 'purple',
      subtext: 'Doanh thu trung bình trên mỗi đơn',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.growthRate >= 0;

        return (
          <div
            key={card.id}
            className="group relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Top row: Icon + Growth Badge */}
            <div className="flex items-center justify-between">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 ${
                  card.color === 'blue'
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : card.color === 'indigo'
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                      : card.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-purple-50 text-purple-600 border border-purple-100'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Badge tăng trưởng so với kỳ trước */}
              <div
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isPositive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>
                  {isPositive ? '+' : ''}
                  {card.growthRate}%
                </span>
              </div>
            </div>

            {/* Value & Title */}
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {card.value}
              </h3>
            </div>

            {/* Subtext footer */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{card.subtext}</span>
              <span className="text-slate-500 font-medium">So kỳ trước</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
