import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../../infrastructure/monitoring/metrics.service.js';

/**
 * Middleware đo lường độ trễ và số lượng HTTP requests xuất sang Prometheus
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Bỏ qua chính endpoint /metrics để không làm sai lệch số liệu
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;
    const route = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;

    metricsService.recordHttpRequest(req.method, route, res.statusCode, durationSeconds);
  });

  next();
}
