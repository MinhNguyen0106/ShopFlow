/**
 * ShopFlow - Settings Zustand Store
 * File: frontend/src/lib/settings.store.ts
 *
 * Quản lý trạng thái Hồ sơ cá nhân, Đổi mật khẩu và Dữ liệu giám sát Meta Graph API.
 */

import { create } from 'zustand';
import { apiClient } from './api-client';
import { UserProfile, MetaLimitsData } from '../types/settings';

export interface SettingsState {
  profile: UserProfile | null;
  metaLimits: MetaLimitsData | null;
  isLoadingProfile: boolean;
  isUpdatingProfile: boolean;
  isLoadingLimits: boolean;
  isChangingPassword: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: {
    fullName: string;
    phone?: string | null;
    brandName?: string | null;
    timezone?: string;
  }) => Promise<boolean>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
  fetchMetaLimits: () => Promise<void>;
  clearMessages: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  profile: null,
  metaLimits: null,
  isLoadingProfile: false,
  isUpdatingProfile: false,
  isLoadingLimits: false,
  isChangingPassword: false,
  error: null,
  successMessage: null,

  fetchProfile: async () => {
    set({ isLoadingProfile: true, error: null });
    try {
      const response = await apiClient.get('/settings/profile');
      const profileData = response.data?.data?.profile || response.data?.data || null;

      if (profileData) {
        set({
          profile: {
            id: String(profileData.id || ''),
            email: String(profileData.email || ''),
            fullName: String(profileData.fullName || profileData.full_name || ''),
            role: String(profileData.role || 'owner'),
            status: String(profileData.status || 'active'),
            phone: profileData.phone || null,
            brandName: profileData.brandName || profileData.brand_name || 'ShopFlow Social Commerce',
            timezone: profileData.timezone || 'Asia/Ho_Chi_Minh',
            createdAt: String(profileData.createdAt || profileData.created_at || ''),
            updatedAt: String(profileData.updatedAt || profileData.updated_at || ''),
          },
          isLoadingProfile: false,
        });
      } else {
        set({ isLoadingProfile: false });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể tải thông tin hồ sơ';
      set({ error: msg, isLoadingProfile: false });
    }
  },

  updateProfile: async (payload) => {
    set({ isUpdatingProfile: true, error: null, successMessage: null });
    try {
      const response = await apiClient.put('/settings/profile', payload);
      const updated = response.data?.data?.profile || response.data?.data;

      if (updated) {
        set({
          profile: {
            id: String(updated.id || ''),
            email: String(updated.email || ''),
            fullName: String(updated.fullName || updated.full_name || payload.fullName),
            role: String(updated.role || 'owner'),
            status: String(updated.status || 'active'),
            phone: payload.phone ?? updated.phone ?? null,
            brandName: payload.brandName ?? updated.brandName ?? 'ShopFlow Social Commerce',
            timezone: payload.timezone ?? updated.timezone ?? 'Asia/Ho_Chi_Minh',
            createdAt: String(updated.createdAt || updated.created_at || ''),
            updatedAt: String(updated.updatedAt || updated.updated_at || new Date().toISOString()),
          },
          isUpdatingProfile: false,
          successMessage: 'Cập nhật thông tin hồ sơ thành công!',
        });
        return true;
      }
      set({ isUpdatingProfile: false });
      return false;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Cập nhật hồ sơ thất bại';
      set({ error: msg, isUpdatingProfile: false });
      return false;
    }
  },

  changePassword: async (payload) => {
    set({ isChangingPassword: true, error: null, successMessage: null });
    try {
      const response = await apiClient.put('/settings/password', payload);
      const message = response.data?.message || 'Đổi mật khẩu thành công!';
      set({
        isChangingPassword: false,
        successMessage: message,
      });
      return { success: true, message };
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Đổi mật khẩu thất bại';
      set({ error: msg, isChangingPassword: false });
      return { success: false, message: msg };
    }
  },

  fetchMetaLimits: async () => {
    set({ isLoadingLimits: true, error: null });
    try {
      const response = await apiClient.get('/settings/meta-limits');
      const limitsData = response.data?.data || null;

      if (limitsData) {
        set({
          metaLimits: {
            rateLimit: {
              callsUsed: Number(limitsData.rateLimit?.callsUsed || 0),
              totalLimit: Number(limitsData.rateLimit?.totalLimit || 4800),
              usagePercent: Number(limitsData.rateLimit?.usagePercent || 0),
              callsPerMinute: Number(limitsData.rateLimit?.callsPerMinute || 0),
              status: limitsData.rateLimit?.status || 'safe',
              resetHoursLeft: Number(limitsData.rateLimit?.resetHoursLeft || 24),
            },
            webhookHealth: {
              status: limitsData.webhookHealth?.status || 'active',
              signatureAlgorithm: String(limitsData.webhookHealth?.signatureAlgorithm || 'HMAC-SHA256'),
              timingSafeCheck: Boolean(limitsData.webhookHealth?.timingSafeCheck ?? true),
              redisIdempotencyTtlHours: Number(limitsData.webhookHealth?.redisIdempotencyTtlHours || 24),
              avgLatencyMs: Number(limitsData.webhookHealth?.avgLatencyMs || 35),
            },
            fanpages: Array.isArray(limitsData.fanpages)
              ? limitsData.fanpages.map((p: any) => ({
                  pageId: String(p.pageId || p.page_id || ''),
                  pageName: String(p.pageName || p.page_name || 'Fanpage'),
                  isActive: Boolean(p.isActive ?? p.is_active ?? true),
                  webhookSubscribed: Boolean(p.webhookSubscribed ?? p.webhook_subscribed ?? false),
                  tokenDaysLeft: Number(p.tokenDaysLeft || 58),
                }))
              : [],
          },
          isLoadingLimits: false,
        });
      } else {
        set({ isLoadingLimits: false });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Không thể tải dữ liệu giám sát Meta limits';
      set({ error: msg, isLoadingLimits: false });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));
