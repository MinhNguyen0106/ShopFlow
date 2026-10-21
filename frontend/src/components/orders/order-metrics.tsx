import React from 'react';
import { OrderMetrics as OrderMetricsType } from '../../types/order';
import { ShoppingBag, Clock, Truck, DollarSign, TrendingUp } from 'lucide-react';

interface OrderMetricsProps {
  metrics: OrderMetricsType;
  isLoading?: boolean;
}

export function OrderMetrics({ metrics, isLoading = false }: OrderMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const cards = [
    {
      title: 'Tổng đơn hôm nay',
      value: isLoading ? '...' : metrics.totalToday.toLocaleString('vi-VN'),
      icon: ShoppingBag,
      color: 'blue',
      badge: `+${metrics.totalTodayGrowth}%`,
      badgeColor: 'emerald',
      subtext: 'Phát sinh từ Messenger & Bình luận',
    },
    {
      title: 'Chờ xác nhận',
      value: isLoading ? '...' : metrics.pendingCount.toLocaleString('vi-VN'),
      icon: Clock,
      color: 'amber',
      badge: metrics.pendingCount > 0 ? 'Cần chốt đơn' : 'Đã xử lý hết',
      badgeColor: metrics.pendingCount > 0 ? 'amber' : 'emerald',
      subtext: 'Cần xác nhận tồn kho & địa chỉ',
    },
    {
      title: 'Đang giao hàng',
      value: isLoading ? '...' : metrics.shippingCount.toLocaleString('vi-VN'),
      icon: Truck,
      color: 'purple',
      badge: 'Đang luân chuyển',
      badgeColor: 'purple',
      subtext: 'Đã bàn giao cho shipper / đối tác',
    },
    {
      title: 'Doanh thu hôm nay',
      value: isLoading ? '...' : formatCurrency(metrics.estimatedRevenueToday),
      icon: DollarSign,
      color: 'emerald',
      badge: 'Ước tính COD + CK',
      badgeColor: 'emerald',
      subtext: 'Chưa trừ chiết khấu & hủy đơn',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-border hover:shadow transition-all relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">
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
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {card.value}
              </div>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                  card.badgeColor === 'emerald'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : card.badgeColor === 'amber'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
                }`}
              >
                {card.badgeColor === 'emerald' && card.title.includes('Tổng') && (
                  <TrendingUp className="w-3 h-3" />
                )}
                {card.badge}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground truncate">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
