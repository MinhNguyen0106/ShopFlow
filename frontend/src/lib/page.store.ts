import { create } from 'zustand';
import { apiClient } from './api-client';

export interface ConnectedPage {
  id: string;
  userId: string;
  pageId: string;
  pageName: string;
  category?: string | null;
  tasks?: string[] | null;
  isActive: boolean;
  webhookSubscribed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageState {
  pages: ConnectedPage[];
  selectedPage: ConnectedPage | null; // null means 'Tất cả Fanpage'
  isLoading: boolean;
  error: string | null;
  fetchPages: () => Promise<void>;
  selectPage: (page: ConnectedPage | null) => void;
  togglePageActive: (id: string, isActive: boolean) => Promise<boolean>;
  disconnectPage: (id: string) => Promise<boolean>;
}

export const usePageStore = create<PageState>((set, get) => ({
  pages: [],
  selectedPage: null,
  isLoading: false,
  error: null,

  fetchPages: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/pages');
      const responseData = response.data?.data || {};
      const rawList = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData.pages)
          ? responseData.pages
          : [];

      const pages: ConnectedPage[] = rawList.map((item: Record<string, unknown>) => ({
        id: String(item.id || item.page_id || item.pageId || ''),
        userId: String(item.userId || item.user_id || ''),
        pageId: String(item.pageId || item.page_id || ''),
        pageName: String(item.pageName || item.page_name || 'Fanpage'),
        category: (item.category as string | undefined) || null,
        tasks: (item.tasks as string[] | undefined) || null,
        isActive:
          item.isActive !== undefined
            ? Boolean(item.isActive)
            : item.is_active !== undefined
              ? Boolean(item.is_active)
              : true,
        webhookSubscribed:
          item.webhookSubscribed !== undefined
            ? Boolean(item.webhookSubscribed)
            : item.webhook_subscribed !== undefined
              ? Boolean(item.webhook_subscribed)
              : false,
        createdAt: String(item.createdAt || item.created_at || new Date().toISOString()),
        updatedAt: String(item.updatedAt || item.updated_at || new Date().toISOString()),
      }));
      const currentSelected = get().selectedPage;

      let nextSelected = currentSelected;
      if (currentSelected) {
        nextSelected = pages.find((p) => p.id === currentSelected.id) || null;
      }

      set({
        pages,
        selectedPage: nextSelected,
        isLoading: false,
      });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        'Không thể tải danh sách Fanpage';
      set({ error: errorMsg, isLoading: false });
    }
  },

  selectPage: (page) => {
    set({ selectedPage: page });
  },

  togglePageActive: async (id, isActive) => {
    try {
      const response = await apiClient.patch(`/pages/${id}/status`, {
        isActive,
      });
      const respData = response.data?.data || {};
      const updatedPage: ConnectedPage = respData.page || respData;
      set((state) => ({
        pages: state.pages.map((p) => (p.id === id ? updatedPage : p)),
        selectedPage:
          state.selectedPage?.id === id ? updatedPage : state.selectedPage,
      }));
      return true;
    } catch {
      return false;
    }
  },

  disconnectPage: async (id) => {
    try {
      await apiClient.delete(`/pages/${id}`);
      set((state) => ({
        pages: state.pages.filter((p) => p.id !== id),
        selectedPage:
          state.selectedPage?.id === id ? null : state.selectedPage,
      }));
      return true;
    } catch {
      return false;
    }
  },
}));
