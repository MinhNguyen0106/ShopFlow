'use client';

/**
 * ShopFlow - Centralized Live Chat 4-Pane Bento Page (/inbox)
 * File: frontend/src/app/(dashboard)/inbox/page.tsx
 */

import React, { useEffect } from 'react';
import { ColumnChannels } from '@/components/inbox/column-channels';
import { ColumnThreads } from '@/components/inbox/column-threads';
import { ChatWindow } from '@/components/inbox/chat-window';
import { CustomerPanel } from '@/components/inbox/customer-panel';
import { useInboxStore } from '@/lib/inbox.store';
import { usePageStore } from '@/lib/page.store';
import { useSocket } from '@/lib/useSocket';

export default function InboxPage() {
  const { fetchConversations, handleSocketNewItem, handleSocketInboxUpdated } = useInboxStore();
  const { pages, selectedPage, fetchPages } = usePageStore();
  const { isConnected, joinPage, onNewInboxItem, onInboxUpdated } = useSocket();

  useEffect(() => {
    // Tải danh sách fanpages và danh sách hội thoại
    fetchPages();
    fetchConversations();
  }, [fetchPages, fetchConversations]);

  // Tự động tham gia phòng Socket của Fanpage đang chọn hoặc toàn bộ Fanpage
  useEffect(() => {
    if (!isConnected) return;
    if (selectedPage?.id) {
      joinPage(selectedPage.id);
    } else if (pages.length > 0) {
      pages.forEach((p) => joinPage(p.id));
    }
  }, [isConnected, selectedPage, pages, joinPage]);

  // Đăng ký nhận events realtime từ Socket.io trực tiếp
  useEffect(() => {
    const unsubNewItem = onNewInboxItem((data) => {
      handleSocketNewItem(data);
    });

    const unsubUpdated = onInboxUpdated((data) => {
      handleSocketInboxUpdated(data);
    });

    // Fallback cho window CustomEvents
    const handleNewItem = (e: CustomEvent) => {
      handleSocketNewItem(e.detail);
    };

    const handleUpdated = (e: CustomEvent) => {
      handleSocketInboxUpdated(e.detail);
    };

    window.addEventListener('socket:NEW_INBOX_ITEM' as never, handleNewItem as never);
    window.addEventListener('socket:INBOX_UPDATED' as never, handleUpdated as never);

    return () => {
      unsubNewItem();
      unsubUpdated();
      window.removeEventListener('socket:NEW_INBOX_ITEM' as never, handleNewItem as never);
      window.removeEventListener('socket:INBOX_UPDATED' as never, handleUpdated as never);
    };
  }, [onNewInboxItem, onInboxUpdated, handleSocketNewItem, handleSocketInboxUpdated]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-slate-100/60 font-sans">
      {/* Pane 1: Kênh & Bộ lọc */}
      <div className="h-full w-56 shrink-0 hidden md:block">
        <ColumnChannels />
      </div>

      {/* Pane 2: Danh sách hội thoại Realtime */}
      <div className="h-full w-72 lg:w-80 shrink-0">
        <ColumnThreads />
      </div>

      {/* Pane 3: Khung Chat & ShopFlow Shield */}
      <div className="h-full flex-1 min-w-0">
        <ChatWindow />
      </div>

      {/* Pane 4: CRM Khách Hàng & Trích Xuất Đơn Hàng AI */}
      <div className="h-full w-80 shrink-0 hidden xl:block">
        <CustomerPanel />
      </div>
    </div>
  );
}
