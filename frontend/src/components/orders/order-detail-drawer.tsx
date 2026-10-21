import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types/order';
import { OrderStatusBadge, PaymentStatusBadge } from './order-status-badge';
import {
  X,
  User,
  Phone,
  MapPin,
  Copy,
  Check,
  Printer,
  Calendar,
  CheckCircle2,
  Truck,
  CheckCheck,
  XCircle,
  MessageSquare,
  Package,
} from 'lucide-react';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<boolean | void>;
  onOpenPrint: (order: Order) => void;
  isUpdating?: boolean;
}

export function OrderDetailDrawer({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onOpenPrint,
  isUpdating = false,
}: OrderDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const handleCopyAddress = () => {
    if (order.customer.address) {
      navigator.clipboard.writeText(order.customer.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg md:max-w-xl bg-card border-l border-border shadow-2xl flex flex-col justify-between">
          {/* 1. Header */}
          <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-foreground">
                  {order.orderCode}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                Được tạo lúc {formatDate(order.createdAt)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenPrint(order)}
                title="In phiếu giao hàng"
                className="p-2 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Card Khách Hàng */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                  <User className="w-4 h-4 text-primary" />
                  Thông tin người nhận
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {order.source === 'facebook_comment'
                    ? 'Bình luận Fanpage'
                    : order.source === 'facebook_inbox'
                    ? 'Messenger Inbox'
                    : 'Nhập thủ công'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-foreground">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Họ và tên:</span>
                  <span className="font-medium">{order.customer.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Số điện thoại:</span>
                  <span className="font-mono font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    {order.customer.maskedPhone || 'Chưa cung cấp'}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-muted-foreground block text-[11px]">Địa chỉ giao hàng:</span>
                <div className="flex items-start justify-between gap-2 mt-0.5">
                  <span className="font-medium flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    {order.customer.address || 'Khách chưa để lại địa chỉ cụ thể'}
                  </span>
                  {order.customer.address && (
                    <button
                      onClick={handleCopyAddress}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          Đã chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Sao chép
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {order.notes && (
                <div className="pt-2 border-t border-border/40 text-muted-foreground text-[11px]">
                  <span className="font-medium text-foreground">Ghi chú:</span> {order.notes}
                </div>
              )}
            </div>

            {/* Card Danh Sách Sản Phẩm */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                  <Package className="w-4 h-4 text-primary" />
                  Sản phẩm đặt mua ({order.items.length})
                </span>
                <PaymentStatusBadge
                  status={order.paymentStatus}
                  method={order.paymentMethod}
                />
              </div>

              <div className="divide-y divide-border/40">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-muted border border-border/60 flex items-center justify-center shrink-0 text-muted-foreground font-mono font-bold text-xs">
                        {item.sku.slice(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Mã: {item.sku}
                          {item.variant && (
                            <span className="ml-1.5 text-foreground/80">
                              [{item.variant.color || ''} {item.variant.size || ''}]
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-foreground">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatCurrency(item.price)} x {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bảng Chi Phí & Tổng Tiền */}
              <div className="pt-3 border-t border-border/60 space-y-1.5 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Tạm tính tiền hàng:</span>
                  <span className="text-foreground">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="text-foreground">{formatCurrency(order.shippingFee)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Chiết khấu / Giảm giá:</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border/40 font-bold text-sm text-foreground">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-primary text-base">{formatCurrency(order.finalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Card Lịch Sử Trạng Thái (Timeline) */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                Lịch sử xử lý đơn hàng
              </span>

              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                {order.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                    <div>
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={event.status} showIcon={false} />
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      {event.note && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{event.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Footer Actions */}
          <div className="p-4 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => onOpenPrint(order)}
              className="px-3.5 py-2 rounded-xl border border-border/60 hover:bg-muted text-foreground font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              In phiếu
            </button>

            <div className="flex items-center gap-2">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => onUpdateStatus(order.id, 'cancelled')}
                    disabled={isUpdating}
                    className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-500/10 font-medium transition-colors disabled:opacity-50"
                  >
                    Hủy đơn
                  </button>
                  <button
                    onClick={() => onUpdateStatus(order.id, 'confirmed')}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Xác nhận đơn
                  </button>
                </>
              )}

              {order.status === 'confirmed' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'shipping')}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  <Truck className="w-4 h-4" />
                  Bàn giao vận chuyển
                </button>
              )}

              {order.status === 'shipping' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'completed')}
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  Giao thành công
                </button>
              )}

              {order.status === 'completed' && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCheck className="w-4 h-4" />
                  Đơn đã hoàn tất
                </span>
              )}

              {order.status === 'cancelled' && (
                <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Đơn đã hủy
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
