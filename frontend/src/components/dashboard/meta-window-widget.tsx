'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, AlertTriangle, ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { MetaWindowLead } from '@/types/dashboard';

interface MetaWindowWidgetProps {
  leads?: MetaWindowLead[];
}

export const DEFAULT_META_LEADS: MetaWindowLead[] = [
  {
    id: 'lead_1',
    customerName: 'Hoàng Yến Chi',
    customerAvatar: '',
    phone: '0988776655',
    lastMessage: 'Shop ơi check tin nhắn tư vấn size áo khoác giúp mình với...',
    remainingMinutes: 32,
    pageName: 'Shop Thời Trang Nữ Cao Cấp',
    isUrgent: true,
  },
  {
    id: 'lead_2',
    customerName: 'Trần Văn Minh',
    customerAvatar: '',
    phone: '0912345678',
    lastMessage: 'Đơn hàng của mình từ hôm qua đã gửi chưa shop?',
    remainingMinutes: 75,
    pageName: 'Shop Thời Trang Nữ Cao Cấp',
    isUrgent: false,
  },
  {
    id: 'lead_3',
    customerName: 'Nguyễn Thị Bích Ngọc',
    customerAvatar: '',
    phone: '0909998877',
    lastMessage: 'Set son dưỡng còn màu cam đất không ạ?',
    remainingMinutes: 160,
    pageName: 'Tiệm Mỹ Phẩm Sài Gòn',
    isUrgent: false,
  },
];

export function MetaWindowWidget({ leads = DEFAULT_META_LEADS }: MetaWindowWidgetProps) {
  const formatRemainingTime = (minutes: number) => {
    if (minutes <= 60) {
      return `${minutes} phút`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}p` : `${h} giờ`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Cảnh Báo Cửa Sổ 24h Meta
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                  {leads.filter((l) => l.isUrgent).length} Gấp
                </span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Khách hàng cần phản hồi trước khi cửa sổ gửi tin đóng lại
              </p>
            </div>
          </div>
          <Link
            href="/inbox"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            Hộp thư <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {leads.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Không có hội thoại nào sắp hết hạn
            </p>
            <p className="text-[11px] text-slate-400">
              Toàn bộ khách hàng đều đã được phản hồi trong thời gian hợp lệ.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold">
                    {lead.customerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {lead.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        • {lead.pageName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {lead.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      lead.isUrgent
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Còn {formatRemainingTime(lead.remainingMinutes)}
                  </span>
                  <Link
                    href="/inbox"
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    Chat ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span>Quy chuẩn Meta: Sau 24h chỉ được gửi 1 lần Message Tag được duyệt</span>
        <Link href="/inbox" className="text-blue-600 dark:text-blue-400 hover:underline">
          Xem tất cả ({leads.length})
        </Link>
      </div>
    </div>
  );
}
