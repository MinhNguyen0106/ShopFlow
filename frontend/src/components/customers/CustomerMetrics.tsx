import React from 'react';
import { CustomerMetrics as CustomerMetricsType } from '../../types/customer';
import { Users, PhoneCall, Crown, DollarSign, TrendingUp } from 'lucide-react';

interface CustomerMetricsProps {
  metrics: CustomerMetricsType;
  isLoading?: boolean;
}

export function CustomerMetrics({ metrics, isLoading = false }: CustomerMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: 'Tổng khách hàng',
      value: isLoading ? '...' : metrics.totalCustomers.toLocaleString('vi-VN'),
      icon: Users,
      color: 'blue',
      badge: 'Cơ sở khách hàng',
      badgeColor: 'blue',
      subtext: 'Thu thập từ Messenger & Comment',
    },
    {
      title: 'Leads có SĐT',
      value: isLoading ? '...' : metrics.leadsWithPhone.toLocaleString('vi-VN'),
      icon: PhoneCall,
      color: 'amber',
      badge:
        metrics.totalCustomers > 0
          ? `${Math.round((metrics.leadsWithPhone / metrics.totalCustomers) * 100)}% chuyển đổi`
          : '0%',
      badgeColor: 'amber',
      subtext: 'Đã bảo vệ PII & sẵn sàng chốt đơn',
    },
    {
      title: 'Khách VIP',
      value: isLoading ? '...' : metrics.vipCustomers.toLocaleString('vi-VN'),
      icon: Crown,
      color: 'purple',
      badge: 'Trung thành',
      badgeColor: 'purple',
      subtext: 'Khách có nhãn Khach_VIP',
    },
    {
      title: 'Tổng LTV tích lũy',
      value: isLoading ? '...' : formatCurrency(metrics.totalLifetimeValue),
      icon: DollarSign,
      color: 'emerald',
      badge: 'Doanh số thực nhận',
      badgeColor: 'emerald',
      subtext: 'Giá trị vòng đời từ đơn hoàn thành',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="customer-metrics">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  card.color === 'blue'
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : card.color === 'amber'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : card.color === 'purple'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-1">
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                  card.badgeColor === 'emerald'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60'
                    : card.badgeColor === 'amber'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60'
                    : card.badgeColor === 'purple'
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/60'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60'
                }`}
              >
                {card.badgeColor === 'emerald' && <TrendingUp className="w-3 h-3" />}
                {card.badge}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
