import React from 'react';
import { Customer } from '../../types/customer';
import { CustomerPagination } from '../../lib/customer.store';
import {
  Search,
  Phone,
  ChevronLeft,
  ChevronRight,
  User,
  Tag,
  ArrowUpDown,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onSelectCustomer: (customer: Customer) => void;
  pagination: CustomerPagination;
  onPageChange: (page: number) => void;
}

const COMMON_TAGS = [
  { id: 'Co_SDT', label: 'Có SĐT', color: 'emerald' },
  { id: 'Khach_VIP', label: 'Khách VIP', color: 'purple' },
  { id: 'Da_mua_hang', label: 'Đã mua hàng', color: 'blue' },
];

export function CustomerTable({
  customers,
  isLoading,
  searchQuery,
  onSearchChange,
  selectedTags,
  onToggleTag,
  onSelectCustomer,
  pagination,
  onPageChange,
}: CustomerTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
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

  const getTagColorClass = (tag: string) => {
    if (tag === 'Co_SDT') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60';
    }
    if (tag === 'Khach_VIP') {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/60';
    }
    if (tag === 'Da_mua_hang') {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/60';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col" data-testid="customer-table">
      {/* Top Search & Filter Bar */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên, số điện thoại hoặc Facebook ID..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-900 dark:text-white transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Quick Tag Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Lọc nhanh:
          </span>
          {COMMON_TAGS.map((t) => {
            const isSelected = selectedTags.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggleTag(t.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Data Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Khách hàng</th>
              <th className="py-3 px-4">Số điện thoại</th>
              <th className="py-3 px-4">Nhãn phân loại</th>
              <th className="py-3 px-4">Tổng chi tiêu (LTV)</th>
              <th className="py-3 px-4">Tương tác cuối</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Đang nạp danh bạ khách hàng...
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                      <User className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Không tìm thấy khách hàng nào
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Hãy thử đổi từ khóa tìm kiếm hoặc bỏ bớt các nhãn tags đang lọc.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const initials = customer.customerName
                  ? customer.customerName
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'KH';

                const displayTags = customer.tags.slice(0, 3);
                const extraTagsCount = customer.tags.length - 3;

                return (
                  <tr
                    key={customer.id}
                    onClick={() => onSelectCustomer(customer)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Khách hàng (Avatar + Tên) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {customer.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            FB ID: {customer.customerFbId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Số điện thoại */}
                    <td className="py-3.5 px-4">
                      {customer.phoneNumber ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                          <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {customer.phoneNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa có SĐT</span>
                      )}
                    </td>

                    {/* Nhãn tags */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {displayTags.length > 0 ? (
                          displayTags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getTagColorClass(
                                tag
                              )}`}
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Không có tag</span>
                        )}
                        {extraTagsCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            +{extraTagsCount}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tổng chi tiêu (LTV) */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(customer.lifetimeValue)}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        {customer.totalOrders} đơn hàng
                      </div>
                    </td>

                    {/* Tương tác cuối */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(customer.lastInteractionAt)}
                    </td>

                    {/* Hành động */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCustomer(customer);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                        title="Xem chi tiết"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Hiển thị trang <strong className="text-slate-800 dark:text-slate-200">{pagination.page}</strong> / {pagination.totalPages} (Tổng cộng {pagination.total} khách hàng)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => onPageChange(pagination.page - 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onClick={() => onPageChange(pagination.page + 1)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Trang tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
