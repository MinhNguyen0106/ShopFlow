import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AlertService, SystemAlertPayload } from '../alert.service.js';
import { env } from '../../../config/env.js';

describe('AlertService (Telegram Alerting Engine)', () => {
  let alertService: AlertService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    alertService = new AlertService();
    alertService.resetCooldowns();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('phải định dạng tin nhắn HTML Telegram chính xác', () => {
    const payload: SystemAlertPayload = {
      title: 'Lỗi máy chủ 500',
      category: 'HTTP_5XX',
      severity: 'CRITICAL',
      message: 'Database connection failed',
      metadata: { path: '/api/v1/orders' },
    };

    const formatted = alertService.formatTelegramMessage(payload, 2);
    expect(formatted).toContain('🚨 <b>[SHOPFLOW ALERT - CRITICAL]</b>');
    expect(formatted).toContain('HTTP_5XX');
    expect(formatted).toContain('Lỗi máy chủ 500');
    expect(formatted).toContain('Database connection failed');
    expect(formatted).toContain('path');
    expect(formatted).toContain('Đã gom 2 lỗi tương tự');
  });

  it('không gửi cảnh báo khi ALERT_ENABLED = false', async () => {
    (env as any).ALERT_ENABLED = false;
    (env as any).TELEGRAM_BOT_TOKEN = 'mock_token';
    (env as any).TELEGRAM_CHAT_ID = '123456';

    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    const payload: SystemAlertPayload = {
      title: 'Test Alert',
      category: 'MANUAL_TEST',
      severity: 'INFO',
      message: 'Test message',
    };

    const sent = await alertService.sendAlert(payload);
    expect(sent).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('gửi cảnh báo thành công khi bật ALERT_ENABLED và có đầy đủ Bot Token + Chat ID', async () => {
    (env as any).ALERT_ENABLED = true;
    (env as any).TELEGRAM_BOT_TOKEN = 'mock_token_123';
    (env as any).TELEGRAM_CHAT_ID = 'chat_999';

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });
    global.fetch = mockFetch as any;

    const payload: SystemAlertPayload = {
      title: 'Meta API 613 Hit',
      category: 'META_API_RATE_LIMIT',
      severity: 'CRITICAL',
      message: 'Rate limit 4800 calls reached',
    };

    const sent = await alertService.sendAlert(payload);
    expect(sent).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/botmock_token_123/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('phải áp dụng cơ chế throttle 5 phút cho các cảnh báo cùng loại liên tiếp', async () => {
    (env as any).ALERT_ENABLED = true;
    (env as any).TELEGRAM_BOT_TOKEN = 'mock_token_123';
    (env as any).TELEGRAM_CHAT_ID = 'chat_999';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    global.fetch = mockFetch as any;

    const payload: SystemAlertPayload = {
      title: 'DLQ Job Failed',
      category: 'BULLMQ_DLQ',
      severity: 'WARNING',
      message: 'Job #123 failed after 5 retries',
    };

    // Lần 1: gửi thành công
    const firstCall = await alertService.sendAlert(payload);
    expect(firstCall).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Lần 2 (ngay sau đó): bị throttle, không gọi fetch
    const secondCall = await alertService.sendAlert(payload);
    expect(secondCall).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('testTelegramConnection trả về thông báo lỗi nếu thiếu cấu hình Bot Token', async () => {
    (env as any).TELEGRAM_BOT_TOKEN = undefined;
    (env as any).TELEGRAM_CHAT_ID = undefined;

    const res = await alertService.testTelegramConnection();
    expect(res.success).toBe(false);
    expect(res.message).toContain('Chưa cấu hình');
  });
});
