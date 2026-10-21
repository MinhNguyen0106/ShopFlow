/**
 * ShopFlow - Order Management Zustand Store (TASK-22)
 * File: frontend/src/lib/order.store.ts
 *
 * Quản lý danh sách đơn hàng, bộ lọc đa tầng, phân trang,
 * Optimistic UI update và tích hợp WebSocket listener ORDER_STATUS_CHANGED.
 */

import { create } from 'zustand';
import { apiClient } from './api-client';
import {
  Order,
  OrderStatus,
  OrderMetrics,
  DEFAULT_ORDER_METRICS,
  normalizeOrder,
} from '../types/order';

export interface OrderFilters {
  status: OrderStatus | 'all';
  search: string;
  pageId: string | null;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  metrics: OrderMetrics;
  filters: OrderFilters;
  pagination: OrderPagination;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  // Actions
  fetchOrders: (pageId: string) => Promise<void>;
  selectOrder: (order: Order | null) => void;
  setStatusFilter: (status: OrderStatus | 'all') => void;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  updateOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<boolean>;
  handleSocketStatusUpdate: (payload: { orderId: string; status: OrderStatus; updatedAt?: string }) => void;
  handleSocketNewOrder: (rawOrder: unknown) => void;
  clearError: () => void;
}

function calculateMetrics(orders: Order[]): OrderMetrics {
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const shippingCount = orders.filter((o) => o.status === 'shipping').length;
  const totalToday = orders.length;
  const estimatedRevenueToday = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.finalAmount, 0);

  return {
    totalToday,
    totalTodayGrowth: 15.4, // Giả định tăng trưởng so với hôm qua
    pendingCount,
    shippingCount,
    estimatedRevenueToday,
  };
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  metrics: DEFAULT_ORDER_METRICS,
  filters: {
    status: 'all',
    search: '',
    pageId: null,
  },
  pagination: {
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  },
  isLoading: false,
  isUpdating: false,
  error: null,

  selectOrder: (order: Order | null) => {
    set({ selectedOrder: order });
  },

  setStatusFilter: (status: OrderStatus | 'all') => {
    set((state) => ({
      filters: { ...state.filters, status },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  setSearchQuery: (search: string) => {
    set((state) => ({
      filters: { ...state.filters, search },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  fetchOrders: async (pageId: string) => {
    if (!pageId) {
      set({ orders: [], isLoading: false, error: null, metrics: DEFAULT_ORDER_METRICS });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = new URLSearchParams({
        pageId,
        page: String(pagination.page),
        limit: String(pagination.limit),
      });

      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.search.trim()) {
        params.append('search', filters.search.trim());
      }

      const response = await apiClient.get(`/orders?${params.toString()}`);
      const rawData = response.data?.data;
      const rawItems = Array.isArray(rawData?.items)
        ? rawData.items
        : Array.isArray(rawData)
          ? rawData
          : [];

      const normalizedOrders = rawItems.map(normalizeOrder);
      const total = Number(rawData?.pagination?.total ?? rawData?.total ?? normalizedOrders.length);
      const totalPages = Math.max(1, Math.ceil(total / pagination.limit));
      const metrics = calculateMetrics(normalizedOrders);

      set({
        orders: normalizedOrders,
        metrics,
        pagination: {
          ...pagination,
          total,
          totalPages,
        },
        filters: { ...filters, pageId },
        isLoading: false,
      });
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể tải danh sách đơn hàng';
      set({
        error: errorMessage,
        isLoading: false,
      });
    }
  },

  updateOrderStatus: async (orderId: string, nextStatus: OrderStatus) => {
    const { orders, selectedOrder } = get();
    const previousOrder = orders.find((o) => o.id === orderId);

    if (!previousOrder) {
      return false;
    }

    // 1. Optimistic UI update
    const updatedOrders = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...o.timeline,
              {
                id: `tl-${Date.now()}`,
                status: nextStatus,
                note: `Chuyển trạng thái sang ${nextStatus}`,
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : o
    );

    const updatedSelected =
      selectedOrder?.id === orderId
        ? updatedOrders.find((o) => o.id === orderId) || null
        : selectedOrder;

    set({
      orders: updatedOrders,
      selectedOrder: updatedSelected,
      metrics: calculateMetrics(updatedOrders),
      isUpdating: true,
      error: null,
    });

    // 2. Call backend REST API
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: nextStatus });
      set({ isUpdating: false });
      return true;
    } catch (err: unknown) {
      // 3. Rollback on failure
      const revertedOrders = orders.map((o) => (o.id === orderId ? previousOrder : o));
      const revertedSelected = selectedOrder?.id === orderId ? previousOrder : selectedOrder;

      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Cập nhật trạng thái đơn hàng thất bại. Đã khôi phục dữ liệu.';

      set({
        orders: revertedOrders,
        selectedOrder: revertedSelected,
        metrics: calculateMetrics(revertedOrders),
        isUpdating: false,
        error: errorMessage,
      });
      return false;
    }
  },

  handleSocketStatusUpdate: (payload: { orderId: string; status: OrderStatus; updatedAt?: string }) => {
    const { orders, selectedOrder } = get();
    const target = orders.find((o) => o.id === payload.orderId);
    if (!target) return;

    const updatedOrders = orders.map((o) =>
      o.id === payload.orderId
        ? {
            ...o,
            status: payload.status,
            updatedAt: payload.updatedAt || new Date().toISOString(),
            timeline: [
              ...o.timeline,
              {
                id: `tl-socket-${Date.now()}`,
                status: payload.status,
                note: 'Cập nhật thời gian thực từ hệ thống',
                timestamp: payload.updatedAt || new Date().toISOString(),
              },
            ],
          }
        : o
    );

    const updatedSelected =
      selectedOrder?.id === payload.orderId
        ? updatedOrders.find((o) => o.id === payload.orderId) || null
        : selectedOrder;

    set({
      orders: updatedOrders,
      selectedOrder: updatedSelected,
      metrics: calculateMetrics(updatedOrders),
    });
  },

  handleSocketNewOrder: (rawOrder: unknown) => {
    const { orders, filters } = get();
    const newOrder = normalizeOrder(rawOrder);

    // Kiểm tra nếu đơn hàng thuộc pageId hiện tại
    if (filters.pageId && newOrder.pageId && newOrder.pageId !== filters.pageId) {
      return;
    }

    // Tránh trùng lặp ID
    if (orders.some((o) => o.id === newOrder.id)) {
      return;
    }

    const updatedOrders = [newOrder, ...orders];
    set({
      orders: updatedOrders,
      metrics: calculateMetrics(updatedOrders),
      pagination: {
        ...get().pagination,
        total: get().pagination.total + 1,
      },
    });
  },
}));
