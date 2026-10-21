'use client';

/**
 * ShopFlow - Scheduled Posts Management Page
 * Route: /posts
 * File: frontend/src/app/(dashboard)/posts/page.tsx
 *
 * Màn hình quản lý danh sách bài viết đặt lịch và Calendar View (TASK-16).
 * Thiết kế theo phong cách macOS Clean Utility, hỗ trợ chuyển đổi List/Calendar và Realtime Socket.
 */

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  List as ListIcon,
  Plus,
  RefreshCw,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePostStore } from '@/lib/post.store';
import { usePageStore } from '@/lib/page.store';
import { useSocket } from '@/lib/useSocket';
import { PostsListView } from '@/components/posts/posts-list-view';
import { PostsCalendarView } from '@/components/posts/posts-calendar-view';
import { PostStatus } from '@/types/post';

const STATUS_TABS: Array<{ label: string; value: PostStatus | 'all'; dotColor?: string }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đã lên lịch', value: 'scheduled', dotColor: 'bg-sky-400' },
  { label: 'Đã xuất bản', value: 'published', dotColor: 'bg-emerald-400' },
  { label: 'Lỗi xuất bản', value: 'failed', dotColor: 'bg-rose-400' },
  { label: 'Đang xử lý', value: 'pending', dotColor: 'bg-amber-400' },
];

export default function PostsPage() {
  const {
    viewMode,
    setViewMode,
    selectedStatus,
    filterByStatus,
    selectedPageId,
    filterByPage,
    fetchPosts,
    isLoading,
    handlePostStatusChanged,
  } = usePostStore();

  const { pages, fetchPages } = usePageStore();
  const { onPostStatusChanged } = useSocket();

  // Khởi tạo tải danh sách fanpages và posts
  useEffect(() => {
    fetchPages();
    fetchPosts();
  }, [fetchPages, fetchPosts]);

  // Đăng ký nhận sự kiện WebSocket POST_STATUS_CHANGED từ máy chủ
  useEffect(() => {
    const unsubscribe = onPostStatusChanged((payload) => {
      handlePostStatusChanged(payload);
    });

    return () => {
      unsubscribe();
    };
  }, [onPostStatusChanged, handlePostStatusChanged]);

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Lịch Đăng Bài
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3" />
              Tự động hóa AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý kế hoạch nội dung, theo dõi hàng đợi hẹn giờ và điều phối xuất bản đa Fanpage.
          </p>
        </div>

        {/* Action Button: Create New Post */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPosts()}
            disabled={isLoading}
            data-testid="refresh-posts-btn"
            title="Làm mới danh sách"
            className="p-2.5 rounded-xl border border-border/50 bg-card/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/posts/new"
            data-testid="create-new-post-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo bài viết</span>
          </Link>
        </div>
      </div>

      {/* Control Bar: View Switcher, Fanpage Selector, Status Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-3 bg-card/50 border border-border/50 rounded-2xl backdrop-blur-md">
        {/* Left: View Switcher & Fanpage Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented View Switcher (macOS Pill Style) */}
          <div
            data-testid="view-switcher"
            className="inline-flex items-center p-1 rounded-xl bg-muted/40 border border-border/40"
          >
            <button
              onClick={() => setViewMode('list')}
              data-testid="view-mode-list-btn"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Dạng bảng</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              data-testid="view-mode-calendar-btn"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-background text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Lịch biểu</span>
            </button>
          </div>

          {/* Fanpage Selector Dropdown */}
          <div className="relative inline-flex items-center">
            <div className="absolute left-3 text-muted-foreground pointer-events-none">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedPageId}
              onChange={(e) => filterByPage(e.target.value)}
              data-testid="fanpage-selector"
              aria-label="Chọn Fanpage"
              className="pl-8 pr-8 py-1.5 rounded-xl border border-border/40 bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
            >
              <option value="all">Tất cả Fanpage</option>
              {pages.map((p) => (
                <option key={p.id} value={p.pageId}>
                  {p.pageName}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 text-muted-foreground pointer-events-none text-[10px]">
              ▼
            </div>
          </div>
        </div>

        {/* Right: Status Filter Tabs (chỉ áp dụng lọc trực tiếp trong Dạng bảng) */}
        {viewMode === 'list' && (
          <div
            data-testid="status-filter-tabs"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0"
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              Lọc:
            </span>
            {STATUS_TABS.map((tab) => {
              const isActive = selectedStatus === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => filterByStatus(tab.value)}
                  data-testid={`status-tab-${tab.value}`}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 font-semibold'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent'
                  }`}
                >
                  {tab.dotColor && (
                    <span className={`w-1.5 h-1.5 rounded-full ${tab.dotColor}`} />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="transition-all duration-200">
        {viewMode === 'list' ? <PostsListView /> : <PostsCalendarView />}
      </main>
    </div>
  );
}
