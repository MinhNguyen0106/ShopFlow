import React from 'react';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../../types/order';
import {
  Clock,
  CheckCircle2,
  Truck,
  CheckCheck,
  XCircle,
  CreditCard,
  Banknote,
  RotateCcw,
} from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showIcon?: boolean;
}

export function OrderStatusBadge({
  status,
  className = '',
  showIcon = true,
}: OrderStatusBadgeProps) {
  switch (status) {
    case 'pending':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5" />}
          Chờ xác nhận
        </span>
      );
    case 'confirmed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          Đã chốt đơn
        </span>
      );
    case 'shipping':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 ${className}`}
        >
          {showIcon && <Truck className="w-3.5 h-3.5" />}
          Đang giao hàng
        </span>
      );
    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
        >
          {showIcon && <CheckCheck className="w-3.5 h-3.5" />}
          Hoàn thành
        </span>
      );
    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 ${className}`}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5" />}
          Đã hủy
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border ${className}`}
        >
          {status}
        </span>
      );
  }
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  method?: PaymentMethod;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  method = 'cod',
  className = '',
}: PaymentStatusBadgeProps) {
  const methodLabel = method === 'cod' ? 'COD' : method === 'vietqr' ? 'VietQR' : 'Chuyển khoản';

  if (status === 'paid') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 ${className}`}
      >
        <CreditCard className="w-3 h-3" />
        Đã thanh toán ({methodLabel})
      </span>
    );
  }

  if (status === 'refunded') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20 ${className}`}
      >
        <RotateCcw className="w-3 h-3" />
        Đã hoàn tiền
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 ${className}`}
    >
      <Banknote className="w-3 h-3" />
      Chưa thanh toán ({methodLabel})
    </span>
  );
}
