'use client';

/**
 * ShopFlow - Inbox Pane 1: Channels & Filter Selector
 * File: frontend/src/components/inbox/column-channels.tsx
 */

import React from 'react';
import { usePageStore } from '@/lib/page.store';
import { useInboxStore } from '@/lib/inbox.store';
import { ConversationType, ConversationStatus } from '@/types/inbox';

export function ColumnChannels() {
  const { pages, selectedPage, selectPage } = usePageStore();
  const { filters, setFilters, conversations } = useInboxStore();

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || c.unread_count || 0),
    0
  );

  const typeOptions: Array<{ label: string; value: ConversationType | undefined; icon: string }> = [
    { label: 'Tất cả kênh', value: undefined, icon: '⚡' },
    { label: 'Messenger', value: 'messenger', icon: '💬' },
    { label: 'Bình luận Post', value: 'comment_thread', icon: '📝' },
  ];

  const statusOptions: Array<{ label: string; value: ConversationStatus | undefined; badgeColor: string }> = [
    { label: 'Đang mở (Open)', value: 'open', badgeColor: 'bg-emerald-500' },
    { label: 'Đã xử lý (Resolved)', value: 'resolved', badgeColor: 'bg-blue-500' },
    { label: 'Lưu trữ (Archived)', value: 'archived', badgeColor: 'bg-slate-400' },
  ];

  return (
    <div className="flex h-full w-full flex-col border-r border-slate-200/80 bg-slate-50/70 p-3 select-none">
      {/* Header & Unread Counter */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <span className="text-xs font-bold tracking-tight text-slate-800 uppercase">Hộp Thư</span>
        </div>
        {totalUnread > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
            {totalUnread} mới
          </span>
        )}
      </div>

      {/* Fanpage Selector Dropdown */}
      <div className="mb-4">
        <label className="mb-1 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Chọn Fanpage
        </label>
        <div className="relative">
          <select
            value={filters.pageId || ''}
            onChange={(e) => {
              const val = e.target.value || undefined;
              setFilters({ pageId: val });
              const found = pages.find((p) => p.id === val) || null;
              selectPage(found);
            }}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">⚡ Tất cả Fanpage ({pages.length})</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.pageName || p.id} {p.isActive ? '●' : '○'}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Type Channel Filters */}
      <div className="mb-4">
        <label className="mb-1.5 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Kênh Hội Thoại
        </label>
        <div className="space-y-1">
          {typeOptions.map((opt) => {
            const isActive = filters.type === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => setFilters({ type: opt.value })}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-auto">
        <label className="mb-1.5 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Trạng Thái
        </label>
        <div className="space-y-1">
          {statusOptions.map((opt) => {
            const isActive = filters.status === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => setFilters({ status: opt.value })}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${opt.badgeColor}`} />
                  <span>{opt.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Connection & SLA Status Indicator */}
      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold text-emerald-800">WebSocket Live</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 font-medium">SLA &lt;3s</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>Meta Webhook v19.0</span>
          <span className="font-semibold text-emerald-700">AES-256</span>
        </div>
      </div>
    </div>
  );
}
