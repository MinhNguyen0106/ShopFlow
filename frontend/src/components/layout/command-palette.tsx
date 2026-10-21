'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Bot,
  Layers,
  Settings,
  PlusCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { usePageStore } from '@/lib/page.store';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { pages, selectPage } = usePageStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationItems = [
    {
      title: 'Tổng quan hệ thống',
      desc: 'Bảng điều khiển KPIs và phân tích',
      icon: LayoutDashboard,
      href: '/',
    },
    {
      title: 'Hộp thư Live Chat',
      desc: 'Xem và phản hồi tin nhắn, bình luận',
      icon: MessageSquare,
      href: '/inbox',
    },
    {
      title: 'Lịch đăng bài',
      desc: 'Quản lý lịch hẹn giờ xuất bản bài viết',
      icon: Calendar,
      href: '/posts',
    },
    {
      title: 'Soạn bài viết mới',
      desc: 'Tạo bài đăng mới với trợ lý AI',
      icon: PlusCircle,
      href: '/posts/new',
    },
    {
      title: 'Kịch bản tự động hóa',
      desc: 'Cấu hình Bot tự động và khiên ẩn SĐT',
      icon: Bot,
      href: '/automation',
    },
    {
      title: 'Quản lý Fanpage kết nối',
      desc: 'Thêm và cấu hình kênh Meta Facebook',
      icon: Layers,
      href: '/pages',
    },
    {
      title: 'Cài đặt hệ thống',
      desc: 'Quản lý tài khoản và tích hợp Meta',
      icon: Settings,
      href: '/settings',
    },
  ];

  const filteredNav = navigationItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPages = pages.filter((page) =>
    page.pageName.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleSelectPage = (page: (typeof pages)[0]) => {
    selectPage(page);
    onClose();
    router.push('/inbox');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm màn hình, Fanpage, tác vụ nhanh (⌘K)..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-500">
            ESC
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {/* Section: Navigation */}
          {filteredNav.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Điều hướng nhanh
              </div>
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 group-hover:text-blue-700">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 group-hover:text-blue-500">
                        {item.desc}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Section: Connected Fanpages */}
          {filteredPages.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Kênh Fanpage ({filteredPages.length})
              </div>
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPage(page)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {(page.pageName || 'P').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 group-hover:text-blue-700">
                        {page.pageName || 'Fanpage'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        ID: {page.pageId}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    Vào hộp thư →
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredNav.length === 0 && filteredPages.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">
              Không tìm thấy kết quả nào cho &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
