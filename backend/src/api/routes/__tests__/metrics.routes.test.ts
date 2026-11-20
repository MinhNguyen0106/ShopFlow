import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app.js';
import { env } from '../../../config/env.js';

describe('Metrics Routes (GET /metrics)', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    vi.restoreAllMocks();
    app = createApp();
  });

  it('phải trả về HTTP 200 với nội dung Prometheus text khi không cấu hình token bí mật', async () => {
    // Đảm bảo không có secret token
    (env as { METRICS_AUTH_TOKEN?: string }).METRICS_AUTH_TOKEN = undefined;

    const res = await request(app).get('/metrics');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('shopflow_');
  });

  it('phải từ chối truy cập HTTP 401 khi có cấu hình token nhưng client không gửi token', async () => {
    (env as { METRICS_AUTH_TOKEN?: string }).METRICS_AUTH_TOKEN = 'secret_metrics_token_123';

    const res = await request(app).get('/metrics');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Unauthorized');
  });

  it('phải từ chối truy cập HTTP 401 khi client gửi sai token', async () => {
    (env as { METRICS_AUTH_TOKEN?: string }).METRICS_AUTH_TOKEN = 'secret_metrics_token_123';

    const res = await request(app)
      .get('/metrics')
      .set('Authorization', 'Bearer wrong_token');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('phải trả về HTTP 200 khi client gửi đúng Authorization Bearer token', async () => {
    (env as { METRICS_AUTH_TOKEN?: string }).METRICS_AUTH_TOKEN = 'secret_metrics_token_123';

    const res = await request(app)
      .get('/metrics')
      .set('Authorization', 'Bearer secret_metrics_token_123');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.text).toContain('shopflow_');

    // Dọn dẹp lại env
    (env as { METRICS_AUTH_TOKEN?: string }).METRICS_AUTH_TOKEN = undefined;
  });

  it('phải trả về HTTP 200 khi client gửi đúng header x-metrics-token', async () => {
    (env as { METRICS_AUTH_TOKEN?: string }).METRICS_AUTH_TOKEN = 'secret_metrics_token_123';

    const res = await request(app)
      .get('/metrics')
      .set('x-metrics-token', 'secret_metrics_token_123');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');

    // Dọn dẹp lại env
    (env as { METRICS_AUTH_TOKEN?: string }).METRICS_AUTH_TOKEN = undefined;
  });

  it('metricsMiddleware phải tự động ghi nhận request vào chỉ số sau khi gọi route bất kỳ', async () => {
    (env as { METRICS_AUTH_TOKEN?: string }).METRICS_AUTH_TOKEN = undefined;

    // Gửi request tới /health
    await request(app).get('/health');

    // Kiểm tra /metrics có ghi nhận
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('shopflow_http_requests_total');
  });
});
