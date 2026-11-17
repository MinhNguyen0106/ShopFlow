import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { SettingsController } from '../settings.controller.js';
import { SettingsService } from '../../../core/services/settings.service.js';

describe('SettingsController Unit Tests', () => {
  let serviceMock: Partial<SettingsService>;
  let controller: SettingsController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    serviceMock = {
      getProfile: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@shopflow.vn',
        fullName: 'Nguyễn Văn A',
        role: 'owner',
        status: 'active',
        timezone: 'Asia/Ho_Chi_Minh',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
      updateProfile: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@shopflow.vn',
        fullName: 'Nguyễn Văn B',
        role: 'owner',
        status: 'active',
        timezone: 'Asia/Ho_Chi_Minh',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      }),
      changePassword: vi.fn().mockResolvedValue({
        success: true,
        message: 'Đổi mật khẩu thành công',
      }),
      getMetaLimits: vi.fn().mockResolvedValue({
        rateLimit: {
          callsUsed: 120,
          totalLimit: 4800,
          usagePercent: 2.5,
          callsPerMinute: 2,
          status: 'safe',
          resetHoursLeft: 12,
        },
        webhookHealth: {
          status: 'active',
          signatureAlgorithm: 'HMAC-SHA256',
          timingSafeCheck: true,
          redisIdempotencyTtlHours: 24,
          avgLatencyMs: 35,
        },
        fanpages: [],
      }),
    };

    controller = new SettingsController(serviceMock as SettingsService);

    req = {
      user: { id: 'user-1', email: 'user@shopflow.vn', role: 'owner' } as any,
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
  });

  describe('getProfile', () => {
    it('trả về 200 kèm profile data khi đã xác thực', async () => {
      await controller.getProfile(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            profile: expect.objectContaining({ id: 'user-1' }),
          }),
        })
      );
    });

    it('gọi next với lỗi UnauthorizedError khi thiếu user', async () => {
      req.user = undefined;
      await controller.getProfile(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
        })
      );
    });
  });

  describe('updateProfile', () => {
    it('trả về 200 khi cập nhật hồ sơ thành công', async () => {
      req.body = { fullName: 'Nguyễn Văn B' };
      await controller.updateProfile(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(serviceMock.updateProfile).toHaveBeenCalledWith('user-1', req.body);
    });
  });

  describe('changePassword', () => {
    it('trả về 200 khi đổi mật khẩu thành công', async () => {
      req.body = { currentPassword: 'old', newPassword: 'new' };
      await controller.changePassword(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(serviceMock.changePassword).toHaveBeenCalledWith('user-1', req.body);
    });
  });

  describe('getMetaLimits', () => {
    it('trả về 200 kèm dữ liệu giám sát Meta limits', async () => {
      await controller.getMetaLimits(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(serviceMock.getMetaLimits).toHaveBeenCalledWith('user-1');
    });
  });
});
