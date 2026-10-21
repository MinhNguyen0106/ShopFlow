'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Bot,
  Layers,
  Settings,
  Edit3,
  Gauge,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';

interface SidebarProps {
  unreadInboxCount?: number;
}

export function Sidebar({ unreadInboxCount = 18 }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Tổng quan',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      name: 'Hộp thư Live Chat',
      href: '/inbox',
      icon: MessageSquare,
      badge: unreadInboxCount,
      active: pathname.startsWith('/inbox'),
    },
    {
      name: 'Quản lý đơn hàng',
      href: '/orders',
      icon: ShoppingBag,
      active: pathname.startsWith('/orders'),
    },
    {
      name: 'Lịch đăng bài',
      href: '/posts',
      icon: Calendar,
      active: pathname.startsWith('/posts'),
    },
    {
      name: 'Kịch bản tự động hóa',
      href: '/automation',
      icon: Bot,
      active: pathname.startsWith('/automation'),
    },
    {
      name: 'Kết nối Fanpage',
      href: '/pages',
      icon: Layers,
      active: pathname.startsWith('/pages'),
    },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 select-none shrink-0">
      <div className="flex flex-col gap-5">
        {/* Brand & Logo */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  ShopFlow
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  VN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Pro E-commerce Suite
              </p>
            </div>
          </Link>
        </div>

        {/* Primary Action Button (CTA) */}
        <Link
          href="/posts/new"
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/20 hover:shadow-md transition-all duration-150 active:scale-[0.98]"
        >
          <Edit3 className="w-4 h-4" />
          <span>Soạn bài viết mới</span>
        </Link>

        {/* Navigation Items (Bo tròn Squircle) */}
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  item.active
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      item.active ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Meta Rate Limit & System Settings */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
        {/* Rate Limit Meta Gauge Widget */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <Gauge className="w-3.5 h-3.5 text-blue-600" />
              <span>Meta Graph API v19</span>
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-600">
              24%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[24%]" />
          </div>
          <p className="text-[10px] text-slate-400">
            Mức an toàn tuyệt đối (SLA &lt; 3.0s)
          </p>
        </div>

        {/* Settings link */}
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            pathname.startsWith('/settings')
              ? 'bg-blue-50 text-blue-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Cài đặt hệ thống</span>
        </Link>

        {/* Meta Business Partner Verified Badge */}
        <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] shrink-0">
            <CheckCircle2 className="w-4 h-4 text-[#1877F2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-slate-900 truncate">
              Meta Partner Verified
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              AES-256 Secured
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
