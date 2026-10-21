import React, { useState } from 'react';
import { Order, OrderStatus, OrderPagination } from '../../types/order';
import { OrderStatusBadge, PaymentStatusBadge } from './order-status-badge';
import {
  Search,
  Printer,
  Eye,
  Check,
  Truck,
  CheckCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Calendar,
  User,
  ShoppingBag,
} from 'lucide-react';

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
  selectedStatus: OrderStatus | 'all';
  onSelectStatus: (status: OrderStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectOrder: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  pagination: OrderPagination;
  onPageChange: (page: number) => void;
}

const STATUS_TABS: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'confirmed', label: 'Đã chốt đơn' },
  { id: 'shipping', label: 'Đang giao' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
];

export function OrderTable({
  orders,
  isLoading,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
  onSelectOrder,
  onPrintOrder,
  onUpdateStatus,
  pagination,
  onPageChange,
}: OrderTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(orders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* 1. Header Toolbar & Filters */}
      <div className="p-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm mã đơn, tên, SĐT, SKU..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-muted/40 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Order Table Content */}
      <div className="overflow-x-auto min-h-[360px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-medium">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selectedIds.length === orders.length}
                  onChange={handleSelectAll}
                  className="rounded border-border text-primary focus:ring-primary/20 w-3.5 h-3.5"
                />
              </th>
              <th className="py-3 px-4 font-semibold">Mã đơn hàng</th>
              <th className="py-3 px-4 font-semibold">Khách hàng</th>
              <th className="py-3 px-4 font-semibold">Sản phẩm tóm tắt</th>
              <th className="py-3 px-4 font-semibold text-right">Tổng tiền</th>
              <th className="py-3 px-4 font-semibold text-center">Trạng thái đơn</th>
              <th className="py-3 px-4 font-semibold text-center">Thanh toán</th>
              <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải danh sách đơn hàng...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="font-medium text-foreground">Không tìm thấy đơn hàng nào</div>
                    <p className="text-[11px] text-muted-foreground">
                      Chưa có đơn hàng nào khớp với bộ lọc hoặc từ khóa tìm kiếm.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isSelected = selectedIds.includes(order.id);
                const firstItem = order.items[0];
                const otherItemsCount = order.items.length - 1;

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-muted/40 transition-colors group cursor-pointer ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => onSelectOrder(order)}
                  >
                    <td
                      className="py-3.5 px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRow(order.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(order.id)}
                        className="rounded border-border text-primary focus:ring-primary/20 w-3.5 h-3.5"
                      />
                    </td>

                    {/* Order Code & Date */}
                    <td className="py-3.5 px-4 font-medium text-foreground whitespace-nowrap">
                      <div className="font-mono font-semibold text-primary hover:underline">
                        {order.orderCode}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-foreground flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {order.customer.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {order.customer.maskedPhone || 'Chưa có SĐT'}
                      </div>
                    </td>

                    {/* Items Summary */}
                    <td className="py-3.5 px-4 max-w-[240px]">
                      {firstItem ? (
                        <div className="truncate text-foreground">
                          <span className="font-medium">{firstItem.name}</span>
                          {firstItem.variant && (
                            <span className="text-[11px] text-muted-foreground ml-1">
                              ({firstItem.variant.color || ''} {firstItem.variant.size || ''})
                            </span>
                          )}
                          <span className="text-muted-foreground ml-1">x{firstItem.quantity}</span>
                          {otherItemsCount > 0 && (
                            <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 rounded text-muted-foreground ml-1.5">
                              +{otherItemsCount}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Không có sản phẩm</span>
                      )}
                    </td>

                    {/* Final Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="font-bold text-foreground">
                        {formatCurrency(order.finalAmount)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Ship: {formatCurrency(order.shippingFee)}
                      </div>
                    </td>

                    {/* Order Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <OrderStatusBadge status={order.status} />
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <PaymentStatusBadge
                        status={order.paymentStatus}
                        method={order.paymentMethod}
                      />
                    </td>

                    {/* Quick Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onSelectOrder(order)}
                          title="Xem chi tiết đơn hàng"
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onPrintOrder(order)}
                          title="In phiếu giao hàng"
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Status Action based on current status */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => onUpdateStatus(order.id, 'confirmed')}
                            title="Xác nhận đơn hàng ngay"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => onUpdateStatus(order.id, 'shipping')}
                            title="Chuyển sang giao hàng"
                            className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {order.status === 'shipping' && (
                          <button
                            onClick={() => onUpdateStatus(order.id, 'completed')}
                            title="Đã giao thành công"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination Footer */}
      <div className="p-4 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div>
          Hiển thị <span className="font-semibold text-foreground">{orders.length}</span> /{' '}
          <span className="font-semibold text-foreground">{pagination.total}</span> đơn hàng
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isLoading}
            className="p-1.5 rounded-lg border border-border/60 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-medium text-foreground">
            Trang {pagination.page} / {pagination.totalPages || 1}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || isLoading}
            className="p-1.5 rounded-lg border border-border/60 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
