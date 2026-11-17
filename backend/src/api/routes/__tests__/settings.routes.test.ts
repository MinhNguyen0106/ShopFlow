import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import { settingsService } from '../../../core/services/settings.service.js';
import { generateTokens } from '../../../utils/auth.helper.js';
import { User } from '../../../core/entities/user.entity.js';

describe('Settings Routes Integration (/api/v1/settings)', () => {
  const app = createApp();

  const testUser: User = {
    id: 'user-uuid-1234',
    email: 'settings-user@shopflow.vn',
    password_hash: '$2a$12$somehash',
    full_name: 'Nguyễn Cài Đặt',
    role: 'owner',
    status: 'active',
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  };

  const { accessToken } = generateTokens(testUser);

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(settingsService, 'getProfile').mockResolvedValue({
      id: testUser.id,
      email: testUser.email,
      fullName: testUser.full_name,
      role: testUser.role,
      status: testUser.status,
      phone: '0987654321',
      brandName: 'Shop Thời Trang Mùa Hè',
      timezone: 'Asia/Ho_Chi_Minh',
      createdAt: testUser.created_at.toISOString(),
      updatedAt: testUser.updated_at.toISOString(),
    });

    vi.spyOn(settingsService, 'updateProfile').mockResolvedValue({
      id: testUser.id,
      email: testUser.email,
      fullName: 'Nguyễn Cập Nhật',
      role: testUser.role,
      status: testUser.status,
      phone: '0987654321',
      brandName: 'Shop Thời Trang Mới',
      timezone: 'Asia/Ho_Chi_Minh',
      createdAt: testUser.created_at.toISOString(),
      updatedAt: new Date().toISOString(),
    });

    vi.spyOn(settingsService, 'changePassword').mockResolvedValue({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });

    vi.spyOn(settingsService, 'getMetaLimits').mockResolvedValue({
      rateLimit: {
        callsUsed: 150,
        totalLimit: 4800,
        usagePercent: 3.1,
        callsPerMinute: 2,
        status: 'safe',
        resetHoursLeft: 12,
      },
      webhookHealth: {
        status: 'active',
        signatureAlgorithm: 'HMAC-SHA256 (x-hub-signature-256)',
        timingSafeCheck: true,
        redisIdempotencyTtlHours: 24,
        avgLatencyMs: 40,
      },
      fanpages: [
        {
          pageId: '123456789',
          pageName: 'Shop Flow Test Page',
          isActive: true,
          webhookSubscribed: true,
          tokenDaysLeft: 55,
        },
      ],
    });
  });

  describe('GET /api/v1/settings/profile', () => {
    it('trả về 401 khi không gửi token', async () => {
      const res = await request(app).get('/api/v1/settings/profile');
      expect(res.status).toBe(401);
    });

    it('trả về 200 kèm profile khi có token hợp lệ', async () => {
      const res = await request(app)
        .get('/api/v1/settings/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.fullName).toBe('Nguyễn Cài Đặt');
      expect(res.body.data.profile.email).toBe('settings-user@shopflow.vn');
    });
  });

  describe('PUT /api/v1/settings/profile', () => {
    it('trả về 400 khi fullName bị rỗng', async () => {
      const res = await request(app)
        .put('/api/v1/settings/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ fullName: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('trả về 200 khi cập nhật hồ sơ hợp lệ', async () => {
      const res = await request(app)
        .put('/api/v1/settings/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          fullName: 'Nguyễn Cập Nhật',
          phone: '0987654321',
          brandName: 'Shop Thời Trang Mới',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.fullName).toBe('Nguyễn Cập Nhật');
    });
  });

  describe('PUT /api/v1/settings/password', () => {
    it('trả về 400 khi mật khẩu mới không đạt chuẩn bảo mật', async () => {
      const res = await request(app)
        .put('/api/v1/settings/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'currentPassword123!',
          newPassword: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('trả về 200 khi đổi mật khẩu thành công', async () => {
      const res = await request(app)
        .put('/api/v1/settings/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'currentPassword123!',
          newPassword: 'StrongPassword2026@',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Đổi mật khẩu thành công');
    });
  });

  describe('GET /api/v1/settings/meta-limits', () => {
    it('trả về 200 kèm số liệu giám sát Meta limits và Webhook health', async () => {
      const res = await request(app)
        .get('/api/v1/settings/meta-limits')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rateLimit.totalLimit).toBe(4800);
      expect(res.body.data.webhookHealth.status).toBe('active');
      expect(res.body.data.fanpages).toHaveLength(1);
    });
  });
});
