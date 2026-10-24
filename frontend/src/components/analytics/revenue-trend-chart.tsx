'use client';

import React, { useState, useId } from 'react';
import { useAnalyticsStore } from '../../lib/analytics.store';
import { TrendingUp, CreditCard, DollarSign } from 'lucide-react';

export function RevenueTrendChart() {
  const { revenueSeries, isLoading } = useAnalyticsStore();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [metricView, setMetricView] = useState<'revenue' | 'orders'>('revenue');

  const gradientId = useId();

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const data = revenueSeries.length > 0 ? revenueSeries : [];

  // Xác định giá trị cao nhất để tỷ lệ hóa tọa độ Y
  const maxValue = Math.max(
    ...data.map((d) => (metricView === 'revenue' ? d.revenue : d.ordersCount)),
    10
  );

  // Kích thước khung vẽ SVG
  const width = 700;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Tính tọa độ các điểm
  const points = data.map((d, index) => {
    const x =
      data.length > 1
        ? paddingX + (index / (data.length - 1)) * chartWidth
        : paddingX + chartWidth / 2;
    const value = metricView === 'revenue' ? d.revenue : d.ordersCount;
    const y = paddingY + chartHeight - (value / maxValue) * chartHeight;
    return { x, y, data: d };
  });

  // Tạo đường cong Bézier mượt mà (Smooth Cubic Bezier curve)
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${
          paddingY + chartHeight
        } Z`
      : '';

  // Xử lý di chuột tương tác tìm điểm gần nhất
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    let closestIdx = 0;
    let minDistance = Infinity;

    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoveredIdx(closestIdx);
  };

  const activePoint = hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : null;

  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Biểu Đồ Xu Hướng Doanh Thu & Đơn Hàng
            </h3>
            <span className="p-1 rounded-md bg-blue-50 text-blue-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Di chuyển chuột trên biểu đồ để xem chi tiết doanh số từng ngày
          </p>
        </div>

        {/* Chuyển đổi xem Doanh thu / Số đơn */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs">
          <button
            onClick={() => setMetricView('revenue')}
            className={`px-3 py-1 font-medium rounded-lg transition-all ${
              metricView === 'revenue'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doanh thu
          </button>
          <button
            onClick={() => setMetricView('orders')}
            className={`px-3 py-1 font-medium rounded-lg transition-all ${
              metricView === 'orders'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Số lượng đơn
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        {data.length === 0 || isLoading ? (
          <div className="h-60 flex flex-col items-center justify-center text-slate-400">
            <TrendingUp className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
            <p className="text-xs font-medium">
              {isLoading ? 'Đang nạp dữ liệu phân tích...' : 'Chưa có đơn hàng trong khoảng thời gian này'}
            </p>
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-56 sm:h-64 cursor-crosshair overflow-visible"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <defs>
                <linearGradient id={`fillGrad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines ngang */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingY + chartHeight * ratio;
                return (
                  <line
                    key={ratio}
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Vùng diện tích Gradient */}
              {areaPath && <path d={areaPath} fill={`url(#fillGrad-${gradientId})`} />}

              {/* Đường cong Bézier */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Nhãn ngày tháng trục X */}
              {points.map((p, i) => {
                // Hiển thị cách quãng nếu có nhiều điểm
                const shouldShow =
                  points.length <= 10 ||
                  i === 0 ||
                  i === points.length - 1 ||
                  i % Math.ceil(points.length / 7) === 0;

                if (!shouldShow) return null;

                return (
                  <text
                    key={i}
                    x={p.x}
                    y={height - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-medium select-none"
                  >
                    {p.data.formattedDate}
                  </text>
                );
              })}

              {/* Điểm active khi hover */}
              {activePoint && (
                <g>
                  {/* Đường thẳng đứng ngắm */}
                  <line
                    x1={activePoint.x}
                    y1={paddingY}
                    x2={activePoint.x}
                    y2={paddingY + chartHeight}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  {/* Vòng tròn hào quang */}
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="6"
                    fill="#3b82f6"
                    fillOpacity="0.3"
                  />
                  {/* Điểm tâm màu trắng viền xanh */}
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="4"
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                  />
                </g>
              )}
            </svg>

            {/* Tooltip nổi khi Hover */}
            {activePoint && (
              <div
                className="absolute pointer-events-none z-10 transition-all duration-75 transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(activePoint.x / width) * 100}%`,
                  top: `${(activePoint.y / height) * 100 - 8}%`,
                }}
              >
                <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700/60 min-w-[180px]">
                  <p className="text-[11px] font-semibold text-slate-300 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
                    <span>{activePoint.data.date}</span>
                    <span className="text-blue-400 font-bold">
                      {activePoint.data.ordersCount} đơn
                    </span>
                  </p>
                  <p className="text-sm font-bold text-white mb-2">
                    {formatVND(activePoint.data.revenue)}
                  </p>
                  <div className="space-y-1 text-[10px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-emerald-400">
                        <CreditCard className="w-3 h-3 mr-1" /> VietQR:
                      </span>
                      <span>{formatVND(activePoint.data.vietqrRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-amber-400">
                        <DollarSign className="w-3 h-3 mr-1" /> COD:
                      </span>
                      <span>{formatVND(activePoint.data.codRevenue)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Chart Footer Chú thích */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Doanh thu ngày</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Thanh toán VietQR</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Thu hộ COD</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">Múi giờ GMT+7 (Hà Nội)</span>
      </div>
    </div>
  );
}
