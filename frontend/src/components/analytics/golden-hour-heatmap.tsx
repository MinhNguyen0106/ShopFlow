'use client';

import React, { useState } from 'react';
import { useAnalyticsStore } from '../../lib/analytics.store';
import { HeatmapCell, DAY_NAMES } from '../../types/analytics';
import { Flame, Clock, Sparkles } from 'lucide-react';

export function GoldenHourHeatmap() {
  const { heatmap, isLoading } = useAnalyticsStore();
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  // Xác định số đơn lớn nhất để định mức màu nhiệt
  const maxOrderCount = Math.max(...heatmap.map((c) => c.orderCount), 1);

  const getHeatmapColor = (cell: HeatmapCell) => {
    if (cell.orderCount === 0) {
      return cell.isGoldenHour
        ? 'bg-amber-50/60 border border-amber-200/50'
        : 'bg-slate-100/70 border border-slate-200/30';
    }

    const intensity = cell.orderCount / maxOrderCount;

    if (intensity < 0.25) {
      return 'bg-blue-100 border border-blue-200 text-blue-800';
    }
    if (intensity < 0.5) {
      return 'bg-blue-300 border border-blue-400 text-blue-900 font-semibold';
    }
    if (intensity < 0.75) {
      return 'bg-blue-500 border border-blue-600 text-white font-bold';
    }
    return 'bg-indigo-600 border border-indigo-700 text-white font-bold shadow-sm';
  };

  // Sắp xếp thứ tự các ngày trong tuần: Thứ 2 (1) -> Thứ 7 (6) -> Chủ Nhật (0)
  const displayDays = [1, 2, 3, 4, 5, 6, 0];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Bản Đồ Nhiệt Khung Giờ Vàng Chốt Đơn
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mật độ đơn hàng theo 24 giờ trong ngày x 7 ngày trong tuần
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Đỉnh giờ vàng: 11h-13h & 20h-22h</span>
            </span>
          </div>
        </div>

        {heatmap.length === 0 || isLoading ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-400">
            <Clock className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
            <p className="text-xs font-medium">
              {isLoading ? 'Đang tạo ma trận nhiệt...' : 'Chưa có dữ liệu chốt đơn'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[620px]">
              {/* Tiêu đề các mốc giờ trên cùng */}
              <div className="grid grid-cols-[64px_repeat(24,1fr)] gap-1 mb-1.5 text-[10px] text-slate-400 font-medium text-center">
                <span className="text-left pl-1">Thứ</span>
                {hours.map((h) => {
                  const isPeak = (h >= 11 && h <= 12) || (h >= 20 && h <= 21);
                  return (
                    <span
                      key={h}
                      className={isPeak ? 'font-bold text-amber-600' : ''}
                      title={`Khung giờ ${h}:00 - ${h + 1}:00`}
                    >
                      {h % 3 === 0 || isPeak ? `${h}h` : ''}
                    </span>
                  );
                })}
              </div>

              {/* Lưới 7 hàng x 24 ô */}
              <div className="space-y-1">
                {displayDays.map((dayIdx) => {
                  return (
                    <div
                      key={dayIdx}
                      className="grid grid-cols-[64px_repeat(24,1fr)] gap-1 items-center"
                    >
                      {/* Tên thứ trong tuần */}
                      <span className="text-[11px] font-semibold text-slate-600 truncate pl-1">
                        {DAY_NAMES[dayIdx]}
                      </span>

                      {/* 24 ô tương ứng 24 giờ */}
                      {hours.map((hour) => {
                        const cell = heatmap.find(
                          (c) => c.dayOfWeek === dayIdx && c.hour === hour
                        ) || {
                          dayOfWeek: dayIdx,
                          dayLabel: DAY_NAMES[dayIdx],
                          hour,
                          hourLabel: `${hour}:00`,
                          orderCount: 0,
                          totalAmount: 0,
                          isGoldenHour:
                            (hour >= 11 && hour <= 12) || (hour >= 20 && hour <= 21),
                        };

                        return (
                          <div
                            key={hour}
                            onMouseEnter={() => setHoveredCell(cell)}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`h-6 rounded-md flex items-center justify-center text-[10px] cursor-pointer transition-all hover:scale-110 hover:z-20 ${getHeatmapColor(
                              cell
                            )}`}
                          >
                            {cell.orderCount > 0 ? cell.orderCount : ''}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Chú thích dải màu & Tooltip */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400">Mức độ chốt đơn:</span>
          <div className="flex items-center space-x-1 text-[10px]">
            <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" title="0 đơn" />
            <span className="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-200" title="Thấp" />
            <span className="w-3.5 h-3.5 rounded bg-blue-300 border border-blue-400" title="Trung bình" />
            <span className="w-3.5 h-3.5 rounded bg-blue-500 text-white" title="Cao" />
            <span className="w-3.5 h-3.5 rounded bg-indigo-600 text-white" title="Rất cao" />
          </div>
        </div>

        {/* Thông tin ô đang hover */}
        {hoveredCell ? (
          <div className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center space-x-1.5 animate-fadeIn">
            <span>
              {hoveredCell.dayLabel}, {hoveredCell.hourLabel}:
            </span>
            <span className="text-blue-600 font-bold">{hoveredCell.orderCount} đơn</span>
            <span>({formatVND(hoveredCell.totalAmount)})</span>
            {hoveredCell.isGoldenHour && (
              <span className="text-amber-600 font-bold ml-1">★ Giờ vàng</span>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">
            Rà chuột qua từng ô để xem chi tiết số đơn & doanh số
          </span>
        )}
      </div>
    </div>
  );
}
