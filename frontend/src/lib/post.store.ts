/**
 * ShopFlow - Scheduled Post Zustand Store
 * File: frontend/src/lib/post.store.ts
 *
 * Tuân thủ quy chuẩn: .agents/rules/api-contract-sync.md và Defensive Data Parsing.
 */

import { create } from 'zustand';
import { apiClient } from './api-client';
import {
  ScheduledPostItem,
  PaginationMeta,
  PostStatus,
  PostStatusChangedPayload,
  normalizePostItem,
} from '../types/post';

export interface PostState {
  posts: ScheduledPostItem[];
  meta: PaginationMeta;
  selectedPageId: string;
  selectedStatus: PostStatus | 'all';
  dateRange: {
    from?: string;
    to?: string;
  };
  viewMode: 'list' | 'calendar';
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;

  // Actions
  fetchPosts: () => Promise<void>;
  filterByStatus: (status: PostStatus | 'all') => Promise<void>;
  filterByPage: (pageId: string) => Promise<void>;
  changePage: (page: number) => Promise<void>;
  setDateRange: (from?: string, to?: string) => Promise<void>;
  setViewMode: (mode: 'list' | 'calendar') => void;
  retryPost: (postId: string) => Promise<boolean>;
  cancelPost: (postId: string) => Promise<boolean>;
  handlePostStatusChanged: (payload: unknown) => void;
  reset: () => void;
}

const initialMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  meta: { ...initialMeta },
  selectedPageId: 'all',
  selectedStatus: 'all',
  dateRange: {},
  viewMode: 'list',
  isLoading: false,
  isActionLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { selectedPageId, selectedStatus, meta, dateRange } = get();

      const params: Record<string, string | number> = {
        page: meta.page,
        limit: meta.limit,
      };

      if (selectedPageId && selectedPageId !== 'all') {
        params.page_id = selectedPageId;
      }

      if (selectedStatus && selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      if (dateRange.from) {
        params.from = dateRange.from;
      }

      if (dateRange.to) {
        params.to = dateRange.to;
      }

      const response = await apiClient.get('/posts', { params });

      // Defensive Parsing
      const responseData = response.data?.data || response.data || {};
      const rawPosts = Array.isArray(responseData.posts)
        ? responseData.posts
        : Array.isArray(responseData)
        ? responseData
        : [];

      const posts = rawPosts.map((item: unknown) => normalizePostItem(item));

      const rawMeta = responseData.meta || {};
      const total = Number(rawMeta.total ?? posts.length);
      const limit = Number(rawMeta.limit ?? meta.limit ?? 10);
      const page = Number(rawMeta.page ?? meta.page ?? 1);
      const totalPages = Number(rawMeta.totalPages ?? Math.max(1, Math.ceil(total / limit)));

      set({
        posts,
        meta: {
          total,
          limit,
          page,
          totalPages,
        },
        isLoading: false,
      });
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể tải danh sách bài viết đặt lịch.';
      set({ error: errorMessage, isLoading: false, posts: [] });
    }
  },

  filterByStatus: async (status: PostStatus | 'all') => {
    set((state) => ({
      selectedStatus: status,
      meta: { ...state.meta, page: 1 },
    }));
    await get().fetchPosts();
  },

  filterByPage: async (pageId: string) => {
    set((state) => ({
      selectedPageId: pageId,
      meta: { ...state.meta, page: 1 },
    }));
    await get().fetchPosts();
  },

  changePage: async (page: number) => {
    set((state) => ({
      meta: { ...state.meta, page },
    }));
    await get().fetchPosts();
  },

  setDateRange: async (from?: string, to?: string) => {
    set((state) => ({
      dateRange: { from, to },
      meta: { ...state.meta, page: 1 },
    }));
    await get().fetchPosts();
  },

  setViewMode: (mode: 'list' | 'calendar') => {
    set({ viewMode: mode });
  },

  retryPost: async (postId: string): Promise<boolean> => {
    set({ isActionLoading: true, error: null });
    try {
      const response = await apiClient.post(`/posts/${postId}/retry`);
      const updatedPost = response.data?.data?.post;

      set((state) => ({
        isActionLoading: false,
        posts: state.posts.map((post) => {
          if (post.id === postId) {
            return updatedPost
              ? normalizePostItem(updatedPost)
              : { ...post, status: 'pending', errorMessage: null, error_message: null };
          }
          return post;
        }),
      }));
      return true;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể thử lại đăng bài viết.';
      set({ error: message, isActionLoading: false });
      return false;
    }
  },

  cancelPost: async (postId: string): Promise<boolean> => {
    set({ isActionLoading: true, error: null });
    try {
      await apiClient.delete(`/posts/${postId}`);
      set((state) => ({
        isActionLoading: false,
        posts: state.posts.map((post) =>
          post.id === postId ? { ...post, status: 'cancelled' } : post
        ),
      }));
      return true;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể hủy lịch đăng bài.';
      set({ error: message, isActionLoading: false });
      return false;
    }
  },

  handlePostStatusChanged: (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return;
    const p = payload as Record<string, unknown>;
    const targetPostId = String(p.postId || p.id || '');
    if (!targetPostId) return;

    const newStatus = p.status as PostStatus | undefined;
    const metaPostId = p.metaPostId !== undefined ? (p.metaPostId as string | null) : undefined;
    const errorMessage = p.errorMessage !== undefined ? (p.errorMessage as string | null) : undefined;
    const updatedAt = p.updatedAt ? String(p.updatedAt) : new Date().toISOString();

    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === targetPostId) {
          return {
            ...post,
            status: newStatus || post.status,
            metaPostId: metaPostId !== undefined ? metaPostId : post.metaPostId,
            meta_post_id: metaPostId !== undefined ? metaPostId : post.meta_post_id,
            errorMessage: errorMessage !== undefined ? errorMessage : post.errorMessage,
            error_message: errorMessage !== undefined ? errorMessage : post.error_message,
            updatedAt,
            updated_at: updatedAt,
          };
        }
        return post;
      }),
    }));
  },

  reset: () => {
    set({
      posts: [],
      meta: { ...initialMeta },
      selectedPageId: 'all',
      selectedStatus: 'all',
      dateRange: {},
      viewMode: 'list',
      isLoading: false,
      isActionLoading: false,
      error: null,
    });
  },
}));
