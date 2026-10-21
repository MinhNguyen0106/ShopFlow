'use client';

import React, { useState } from 'react';
import { Flame, BarChart3, TrendingUp } from 'lucide-react';
import { HourlyTrafficPoint } from '@/types/dashboard';

interface TrafficChartProps {
  data?: HourlyTrafficPoint[];
}

export const DEFAULT_HOURLY_TRAFFIC: HourlyTrafficPoint[] = [
  { hour: '08:00', label: '8h', interactions: 24 },
  { hour: '09:00', label: '9h', interactions: 45 },
  { hour: '10:00', label: '10h', interactions: 68 },
  { hour: '11:00', label: '11h', interactions: 110, isGoldenHour: true, goldenHourLabel: 'Đỉnh trưa 11:30' },
  { hour: '12:00', label: '12h', interactions: 165, isGoldenHour: true, goldenHourLabel: 'Đỉnh trưa (Cao điểm)' },
  { hour: '13:00', label: '13h', interactions: 130, isGoldenHour: true, goldenHourLabel: 'Đỉnh trưa 13:00' },
  { hour: '14:00', label: '14h', interactions: 58 },
  { hour: '15:00', label: '15h', interactions: 72 },
  { hour: '16:00', label: '16h', interactions: 85 },
  { hour: '17:00', label: '17h', interactions: 95 },
  { hour: '18:00', label: '18h', interactions: 120 },
  { hour: '19:00', label: '19h', interactions: 175 },
  { hour: '20:00', label: '20h', interactions: 240, isGoldenHour: true, goldenHourLabel: 'Đỉnh tối (Hot nhất 20:00)' },
  { hour: '21:00', label: '21h', interactions: 215, isGoldenHour: true, goldenHourLabel: 'Đỉnh tối 21:00' },
  { hour: '22:00', label: '22h', interactions: 110 },
];

export function TrafficChart({ data = DEFAULT_HOURLY_TRAFFIC }: TrafficChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<HourlyTrafficPoint | null>(null);

  const maxVal = Math.max(...data.map((d) => d.interactions), 1);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Lưu Lượng Tương Tác Thời Gian Thực
            </h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Mật độ bình luận & tin nhắn theo khung giờ trong ngày (08:00 - 22:00)
          </p>
        </div>

        {/* Golden Hour Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
            <Flame className="h-3.5 w-3.5" />
            <span>Khung Giờ Vàng (11:30 & 20:00)</span>
          </div>
        </div>
      </div>

      {/* SVG & CSS Bar Visualizer */}
      <div className="relative pt-6 pb-2">
        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs shadow-lg flex items-center gap-2 pointer-events-none transition-all duration-150 animate-in fade-in"
          >
            <span className="font-bold">{hoveredPoint.hour}:</span>
            <span>{hoveredPoint.interactions} tương tác</span>
            {hoveredPoint.isGoldenHour && (
              <span className="text-amber-400 dark:text-amber-600 font-bold flex items-center gap-0.5">
                🔥 {hoveredPoint.goldenHourLabel || 'Giờ vàng'}
              </span>
            )}
          </div>
        )}

        {/* Bars Container */}
        <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-44 px-1">
          {data.map((point, index) => {
            const heightPercent = Math.round((point.interactions / maxVal) * 100);
            const isHovered = hoveredPoint?.hour === point.hour;

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
              >
                {/* Bar */}
                <div className="w-full flex justify-center items-end h-full">
                  <div
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-200 ${
                      point.isGoldenHour
                        ? 'bg-gradient-to-t from-amber-500 to-orange-400 group-hover:from-amber-600 group-hover:to-orange-500 shadow-xs shadow-amber-500/20'
                        : 'bg-slate-200 dark:bg-slate-700/60 group-hover:bg-blue-500 dark:group-hover:bg-blue-600'
                    } ${isHovered ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900' : ''}`}
                  />
                </div>

                {/* Hour Label */}
                <span
                  className={`mt-2 text-[10px] font-medium transition-colors ${
                    point.isGoldenHour
                      ? 'text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`}
                >
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span>Lưu lượng trung bình đạt đỉnh lúc 20:00 (240 tương tác/giờ)</span>
        </span>
        <span className="hidden sm:inline">Cập nhật tự động mỗi 60 giây</span>
      </div>
    </div>
  );
}
