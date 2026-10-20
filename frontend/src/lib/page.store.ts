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
      const pages: ConnectedPage[] = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData.pages)
          ? responseData.pages
          : [];
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
