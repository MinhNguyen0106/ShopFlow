import { describe, it, expect } from 'vitest';
import { env } from '../env.js';

describe('Environment Configuration (Observability & Telemetry)', () => {
  it('phải có các trường cấu hình Observability mặc định', () => {
    expect(env).toBeDefined();
    expect(typeof env.ALERT_ENABLED).toBe('boolean');
    expect(env.ALERT_ENABLED).toBe(false);
  });

  it('phải cho phép truy xuất các thuộc tính telemetry an toàn', () => {
    expect(env.METRICS_AUTH_TOKEN).toBeUndefined();
    expect(env.TELEGRAM_BOT_TOKEN).toBeUndefined();
    expect(env.TELEGRAM_CHAT_ID).toBeUndefined();
  });
});
