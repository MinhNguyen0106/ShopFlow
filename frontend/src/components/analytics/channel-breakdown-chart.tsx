'use client';

import React from 'react';
import { useAnalyticsStore } from '../../lib/analytics.store';
import { MessageSquare, MessagesSquare, PenTool, CheckCircle, XCircle } from 'lucide-react';

export function ChannelBreakdownChart() {
  const { channelBreakdown, isLoading } = useAnalyticsStore();

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const totalRevenue = channelBreakdown.reduce((sum, c) => sum + c.revenue, 0);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'facebook_comment':
        return MessagesSquare;
      case 'facebook_inbox':
        return MessageSquare;
      default:
        return PenTool;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'facebook_comment':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-100',
          bar: 'bg-blue-500',
        };
      case 'facebook_inbox':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-600',
          border: 'border-indigo-100',
          bar: 'bg-indigo-500',
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-600',
          border: 'border-slate-200',
          bar: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Phân Rã Nguồn Đơn Hàng
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh tỷ lệ chốt đơn giữa Bình luận, Messenger và Tạo tay
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            3 Kênh
          </span>
        </div>

        {/* Thanh phân bổ tỷ lệ doanh thu ngang (Stacked Horizontal Bar) */}
        {totalRevenue > 0 && (
          <div className="mb-5">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              {channelBreakdown.map((c) => {
                const percent = Math.round((c.revenue / totalRevenue) * 100);
                if (percent === 0) return null;
                const colors = getChannelColor(c.channel);
                return (
                  <div
                    key={c.channel}
                    style={{ width: `${percent}%` }}
                    className={`${colors.bar} h-full transition-all duration-500`}
                    title={`${c.channelName}: ${percent}%`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-400">
              <span>0%</span>
              <span>Tổng doanh thu: {formatVND(totalRevenue)}</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Danh sách thẻ chi tiết từng kênh */}
        {channelBreakdown.length === 0 || isLoading ? (
          <div className="h-44 flex flex-col items-center justify-center text-slate-400">
            <MessagesSquare className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
            <p className="text-xs font-medium">
              {isLoading ? 'Đang phân tích dữ liệu kênh...' : 'Chưa có dữ liệu kênh bán hàng'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {channelBreakdown.map((item) => {
              const Icon = getChannelIcon(item.channel);
              const colors = getChannelColor(item.channel);
              const sharePercent =
                totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 1000) / 10 : 0;

              return (
                <div
                  key={item.channel}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{item.channelName}</h4>
                        <p className="text-[11px] text-slate-400">{item.ordersCount} đơn hàng</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">{formatVND(item.revenue)}</p>
                      <span className="text-[11px] font-semibold text-blue-600">
                        {sharePercent}% doanh thu
                      </span>
                    </div>
                  </div>

                  {/* Tỷ lệ hoàn tất & Tỷ lệ hủy */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    <div className="flex items-center space-x-1 text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Thành công: <strong>{item.successRate}%</strong></span>
                    </div>
                    <div className="flex items-center space-x-1 text-rose-500">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Đã hủy: <strong>{item.cancelRate}%</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Tự động phân loại qua Webhook Meta & Manual Form</span>
      </div>
    </div>
  );
}
