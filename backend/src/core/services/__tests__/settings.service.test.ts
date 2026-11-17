import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsService } from '../settings.service.js';
import { UserRepository } from '../../../infrastructure/repositories/user.repository.js';
import { ConnectedPageRepository } from '../../../infrastructure/repositories/connected-page.repository.js';
import * as authHelper from '../../../utils/auth.helper.js';

describe('SettingsService Unit Tests', () => {
  let userRepoMock: Partial<UserRepository>;
  let pageRepoMock: Partial<ConnectedPageRepository>;
  let service: SettingsService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'user@shopflow.vn',
    password_hash: '$2a$12$someHashedPassword',
    full_name: 'Nguyễn Văn A',
    role: 'owner' as const,
    status: 'active' as const,
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    userRepoMock = {
      findById: vi.fn().mockResolvedValue(mockUser),
      updateProfile: vi.fn().mockResolvedValue({
        ...mockUser,
        full_name: 'Nguyễn Văn Mới',
        updated_at: new Date('2026-02-01T00:00:00Z'),
      }),
      updatePassword: vi.fn().mockResolvedValue(true),
    };

    pageRepoMock = {
      findAllByUserId: vi.fn().mockResolvedValue([
        {
          id: 'page-1',
          user_id: 'user-uuid-1',
          page_id: '123456789',
          page_name: 'Shop Flow Store',
          page_access_token: 'encrypted',
          is_active: true,
          webhook_subscribed: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]),
    };

    service = new SettingsService(
      userRepoMock as UserRepository,
      pageRepoMock as ConnectedPageRepository
    );
  });

  describe('getProfile', () => {
    it('trả về thông tin hồ sơ người dùng hợp lệ', async () => {
      const profile = await service.getProfile('user-uuid-1');
      expect(profile.id).toBe('user-uuid-1');
      expect(profile.email).toBe('user@shopflow.vn');
      expect(profile.fullName).toBe('Nguyễn Văn A');
      expect(profile.role).toBe('owner');
    });

    it('báo lỗi khi không tìm thấy người dùng', async () => {
      userRepoMock.findById = vi.fn().mockResolvedValue(null);
      await expect(service.getProfile('unknown-id')).rejects.toThrow('Không tìm thấy tài khoản người dùng');
    });
  });

  describe('updateProfile', () => {
    it('cập nhật họ tên thành công', async () => {
      const result = await service.updateProfile('user-uuid-1', {
        fullName: 'Nguyễn Văn Mới',
        phone: '0987654321',
      });
      expect(result.fullName).toBe('Nguyễn Văn Mới');
      expect(userRepoMock.updateProfile).toHaveBeenCalledWith('user-uuid-1', 'Nguyễn Văn Mới');
    });
  });

  describe('changePassword', () => {
    it('đổi mật khẩu thành công khi mật khẩu cũ chính xác và mật khẩu mới khác', async () => {
      vi.spyOn(authHelper, 'verifyPassword')
        .mockResolvedValueOnce(true) // mật khẩu cũ khớp
        .mockResolvedValueOnce(false); // mật khẩu mới khác mật khẩu cũ
      vi.spyOn(authHelper, 'hashPassword').mockResolvedValue('newHash123');

      const res = await service.changePassword('user-uuid-1', {
        currentPassword: 'oldPass123!',
        newPassword: 'newPass456@',
      });

      expect(res.success).toBe(true);
      expect(userRepoMock.updatePassword).toHaveBeenCalledWith('user-uuid-1', 'newHash123');
    });

    it('báo lỗi khi mật khẩu hiện tại sai', async () => {
      vi.spyOn(authHelper, 'verifyPassword').mockResolvedValueOnce(false);

      await expect(
        service.changePassword('user-uuid-1', {
          currentPassword: 'wrongPass!',
          newPassword: 'newPass456@',
        })
      ).rejects.toThrow('Mật khẩu hiện tại không chính xác');
    });

    it('báo lỗi khi mật khẩu mới trùng với mật khẩu cũ', async () => {
      vi.spyOn(authHelper, 'verifyPassword')
        .mockResolvedValueOnce(true) // mật khẩu cũ đúng
        .mockResolvedValueOnce(true); // mật khẩu mới trùng

      await expect(
        service.changePassword('user-uuid-1', {
          currentPassword: 'samePassword123!',
          newPassword: 'samePassword123!',
        })
      ).rejects.toThrow('Mật khẩu mới không được trùng với mật khẩu hiện tại');
    });
  });

  describe('getMetaLimits', () => {
    it('tính toán và trả về số liệu hạn mức Meta Graph API', async () => {
      const result = await service.getMetaLimits('user-uuid-1');
      expect(result.rateLimit.totalLimit).toBe(4800);
      expect(result.rateLimit.status).toBe('safe');
      expect(result.webhookHealth.status).toBe('active');
      expect(result.fanpages.length).toBe(1);
      expect(result.fanpages[0]?.pageName).toBe('Shop Flow Store');
    });
  });
});
