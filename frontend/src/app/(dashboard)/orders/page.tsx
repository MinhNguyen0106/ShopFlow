'use client';

/**
 * ShopFlow - Orders & Waybill Management Page
 * Route: /orders
 * File: frontend/src/app/(dashboard)/orders/page.tsx
 *
 * Màn hình Giao Diện Quản Lý Đơn Hàng & Vận Đơn (TASK-22).
 * Phong cách thiết kế macOS Clean Utility, Bento grid metrics, Real-time WebSocket sync.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  ShoppingBag,
  RefreshCw,
  Layers,
  Sparkles,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { usePageStore } from '@/lib/page.store';
import { useOrderStore } from '@/lib/order.store';
import { getSocket } from '@/lib/socket';
import { OrderMetrics } from '@/components/orders/order-metrics';
import { OrderTable } from '@/components/orders/order-table';
import { OrderDetailDrawer } from '@/components/orders/order-detail-drawer';
import { OrderPrintModal } from '@/components/orders/order-print-modal';
import { Order, OrderStatus } from '@/types/order';

export default function OrdersPage() {
  const { pages, selectedPage, fetchPages, selectPage } = usePageStore();
  const {
    orders,
    selectedOrder,
    metrics,
    filters,
    pagination,
    isLoading,
    isUpdating,
    error,
    fetchOrders,
    selectOrder,
    setStatusFilter,
    setSearchQuery,
    setPage,
    updateOrderStatus,
    handleSocketStatusUpdate,
    handleSocketNewOrder,
    clearError,
  } = useOrderStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printTargetOrder, setPrintTargetOrder] = useState<Order | null>(null);

  // 1. Initial Page Fetch
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // 2. Default to first active page if not selected
  useEffect(() => {
    if (!selectedPage && pages.length > 0) {
      const active = pages.find((p) => p.isActive) || pages[0];
      selectPage(active);
    }
  }, [selectedPage, pages, selectPage]);

  // 3. Fetch Orders when selectedPage changes
  const activePageId = selectedPage?.id;
  useEffect(() => {
    if (activePageId) {
      fetchOrders(activePageId);
    }
  }, [activePageId, fetchOrders]);

  // 4. WebSocket Real-time Listener Registration
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const onStatusChanged = (payload: { orderId: string; status: OrderStatus; updatedAt?: string }) => {
      handleSocketStatusUpdate(payload);
    };

    const onNewOrder = (payload: unknown) => {
      handleSocketNewOrder(payload);
    };

    socket.on('ORDER_STATUS_CHANGED', onStatusChanged);
    socket.on('NEW_ORDER_CREATED', onNewOrder);

    return () => {
      socket.off('ORDER_STATUS_CHANGED', onStatusChanged);
      socket.off('NEW_ORDER_CREATED', onNewOrder);
    };
  }, [handleSocketStatusUpdate, handleSocketNewOrder]);

  const handleRefresh = useCallback(() => {
    if (activePageId) {
      fetchOrders(activePageId);
    }
  }, [activePageId, fetchOrders]);

  const handleSelectOrder = (order: Order) => {
    selectOrder(order);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    selectOrder(null);
  };

  const handleOpenPrint = (order: Order) => {
    setPrintTargetOrder(order);
    setIsPrintModalOpen(true);
  };

  const handleClosePrint = () => {
    setIsPrintModalOpen(false);
    setPrintTargetOrder(null);
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Quản lý đơn hàng & Vận đơn
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              AI Powered
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Theo dõi đơn hàng tự động từ Messenger & bình luận, điều phối xuất kho và in phiếu giao hàng.
          </p>
        </div>

        {/* Fanpage Selector & Actions */}
        <div className="flex items-center gap-2.5">
          {pages.length > 0 && (
            <div className="relative">
              <Layers className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedPage?.id || ''}
                onChange={(e) => {
                  const target = pages.find((p) => p.id === e.target.value);
                  if (target) selectPage(target);
                }}
                className="pl-8 pr-8 py-1.5 text-xs bg-card border border-border/60 rounded-xl font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm hover:border-border transition-colors appearance-none"
              >
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.pageName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl border border-border/60 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-sm disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-[11px] font-semibold underline hover:opacity-80"
          >
            Bỏ qua
          </button>
        </div>
      )}

      {/* 2. Bento Metrics Overview */}
      <OrderMetrics metrics={metrics} isLoading={isLoading} />

      {/* 3. Orders Table */}
      <OrderTable
        orders={orders}
        isLoading={isLoading}
        selectedStatus={filters.status}
        onSelectStatus={setStatusFilter}
        searchQuery={filters.search}
        onSearchChange={setSearchQuery}
        onSelectOrder={handleSelectOrder}
        onPrintOrder={handleOpenPrint}
        onUpdateStatus={handleUpdateStatus}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* 4. Order Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onUpdateStatus={handleUpdateStatus}
        onOpenPrint={handleOpenPrint}
        isUpdating={isUpdating}
      />

      {/* 5. Printable Waybill / Packing Slip Modal */}
      <OrderPrintModal
        order={printTargetOrder}
        isOpen={isPrintModalOpen}
        onClose={handleClosePrint}
        shopName={selectedPage?.pageName || 'ShopFlow Fashion Store'}
      />
    </div>
  );
}
