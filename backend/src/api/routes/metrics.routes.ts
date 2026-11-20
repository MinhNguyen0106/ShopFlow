import { Router, Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';
import { metricsService } from '../../infrastructure/monitoring/metrics.service.js';

export const metricsRouter = Router();

/**
 * Middleware bảo vệ endpoint /metrics khi có cấu hình METRICS_AUTH_TOKEN
 */
export function verifyMetricsAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = env.METRICS_AUTH_TOKEN;
  if (!secret) {
    // Không cấu hình token -> mở công khai cho Prometheus Scraper
    return next();
  }

  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-metrics-token'];

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const providedToken = bearerToken || customHeader;

  if (!providedToken || providedToken !== secret) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing Prometheus metrics authentication token',
    });
    return;
  }

  next();
}

metricsRouter.get('/', verifyMetricsAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.setHeader('Content-Type', metricsService.getContentType());
    const metrics = await metricsService.getMetrics();
    res.status(200).send(metrics);
  } catch (error) {
    next(error);
  }
});
