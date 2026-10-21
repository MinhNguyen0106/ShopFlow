'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronDown,
  Plus,
  Bell,
  Activity,
  LogOut,
  User as UserIcon,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth.store';
import { usePageStore, ConnectedPage } from '@/lib/page.store';

interface TopbarProps {
  onOpenCommandPalette: () => void;
}

export function Topbar({ onOpenCommandPalette }: TopbarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { pages, selectedPage, selectPage } = usePageStore();

  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleSelectPage = (page: ConnectedPage | null) => {
    selectPage(page);
    setIsPageDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between select-none">
      {/* Left: Quick Search Spotlight Trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 h-9 w-48 sm:w-72 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/60 border border-slate-200/60 text-slate-500 text-xs sm:text-sm transition-all focus:outline-none"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-left truncate">
            Tìm kiếm Fanpage, ID (⌘K)...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white text-slate-500 shadow-xs border border-slate-200">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Page Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
            className="flex items-center gap-2 h-9 px-3 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 text-xs font-medium text-slate-800 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="max-w-[130px] sm:max-w-[180px] truncate">
              {selectedPage ? selectedPage.pageName : 'Tất cả kênh (' + pages.length + ' Page)'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isPageDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Chọn kênh làm việc
              </div>
              <button
                type="button"
                onClick={() => handleSelectPage(null)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  selectedPage === null
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                    All
                  </div>
                  <span>Tất cả kênh ({pages.length} Fanpage)</span>
                </div>
                {selectedPage === null && <Check className="w-3.5 h-3.5" />}
              </button>

              <div className="my-1 border-t border-slate-100" />

              <div className="max-h-48 overflow-y-auto">
                {pages.map((p) => {
                  const isSelected = selectedPage?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPage(p)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          {(p.pageName || 'P').charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{p.pageName || 'Fanpage'}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-1.5 border-t border-slate-100">
                <Link
                  href="/pages"
                  onClick={() => setIsPageDropdownOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quản lý Fanpage kết nối</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA: Soạn bài mới */}
        <Link
          href="/posts/new"
          className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Soạn bài mới</span>
        </Link>

        {/* Sensor & Health Status */}
        <div
          title="Meta Graph API v19.0: Hoạt động bình thường"
          className="hidden md:flex items-center gap-1 h-9 px-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-500 text-xs"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-mono text-[11px] text-emerald-600 font-semibold">
            API 24%
          </span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          title="Thông báo"
          className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-700 max-w-[90px] truncate">
              {user?.fullName || 'Tài khoản'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {user?.fullName || 'Người dùng'}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {user?.email}
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cài đặt tài khoản</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
