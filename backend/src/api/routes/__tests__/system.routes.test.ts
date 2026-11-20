import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import { generateTokens } from '../../../utils/auth.helper.js';
import { alertService } from '../../../core/services/alert.service.js';

vi.mock('../../../core/services/token-blacklist.service.js', () => ({
  tokenBlacklistService: {
    isTokenBlacklisted: vi.fn().mockResolvedValue(false),
  },
}));

describe('System Observability Routes (/api/v1/system)', () => {
  let app: ReturnType<typeof createApp>;
  let validToken: string;

  beforeEach(() => {
    vi.restoreAllMocks();
    app = createApp();

    const tokens = generateTokens({
      id: 'usr_admin_1',
      email: 'admin@shopflow.vn',
      role: 'owner',
    });
    validToken = tokens.accessToken;
  });

  describe('Auth Guard', () => {
    it('trả về 401 khi không có Authorization header', async () => {
      const res = await request(app).get('/api/v1/system/health-stats');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/system/health-stats', () => {
    it('trả về HTTP 200 kèm cấu trúc chỉ số sức khỏe hạ tầng đầy đủ', async () => {
      const res = await request(app)
        .get('/api/v1/system/health-stats')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const { data } = res.body;
      expect(typeof data.uptimeSeconds).toBe('number');
      expect(data.memory).toBeDefined();
      expect(typeof data.memory.heapUsedMb).toBe('number');
      expect(data.database).toBeDefined();
      expect(data.database.status).toBe('connected');
      expect(data.queues).toBeDefined();
      expect(data.alerting).toBeDefined();
    });
  });

  describe('POST /api/v1/system/test-alert', () => {
    it('trả về HTTP 200 khi gửi cảnh báo thử nghiệm thành công', async () => {
      vi.spyOn(alertService, 'testTelegramConnection').mockResolvedValueOnce({
        success: true,
        message: 'Gửi cảnh báo thử nghiệm tới Telegram thành công!',
      });

      const res = await request(app)
        .post('/api/v1/system/test-alert')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('thành công');
    });

    it('trả về HTTP 400 khi cấu hình Telegram không hợp lệ', async () => {
      vi.spyOn(alertService, 'testTelegramConnection').mockResolvedValueOnce({
        success: false,
        message: 'Chưa cấu hình TELEGRAM_BOT_TOKEN',
      });

      const res = await request(app)
        .post('/api/v1/system/test-alert')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Chưa cấu hình');
    });
  });
});
