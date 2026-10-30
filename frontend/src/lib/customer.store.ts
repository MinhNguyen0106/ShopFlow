/**
 * ShopFlow - Customer CRM Zustand Store (TASK-27)
 * File: frontend/src/lib/customer.store.ts
 *
 * Quản lý danh bạ khách hàng, khách tiềm năng (Leads), bộ lọc đa tags,
 * phân trang, tính toán metrics và cập nhật lạc quan (Optimistic UI) khi gán/xóa tags.
 */

import { create } from 'zustand';
import { apiClient } from './api-client';
import {
  Customer,
  CustomerOrder,
  CustomerMetrics,
  CustomerFilters,
  DEFAULT_CUSTOMER_METRICS,
  DEFAULT_CUSTOMER_FILTERS,
  normalizeCustomer,
} from '../types/customer';

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  customerOrders: CustomerOrder[];
  metrics: CustomerMetrics;
  filters: CustomerFilters;
  pagination: CustomerPagination;
  isLoading: boolean;
  isLoadingOrders: boolean;
  isUpdatingTag: boolean;
  error: string | null;

  // Actions
  fetchCustomers: (pageId: string) => Promise<void>;
  fetchMetrics: (pageId: string) => Promise<void>;
  fetchCustomerOrders: (customerId: string) => Promise<void>;
  selectCustomer: (customer: Customer | null) => void;
  setSearchQuery: (query: string) => void;
  setTagsFilter: (tags: string[]) => void;
  setSorting: (sortBy: CustomerFilters['sortBy'], sortOrder: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  updateCustomerNotes: (customerId: string, notes: string) => Promise<boolean>;
  addTag: (customerId: string, tag: string) => Promise<boolean>;
  removeTag: (customerId: string, tag: string) => Promise<boolean>;
  clearError: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  customerOrders: [],
  metrics: DEFAULT_CUSTOMER_METRICS,
  filters: DEFAULT_CUSTOMER_FILTERS,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  isLoading: false,
  isLoadingOrders: false,
  isUpdatingTag: false,
  error: null,

  fetchCustomers: async (pageId: string) => {
    if (!pageId) return;
    set({ isLoading: true, error: null });

    try {
      const { search, tags, sortBy, sortOrder, page, limit } = get().filters;
      const params: Record<string, string | number> = {
        pageId,
        page,
        limit,
        sortBy,
        sortOrder,
      };

      if (search && search.trim()) {
        params['search'] = search.trim();
      }

      if (tags && tags.length > 0) {
        params['tags'] = tags.join(',');
      }

      const response = await apiClient.get('/customers', { params });
      const rawData = response.data?.data;
      const paginationData = response.data?.pagination;

      const rawCustomers = Array.isArray(rawData) ? rawData : [];
      const normalizedCustomers = rawCustomers.map(normalizeCustomer);

      set({
        customers: normalizedCustomers,
        pagination: {
          page: paginationData?.page || page,
          limit: paginationData?.limit || limit,
          total: paginationData?.total || normalizedCustomers.length,
          totalPages: paginationData?.totalPages || 1,
        },
        isLoading: false,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Lỗi khi tải danh sách khách hàng';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchMetrics: async (pageId: string) => {
    if (!pageId) return;
    try {
      const response = await apiClient.get('/customers/metrics', {
        params: { pageId },
      });
      const data = response.data?.data;
      if (data) {
        set({
          metrics: {
            totalCustomers: Number(data.totalCustomers) || 0,
            leadsWithPhone: Number(data.leadsWithPhone) || 0,
            vipCustomers: Number(data.vipCustomers) || 0,
            totalLifetimeValue: Number(data.totalLifetimeValue) || 0,
          },
        });
      }
    } catch {
      // Bỏ qua lỗi ngầm khi load metrics
    }
  },

  fetchCustomerOrders: async (customerId: string) => {
    if (!customerId) return;
    set({ isLoadingOrders: true, customerOrders: [] });

    try {
      const response = await apiClient.get(`/customers/${customerId}/orders`);
      const rawOrders = response.data?.data;
      const orders: CustomerOrder[] = Array.isArray(rawOrders)
        ? rawOrders.map((o: Record<string, unknown>) => ({
            id: String(o.id || ''),
            orderCode: String(o.orderCode || ''),
            status: String(o.status || 'pending'),
            paymentStatus: String(o.paymentStatus || 'unpaid'),
            paymentMethod: String(o.paymentMethod || 'cod'),
            totalAmount: Number(o.totalAmount) || 0,
            finalAmount: Number(o.finalAmount) || 0,
            createdAt: String(o.createdAt || new Date().toISOString()),
          }))
        : [];

      set({ customerOrders: orders, isLoadingOrders: false });
    } catch {
      set({ isLoadingOrders: false });
    }
  },

  selectCustomer: (customer) => {
    set({ selectedCustomer: customer });
    if (customer?.id) {
      get().fetchCustomerOrders(customer.id);
    } else {
      set({ customerOrders: [] });
    }
  },

  setSearchQuery: (search) => {
    set((state) => ({
      filters: { ...state.filters, search, page: 1 },
    }));
  },

  setTagsFilter: (tags) => {
    set((state) => ({
      filters: { ...state.filters, tags, page: 1 },
    }));
  },

  setSorting: (sortBy, sortOrder) => {
    set((state) => ({
      filters: { ...state.filters, sortBy, sortOrder, page: 1 },
    }));
  },

  setPage: (page) => {
    set((state) => ({
      filters: { ...state.filters, page },
    }));
  },

  updateCustomerNotes: async (customerId, notes) => {
    try {
      const response = await apiClient.patch(`/customers/${customerId}`, { notes });
      const updated = normalizeCustomer(response.data?.data);

      set((state) => ({
        customers: state.customers.map((c) => (c.id === customerId ? updated : c)),
        selectedCustomer:
          state.selectedCustomer?.id === customerId ? updated : state.selectedCustomer,
      }));
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Không thể cập nhật ghi chú';
      set({ error: errorMessage });
      return false;
    }
  },

  addTag: async (customerId, tag) => {
    const cleanTag = tag.trim();
    if (!cleanTag) return false;

    // Snapshot state trước khi cập nhật lạc quan
    const prevCustomers = get().customers;
    const prevSelected = get().selectedCustomer;

    // Cập nhật lạc quan (Optimistic update)
    set((state) => ({
      isUpdatingTag: true,
      customers: state.customers.map((c) => {
        if (c.id === customerId && !c.tags.includes(cleanTag)) {
          return { ...c, tags: [...c.tags, cleanTag] };
        }
        return c;
      }),
      selectedCustomer:
        state.selectedCustomer?.id === customerId &&
        !state.selectedCustomer.tags.includes(cleanTag)
          ? { ...state.selectedCustomer, tags: [...state.selectedCustomer.tags, cleanTag] }
          : state.selectedCustomer,
    }));

    try {
      const response = await apiClient.post(`/customers/${customerId}/tags`, {
        tag: cleanTag,
      });
      const updated = normalizeCustomer(response.data?.data);

      set((state) => ({
        isUpdatingTag: false,
        customers: state.customers.map((c) => (c.id === customerId ? updated : c)),
        selectedCustomer:
          state.selectedCustomer?.id === customerId ? updated : state.selectedCustomer,
      }));
      return true;
    } catch (err: unknown) {
      // Rollback về trạng thái cũ nếu API gặp lỗi
      set({
        customers: prevCustomers,
        selectedCustomer: prevSelected,
        isUpdatingTag: false,
        error: err instanceof Error ? err.message : 'Lỗi khi thêm tag',
      });
      return false;
    }
  },

  removeTag: async (customerId, tag) => {
    const cleanTag = tag.trim();
    if (!cleanTag) return false;

    // Snapshot state
    const prevCustomers = get().customers;
    const prevSelected = get().selectedCustomer;

    // Cập nhật lạc quan (Optimistic update)
    set((state) => ({
      isUpdatingTag: true,
      customers: state.customers.map((c) => {
        if (c.id === customerId) {
          return { ...c, tags: c.tags.filter((t) => t !== cleanTag) };
        }
        return c;
      }),
      selectedCustomer:
        state.selectedCustomer?.id === customerId
          ? {
              ...state.selectedCustomer,
              tags: state.selectedCustomer.tags.filter((t) => t !== cleanTag),
            }
          : state.selectedCustomer,
    }));

    try {
      const response = await apiClient.delete(`/customers/${customerId}/tags/${cleanTag}`);
      const updated = normalizeCustomer(response.data?.data);

      set((state) => ({
        isUpdatingTag: false,
        customers: state.customers.map((c) => (c.id === customerId ? updated : c)),
        selectedCustomer:
          state.selectedCustomer?.id === customerId ? updated : state.selectedCustomer,
      }));
      return true;
    } catch (err: unknown) {
      // Rollback
      set({
        customers: prevCustomers,
        selectedCustomer: prevSelected,
        isUpdatingTag: false,
        error: err instanceof Error ? err.message : 'Lỗi khi gỡ tag',
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
