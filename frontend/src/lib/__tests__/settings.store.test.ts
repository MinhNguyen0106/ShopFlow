import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSettingsStore } from '../settings.store';
import { apiClient } from '../api-client';

describe('useSettingsStore Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useSettingsStore.setState({
      profile: null,
      metaLimits: null,
      isLoadingProfile: false,
      isUpdatingProfile: false,
      isLoadingLimits: false,
      isChangingPassword: false,
      error: null,
      successMessage: null,
    });
  });

  it('fetchProfile nạp dữ liệu hồ sơ và lưu trữ đúng định dạng', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          profile: {
            id: 'u-1',
            email: 'test@shopflow.vn',
            fullName: 'Nguyễn Văn Test',
            role: 'owner',
            status: 'active',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          },
        },
      },
    } as any);

    await useSettingsStore.getState().fetchProfile();

    const state = useSettingsStore.getState();
    expect(state.profile?.fullName).toBe('Nguyễn Văn Test');
    expect(state.profile?.email).toBe('test@shopflow.vn');
    expect(state.isLoadingProfile).toBe(false);
  });

  it('updateProfile gửi payload và cập nhật state profile', async () => {
    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          profile: {
            id: 'u-1',
            email: 'test@shopflow.vn',
            fullName: 'Tên Mới',
            role: 'owner',
            status: 'active',
          },
        },
      },
    } as any);

    const ok = await useSettingsStore.getState().updateProfile({
      fullName: 'Tên Mới',
      phone: '0987654321',
    });

    expect(ok).toBe(true);
    const state = useSettingsStore.getState();
    expect(state.profile?.fullName).toBe('Tên Mới');
    expect(state.successMessage).toContain('thành công');
  });

  it('changePassword gọi API và cập nhật thông báo thành công', async () => {
    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Đổi mật khẩu thành công!',
      },
    } as any);

    const res = await useSettingsStore.getState().changePassword({
      currentPassword: 'oldPass123!',
      newPassword: 'newStrongPass456@',
    });

    expect(res.success).toBe(true);
    expect(res.message).toBe('Đổi mật khẩu thành công!');
    expect(useSettingsStore.getState().successMessage).toBe('Đổi mật khẩu thành công!');
  });

  it('fetchMetaLimits nạp đầy đủ thông tin rateLimit và webhookHealth', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          rateLimit: {
            callsUsed: 480,
            totalLimit: 4800,
            usagePercent: 10,
            callsPerMinute: 5,
            status: 'safe',
            resetHoursLeft: 10,
          },
          webhookHealth: {
            status: 'active',
            signatureAlgorithm: 'HMAC-SHA256',
            timingSafeCheck: true,
            redisIdempotencyTtlHours: 24,
            avgLatencyMs: 32,
          },
          fanpages: [
            {
              pageId: 'page-123',
              pageName: 'Trang Test',
              isActive: true,
              webhookSubscribed: true,
              tokenDaysLeft: 59,
            },
          ],
        },
      },
    } as any);

    await useSettingsStore.getState().fetchMetaLimits();

    const state = useSettingsStore.getState();
    expect(state.metaLimits?.rateLimit.callsUsed).toBe(480);
    expect(state.metaLimits?.fanpages).toHaveLength(1);
    expect(state.metaLimits?.webhookHealth.avgLatencyMs).toBe(32);
  });
});
