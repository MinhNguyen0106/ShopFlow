/**
 * ShopFlow - Page Member Zustand Store
 * File: frontend/src/lib/page-member.store.ts
 */

import { create } from 'zustand';
import { apiClient } from './api-client';
import {
  PageMember,
  PageRole,
  InviteMemberPayload,
  normalizePageMember,
} from '../types/page-member';

interface PageMemberState {
  members: PageMember[];
  currentRole: PageRole | null;
  isLoading: boolean;
  error: string | null;

  fetchMembers: (pageId: string) => Promise<void>;
  inviteMember: (pageId: string, payload: InviteMemberPayload) => Promise<PageMember>;
  updateRole: (pageId: string, memberId: string, role: PageRole) => Promise<void>;
  removeMember: (pageId: string, memberId: string) => Promise<void>;
  setCurrentRole: (role: PageRole | null) => void;
  reset: () => void;
}

export const usePageMemberStore = create<PageMemberState>((set, get) => ({
  members: [],
  currentRole: null,
  isLoading: false,
  error: null,

  fetchMembers: async (pageId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/pages/${pageId}/members`);
      const rawData = response.data?.data;
      const rawList = Array.isArray(rawData?.members)
        ? rawData.members
        : Array.isArray(rawData)
          ? rawData
          : [];

      const members = rawList.map(normalizePageMember);
      set({ members, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Không thể tải danh sách thành viên';
      set({ error: message, isLoading: false });
    }
  },

  inviteMember: async (pageId: string, payload: InviteMemberPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/pages/${pageId}/members/invite`, payload);
      const rawMember = response.data?.data?.member;
      const newMember = normalizePageMember(rawMember);

      set((state) => ({
        members: [...state.members, newMember],
        isLoading: false,
      }));
      return newMember;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Không thể mời thành viên mới';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateRole: async (pageId: string, memberId: string, role: PageRole) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(
        `/pages/${pageId}/members/${memberId}/role`,
        { role }
      );
      const updated = normalizePageMember(response.data?.data?.member);

      set((state) => ({
        members: state.members.map((m) =>
          m.id === memberId ? { ...m, role: updated.role, updatedAt: updated.updatedAt } : m
        ),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Không thể cập nhật vai trò thành viên';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  removeMember: async (pageId: string, memberId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/pages/${pageId}/members/${memberId}`);
      set((state) => ({
        members: state.members.filter((m) => m.id !== memberId),
        isLoading: false,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Không thể xóa thành viên';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  setCurrentRole: (role: PageRole | null) => {
    set({ currentRole: role });
  },

  reset: () => {
    set({ members: [], currentRole: null, error: null, isLoading: false });
  },
}));
