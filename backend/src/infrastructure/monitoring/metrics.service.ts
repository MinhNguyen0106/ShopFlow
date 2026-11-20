import client, { Registry, Counter, Histogram, Gauge } from 'prom-client';

export class MetricsService {
  private registry: Registry;
  public httpRequestsTotal: Counter<string>;
  public httpRequestDurationSeconds: Histogram<string>;
  public dbPoolConnections: Gauge<string>;
  public bullmqQueueJobs: Gauge<string>;

  constructor() {
    this.registry = new Registry();

    // Thu thập default metrics (CPU, RAM, Event Loop)
    client.collectDefaultMetrics({
      register: this.registry,
      prefix: 'shopflow_',
    });

    // 1. HTTP Requests Counter
    this.httpRequestsTotal = new Counter({
      name: 'shopflow_http_requests_total',
      help: 'Tổng số lượng HTTP requests tiếp nhận theo phương thức, route và status code',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    // 2. HTTP Request Duration Histogram
    this.httpRequestDurationSeconds = new Histogram({
      name: 'shopflow_http_request_duration_seconds',
      help: 'Thời gian phản hồi HTTP request theo giây (latency duration)',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    // 3. PostgreSQL Database Pool Gauge
    this.dbPoolConnections = new Gauge({
      name: 'shopflow_db_pool_connections',
      help: 'Số lượng kết nối cơ sở dữ liệu PostgreSQL trong pool theo trạng thái',
      labelNames: ['state'],
      registers: [this.registry],
    });

    // 4. BullMQ Queue Jobs Gauge
    this.bullmqQueueJobs = new Gauge({
      name: 'shopflow_bullmq_queue_jobs',
      help: 'Số lượng jobs trong các hàng đợi BullMQ theo trạng thái',
      labelNames: ['queue_name', 'status'],
      registers: [this.registry],
    });
  }

  /**
   * Chuẩn hóa route path để tránh high-cardinality label leak
   */
  public normalizeRoute(path: string): string {
    if (!path) return 'unknown';
    // Thay thế UUID v4 bằng :id
    let normalized = path.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id');
    // Thay thế numeric ID bằng :id
    normalized = normalized.replace(/\/\d+(?=\/|$)/g, '/:id');
    // Loại bỏ query string nếu có
    const queryIndex = normalized.indexOf('?');
    if (queryIndex !== -1) {
      normalized = normalized.slice(0, queryIndex);
    }
    return normalized;
  }

  /**
   * Ghi nhận HTTP Request Metric
   */
  public recordHttpRequest(method: string, route: string, statusCode: number, durationSeconds: number): void {
    const cleanRoute = this.normalizeRoute(route);
    const statusStr = statusCode.toString();

    this.httpRequestsTotal.inc({
      method: method.toUpperCase(),
      route: cleanRoute,
      status_code: statusStr,
    });

    this.httpRequestDurationSeconds.observe(
      {
        method: method.toUpperCase(),
        route: cleanRoute,
        status_code: statusStr,
      },
      durationSeconds
    );
  }

  /**
   * Cập nhật chỉ số kết nối Database Pool
   */
  public updateDbPoolMetrics(active: number, idle: number, waiting: number): void {
    this.dbPoolConnections.set({ state: 'active' }, active);
    this.dbPoolConnections.set({ state: 'idle' }, idle);
    this.dbPoolConnections.set({ state: 'waiting' }, waiting);
  }

  /**
   * Cập nhật chỉ số hàng đợi BullMQ
   */
  public updateQueueMetrics(queueName: string, status: 'waiting' | 'active' | 'failed' | 'delayed', count: number): void {
    this.bullmqQueueJobs.set({ queue_name: queueName, status }, count);
  }

  /**
   * Xuất toàn bộ metrics định dạng text/plain chuẩn Prometheus
   */
  public async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Lấy Content-Type header chuẩn cho endpoint Prometheus
   */
  public getContentType(): string {
    return this.registry.contentType;
  }

  /**
   * Xóa toàn bộ metrics phục vụ testing cô lập
   */
  public clearRegistry(): void {
    this.registry.clear();
  }
}

export const metricsService = new MetricsService();
