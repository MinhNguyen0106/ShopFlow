'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Phone, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { maskPhoneNumber } from '@/types/dashboard';

export interface HotLeadItem {
  id: string;
  customerName: string;
  phone: string;
  productInterest: string;
  orderValueEstimate: string;
  pageName: string;
  status: 'new' | 'consulting' | 'ready_to_buy';
}

export const DEFAULT_HOT_LEADS: HotLeadItem[] = [
  {
    id: 'hl_1',
    customerName: 'Lê Thu Hương',
    phone: '0988654321',
    productInterest: 'Áo khoác dạ nữ 2 lớp dáng dài (Màu be - Size L)',
    orderValueEstimate: '650.000đ',
    pageName: 'Shop Thời Trang Nữ Cao Cấp',
    status: 'ready_to_buy',
  },
  {
    id: 'hl_2',
    customerName: 'Phạm Quốc Bảo',
    phone: '0912987654',
    productInterest: 'Bộ dưỡng da phục hồi B5 + Serum Vitamin C',
    orderValueEstimate: '820.000đ',
    pageName: 'Tiệm Mỹ Phẩm Sài Gòn',
    status: 'ready_to_buy',
  },
  {
    id: 'hl_3',
    customerName: 'Đặng Mai Phương',
    phone: '0903112233',
    productInterest: '2 Váy đầm xòe cổ vest công sở',
    orderValueEstimate: '590.000đ',
    pageName: 'Shop Thời Trang Nữ Cao Cấp',
    status: 'consulting',
  },
];

interface HotLeadsWidgetProps {
  leads?: HotLeadItem[];
}

export function HotLeadsWidget({ leads = DEFAULT_HOT_LEADS }: HotLeadsWidgetProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Hot Leads Cần Chốt Đơn Gấp
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  PII Masked
                </span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Khách hàng đã cung cấp số điện thoại hoặc yêu cầu báo giá
              </p>
            </div>
          </div>
          <Link
            href="/inbox"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            Tất cả leads <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {lead.customerName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200/50">
                    <Phone className="h-2.5 w-2.5" />
                    {maskPhoneNumber(lead.phone)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {lead.productInterest}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {lead.orderValueEstimate}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Sẵn sàng chốt
                  </span>
                </div>
                <Link
                  href="/inbox"
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Chốt ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <UserCheck className="h-3 w-3 text-emerald-500" />
          <span>Số điện thoại được che ký tự bảo vệ chống cướp khách</span>
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Dự kiến: 2.060.000đ
        </span>
      </div>
    </div>
  );
}
