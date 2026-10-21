/**
 * ShopFlow - Automation Rules Zustand Store
 * File: frontend/src/lib/automation.store.ts
 *
 * Quản lý trạng thái kịch bản tự động hóa và đồng bộ với REST API /pages/:pageId/rules
 */

import { create } from 'zustand';
import { apiClient } from './api-client';
import {
  AutomationRule,
  CreateAutomationRuleInput,
  UpdateAutomationRuleInput,
  normalizeAutomationRule,
} from '../types/automation';

export interface AutomationState {
  rules: AutomationRule[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchRules: (pageId: string) => Promise<void>;
  createRule: (
    pageId: string,
    input: CreateAutomationRuleInput
  ) => Promise<AutomationRule | null>;
  updateRule: (
    pageId: string,
    ruleId: string,
    input: UpdateAutomationRuleInput
  ) => Promise<AutomationRule | null>;
  toggleRuleActive: (
    pageId: string,
    ruleId: string,
    isActive: boolean
  ) => Promise<boolean>;
  deleteRule: (pageId: string, ruleId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAutomationStore = create<AutomationState>((set, get) => ({
  rules: [],
  isLoading: false,
  error: null,
  searchQuery: '',

  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
  },

  clearError: () => {
    set({ error: null });
  },

  fetchRules: async (pageId: string) => {
    if (!pageId) {
      set({ rules: [], isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/pages/${pageId}/rules`);
      const rawData = response.data?.data;
      const rawList = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.rules)
          ? rawData.rules
          : [];

      const normalizedRules = rawList.map(normalizeAutomationRule);
      set({ rules: normalizedRules, isLoading: false, error: null });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        'Không thể tải danh sách kịch bản tự động hóa';
      set({ isLoading: false, error: errorMsg });
    }
  },

  createRule: async (pageId: string, input: CreateAutomationRuleInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post(`/pages/${pageId}/rules`, input);
      const rawRule = response.data?.data?.rule || response.data?.data;
      const newRule = normalizeAutomationRule(rawRule);

      set((state) => ({
        rules: [newRule, ...state.rules],
        isLoading: false,
        error: null,
      }));
      return newRule;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        'Không thể tạo kịch bản tự động hóa';
      set({ isLoading: false, error: errorMsg });
      return null;
    }
  },

  updateRule: async (
    pageId: string,
    ruleId: string,
    input: UpdateAutomationRuleInput
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put(
        `/pages/${pageId}/rules/${ruleId}`,
        input
      );
      const rawRule = response.data?.data?.rule || response.data?.data;
      const updatedRule = normalizeAutomationRule(rawRule);

      set((state) => ({
        rules: state.rules.map((r) => (r.id === ruleId ? updatedRule : r)),
        isLoading: false,
        error: null,
      }));
      return updatedRule;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        'Không thể cập nhật kịch bản tự động hóa';
      set({ isLoading: false, error: errorMsg });
      return null;
    }
  },

  toggleRuleActive: async (
    pageId: string,
    ruleId: string,
    isActive: boolean
  ) => {
    const previousRules = get().rules;
    // Optimistic UI Update
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? { ...r, isActive, is_active: isActive }
          : r
      ),
    }));

    try {
      await apiClient.put(`/pages/${pageId}/rules/${ruleId}`, {
        is_active: isActive,
      });
      return true;
    } catch (err: unknown) {
      // Rollback on network failure
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        'Không thể đổi trạng thái hoạt động của kịch bản';

      set({
        rules: previousRules,
        error: errorMsg,
      });
      return false;
    }
  },

  deleteRule: async (pageId: string, ruleId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/pages/${pageId}/rules/${ruleId}`);
      set((state) => ({
        rules: state.rules.filter((r) => r.id !== ruleId),
        isLoading: false,
        error: null,
      }));
      return true;
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        'Không thể xóa kịch bản tự động hóa';
      set({ isLoading: false, error: errorMsg });
      return false;
    }
  },
}));
