import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { healthRouter } from './api/routes/health.routes.js';
import { apiV1Router } from './api/routes/index.js';

export function createApp(): express.Application {
  const app = express();

  // Security middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Body parser with raw body buffer retention for Meta Webhook HMAC-SHA256 verification
  app.use(
    express.json({
      verify: (req: Request, _res: Response, buf: Buffer) => {
        // Gán rawBody để verifyMetaSignature sử dụng trong Task-07
        (req as unknown as { rawBody?: Buffer }).rawBody = buf;
      },
      limit: '10mb',
    })
  );

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(
        {
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          durationMs: duration,
        },
        `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
      );
    });
    next();
  });

  // Base Health Check
  app.use('/health', healthRouter);

  // API v1 Routes
  app.use(env.API_PREFIX, apiV1Router);

  // 404 Route Not Found Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống.`,
      },
    });
  });

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, `Unhandled Exception: ${err.message}`);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: env.NODE_ENV === 'production' ? 'Đã xảy ra lỗi nội bộ máy chủ.' : err.message,
      },
    });
  });

  return app;
}
