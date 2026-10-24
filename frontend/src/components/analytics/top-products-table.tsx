'use client';

import React from 'react';
import { useAnalyticsStore } from '../../lib/analytics.store';
import { Package, Trophy, Sparkles } from 'lucide-react';

export function TopProductsTable() {
  const { topProducts, isLoading } = useAnalyticsStore();

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center border border-amber-300">
          1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center border border-slate-300">
          2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-900 font-bold text-[10px] flex items-center justify-center border border-amber-200">
          3
        </span>
      );
    }
    return (
      <span className="w-5 h-5 text-slate-400 font-semibold text-xs flex items-center justify-center">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Top Sản Phẩm Bán Chạy Nhất
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xếp hạng theo tổng doanh thu và số lượng bán trong kỳ
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Top 10</span>
          </span>
        </div>

        {topProducts.length === 0 || isLoading ? (
          <div className="h-56 flex flex-col items-center justify-center text-slate-400">
            <Package className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
            <p className="text-xs font-medium">
              {isLoading ? 'Đang tải bảng xếp hạng...' : 'Chưa có dữ liệu sản phẩm trong kỳ'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-2.5 pl-1 w-8">#</th>
                  <th className="pb-2.5">Sản phẩm</th>
                  <th className="pb-2.5 text-center">Đã bán</th>
                  <th className="pb-2.5 text-right">Doanh thu</th>
                  <th className="pb-2.5 pr-1 w-24 text-right">Đóng góp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {topProducts.map((p, idx) => (
                  <tr
                    key={p.sku + idx}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="py-2.5 pl-1">{getRankBadge(idx)}</td>
                    <td className="py-2.5">
                      <div className="flex items-center space-x-2.5">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.productName}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {p.productName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-700">
                      {p.totalQuantitySold}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      {formatVND(p.totalRevenue)}
                    </td>
                    <td className="py-2.5 pr-1 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(p.revenuePercentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 w-7">
                          {p.revenuePercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Tự động cập nhật theo các đơn hàng hoàn tất & xác nhận</span>
      </div>
    </div>
  );
}
