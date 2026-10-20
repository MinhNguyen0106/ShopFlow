'use client';

/**
 * ShopFlow - Inbox Pane 2: Conversation Threads List
 * File: frontend/src/components/inbox/column-threads.tsx
 */

import React, { useState } from 'react';
import { useInboxStore } from '@/lib/inbox.store';
import { ConversationItem } from '@/types/inbox';

export function ColumnThreads() {
  const {
    conversations,
    selectedConversation,
    selectConversation,
    isLoadingConversations,
    setFilters,
    filters,
  } = useInboxStore();

  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchInput.trim() || undefined });
  };

  /**
   * Tính toán thời gian còn lại của Cửa sổ 24h Meta
   */
  const renderMeta24hWindow = (conv: ConversationItem) => {
    if (conv.type !== 'messenger') {
      return (
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
          Post Comment
        </span>
      );
    }

    const expiresAt = conv.window24hExpiresAt || conv.window_24h_expires_at;
    if (!expiresAt) {
      return (
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
          Không giới hạn
        </span>
      );
    }

    const diffMs = new Date(expiresAt).getTime() - Date.now();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs <= 0) {
      return (
        <span className="flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600 border border-rose-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          Hết 24h Meta
        </span>
      );
    }

    if (diffHours < 2) {
      return (
        <span className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200/60 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Còn {diffHours > 0 ? `${diffHours}h ` : ''}{diffMins}p
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/60">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Cửa sổ 24h: {diffHours}h
      </span>
    );
  };

  return (
    <div className="flex h-full w-full flex-col border-r border-slate-200/80 bg-white">
      {/* Search Header */}
      <div className="border-b border-slate-100 p-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm tên, SĐT, nội dung..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {isLoadingConversations ? (
          <div className="flex h-40 items-center justify-center text-xs text-slate-400">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            Đang tải hội thoại...
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-2 text-3xl">📭</div>
            <p className="text-xs font-semibold text-slate-700">Chưa có hội thoại nào</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Tin nhắn hoặc bình luận mới từ khách hàng sẽ xuất hiện tự động tại đây.
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = selectedConversation?.id === conv.id;
            const unread = conv.unreadCount || conv.unread_count || 0;
            const customerName =
              conv.customer?.customerName ||
              conv.customer?.customer_name ||
              `Khách hàng #${conv.customer?.customerFbId?.slice(-4) || 'FB'}`;
            const phone = conv.customer?.phoneNumber || conv.customer?.phone_number;
            const hasPhone = Boolean(phone);
            const tags = conv.customer?.tags || [];

            return (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`relative flex cursor-pointer flex-col p-3 transition-colors ${
                  isSelected
                    ? 'bg-emerald-50/60 border-l-3 border-emerald-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Row 1: Name, Channel Icon, Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-xs">
                      {conv.type === 'messenger' ? '💬' : '📝'}
                    </span>
                    <span
                      className={`truncate text-xs font-semibold ${
                        unread > 0 ? 'text-slate-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {customerName}
                    </span>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-400 font-mono">
                    {conv.lastMessageAt || conv.last_message_at
                      ? new Date(conv.lastMessageAt || conv.last_message_at || '').toLocaleTimeString(
                          'vi-VN',
                          { hour: '2-digit', minute: '2-digit' }
                        )
                      : ''}
                  </span>
                </div>

                {/* Row 2: Last Message Snippet */}
                <p
                  className={`mt-1 line-clamp-1 text-[11px] ${
                    unread > 0 ? 'font-semibold text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {conv.lastMessageText || conv.last_message_text || '(Chưa có nội dung tin nhắn)'}
                </p>

                {/* Row 3: Meta 24h Window & Badges */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {renderMeta24hWindow(conv)}

                  {/* Shield Protected Phone Badge */}
                  {hasPhone && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 border border-indigo-200/60">
                      🛡️ Đã ẩn SĐT
                    </span>
                  )}

                  {/* Customer Tags */}
                  {tags.slice(0, 1).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}

                  {/* Unread Counter Pill */}
                  {unread > 0 && (
                    <span className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-xs">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
