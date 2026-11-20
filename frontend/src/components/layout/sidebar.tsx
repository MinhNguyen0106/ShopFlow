'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useInboxStore } from '@/lib/inbox.store';
import {
  Zap,
  MessageSquare,
  Calendar,
  Bot,
  Layers,
  Settings,
  Edit3,
  ShoppingBag,
  BarChart3,
  Users,
} from 'lucide-react';

interface SidebarProps {
  unreadInboxCount?: number;
}

export function Sidebar({ unreadInboxCount }: SidebarProps) {
  const pathname = usePathname();
  const conversations = useInboxStore((state) => state.conversations);

  const dynamicUnread = React.useMemo(() => {
    return conversations.reduce(
      (acc, c) => acc + (c.unreadCount || c.unread_count || 0),
      0
    );
  }, [conversations]);

  const effectiveBadge =
    unreadInboxCount !== undefined
      ? unreadInboxCount > 0
        ? unreadInboxCount
        : undefined
      : dynamicUnread > 0
        ? dynamicUnread
        : undefined;

  const navigation = [
    {
      name: 'Báo cáo phân tích',
      href: '/analytics',
      icon: BarChart3,
      active: pathname.startsWith('/analytics'),
    },
    {
      name: 'Hộp thư Live Chat',
      href: '/inbox',
      icon: MessageSquare,
      badge: effectiveBadge,
      active: pathname.startsWith('/inbox'),
    },
    {
      name: 'Quản lý đơn hàng',
      href: '/orders',
      icon: ShoppingBag,
      active: pathname.startsWith('/orders'),
    },
    {
      name: 'Khách hàng & Leads',
      href: '/customers',
      icon: Users,
      active: pathname.startsWith('/customers'),
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
    {
      name: 'Cài đặt hệ thống',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
    },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col p-4 select-none shrink-0 overflow-y-auto">
      <div className="flex flex-col gap-5">
        {/* Brand & Logo */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <Link href="/analytics" className="flex items-center gap-3 group">
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
    </aside>
  );
}
