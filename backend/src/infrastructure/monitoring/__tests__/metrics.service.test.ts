import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsService } from '../metrics.service.js';

describe('MetricsService (Prometheus Monitoring)', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  it('phải chuẩn hóa route URL chứa UUID và số ID để tránh high-cardinality', () => {
    expect(service.normalizeRoute('/api/v1/inbox/conversations/123e4567-e89b-12d3-a456-426614174000/messages'))
      .toBe('/api/v1/inbox/conversations/:id/messages');

    expect(service.normalizeRoute('/api/v1/posts/999/status?page=1'))
      .toBe('/api/v1/posts/:id/status');

    expect(service.normalizeRoute('/health')).toBe('/health');
  });

  it('phải ghi nhận số lượng request và duration vào Counter & Histogram', async () => {
    service.recordHttpRequest('GET', '/api/v1/inbox', 200, 0.125);

    const metricsOutput = await service.getMetrics();
    expect(metricsOutput).toContain('shopflow_http_requests_total');
    expect(metricsOutput).toContain('method="GET"');
    expect(metricsOutput).toContain('route="/api/v1/inbox"');
    expect(metricsOutput).toContain('status_code="200"');
    expect(metricsOutput).toContain('shopflow_http_request_duration_seconds');
  });

  it('phải cập nhật và xuất các chỉ số kết nối Database Pool', async () => {
    service.updateDbPoolMetrics(5, 10, 0);

    const metricsOutput = await service.getMetrics();
    expect(metricsOutput).toContain('shopflow_db_pool_connections{state="active"} 5');
    expect(metricsOutput).toContain('shopflow_db_pool_connections{state="idle"} 10');
    expect(metricsOutput).toContain('shopflow_db_pool_connections{state="waiting"} 0');
  });

  it('phải cập nhật và xuất các chỉ số trạng thái hàng đợi BullMQ', async () => {
    service.updateQueueMetrics('webhook-queue', 'waiting', 42);
    service.updateQueueMetrics('webhook-queue', 'failed', 2);

    const metricsOutput = await service.getMetrics();
    expect(metricsOutput).toContain('shopflow_bullmq_queue_jobs{queue_name="webhook-queue",status="waiting"} 42');
    expect(metricsOutput).toContain('shopflow_bullmq_queue_jobs{queue_name="webhook-queue",status="failed"} 2');
  });

  it('phải trả về đúng contentType chuẩn Prometheus', () => {
    const contentType = service.getContentType();
    expect(contentType).toContain('text/plain');
    expect(contentType).toContain('version=0.0.4');
  });
});
