'use client';

import React from 'react';
import Link from 'next/link';
import {
  PenSquare,
  MessageSquare,
  Bot,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      id: 'new-post',
      title: 'Soạn Bài Viết Mới',
      description: 'Lên lịch xuất bản, chọn album & gợi ý khung giờ vàng',
      href: '/posts/new',
      icon: PenSquare,
      badge: 'Giờ vàng 🔥',
      gradient: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'inbox',
      title: 'Hộp Thư Live Chat',
      description: 'Hộp thư 4-Pane Bento tập trung tin nhắn & bình luận',
      href: '/inbox',
      icon: MessageSquare,
      badge: 'Realtime SLA',
      gradient: 'from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'automation',
      title: 'Kịch Bản Tự Động & Ẩn SĐT',
      description: 'Cấu hình từ khóa trả lời tự động và ẩn SĐT < 3s',
      href: '/automation',
      icon: Bot,
      badge: 'Chống cướp đơn',
      gradient: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'pages',
      title: 'Quản Lý Fanpage',
      description: 'Kết nối Meta OAuth 2.0, cấp token & giám sát Webhook',
      href: '/pages',
      icon: Layers,
      badge: 'Meta Partner',
      gradient: 'from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Lối Tắt Thao Tác Nhanh</span>
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Chuyển hướng tức thì đến các nghiệp vụ chính
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.id}
              href={act.href}
              className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${act.iconBg} group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                      {act.badge}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  Mở ngay &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
