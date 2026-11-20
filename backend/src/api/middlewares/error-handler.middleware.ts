/**
 * ShopFlow - Global Error Handler Middleware
 * File: backend/src/api/middlewares/error-handler.middleware.ts
 *
 * Xử lý ngoại lệ tập trung cho toàn bộ ứng dụng Express:
 *   - AppError và các lớp con (ValidationError, NotFoundError, UnauthorizedError, ...)
 *   - ZodError
 *   - SyntaxError (ví dụ: JSON body không hợp lệ)
 *   - Unhandled Internal Server Errors (500)
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../core/errors/app-error.js';
import { formatZodIssues } from './validate-request.middleware.js';
import { logger } from '../../utils/logger.js';
import { env } from '../../config/env.js';
import { alertService } from '../../core/services/alert.service.js';

/**
 * 404 Not Found Middleware xử lý khi route không tồn tại.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code:    'NOT_FOUND',
      message: `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống.`,
    },
  });
}

/**
 * Global Error Handler Middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Xử lý AppError (Lỗi nghiệp vụ đã định nghĩa có kiểm soát)
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(
        {
          code:       err.code,
          statusCode: err.statusCode,
          url:        req.originalUrl,
          method:     req.method,
          err:        err.message,
          stack:      err.stack,
        },
        '[errorHandler] Lỗi hệ thống AppError'
      );

      // Tự động kích hoạt cảnh báo Telegram cho lỗi hệ thống 5xx
      alertService.sendAlert({
        title: `AppError 5xx: ${err.code}`,
        category: 'HTTP_5XX',
        severity: 'CRITICAL',
        message: err.message,
        metadata: {
          method: req.method,
          url: req.originalUrl,
          statusCode: err.statusCode,
        },
      }).catch(() => {});
    } else {
      logger.warn(
        {
          code:       err.code,
          statusCode: err.statusCode,
          url:        req.originalUrl,
          method:     req.method,
          message:    err.message,
        },
        `[errorHandler] Lỗi nghiệp vụ ${err.code}`
      );
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code:    err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // 2. Xử lý ZodError nếu được pass trực tiếp vào next(err)
  if (err instanceof ZodError) {
    const details = formatZodIssues(err.issues);
    logger.warn(
      {
        url:     req.originalUrl,
        method:  req.method,
        details,
      },
      '[errorHandler] ZodError từ controller/service'
    );

    res.status(400).json({
      success: false,
      error: {
        code:    'VALIDATION_ERROR',
        message: 'Dữ liệu yêu cầu không hợp lệ',
        details,
      },
    });
    return;
  }

  // 3. Xử lý lỗi parse JSON body (SyntaxError từ express.json)
  if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
    logger.warn(
      { url: req.originalUrl, method: req.method },
      '[errorHandler] Cú pháp JSON trong request body không hợp lệ'
    );

    res.status(400).json({
      success: false,
      error: {
        code:    'BAD_REQUEST',
        message: 'Cú pháp JSON trong nội dung yêu cầu không hợp lệ.',
      },
    });
    return;
  }

  // 4. Lỗi máy chủ không kiểm soát được (Unhandled Internal Server Error 500)
  logger.error(
    {
      url:    req.originalUrl,
      method: req.method,
      err:    err.message,
      stack:  err.stack,
    },
    '[errorHandler] Unhandled Exception xảy ra'
  );

  // Tự động kích hoạt cảnh báo Telegram cho Unhandled 500
  alertService.sendAlert({
    title: `Unhandled 500: ${err.name || 'Error'}`,
    category: 'HTTP_5XX',
    severity: 'CRITICAL',
    message: err.message,
    metadata: {
      method: req.method,
      url: req.originalUrl,
      stack: err.stack ? err.stack.slice(0, 400) : undefined,
    },
  }).catch(() => {});

  const isProduction = env.NODE_ENV === 'production';
  res.status(500).json({
    success: false,
    error: {
      code:    'INTERNAL_SERVER_ERROR',
      message: isProduction
        ? 'Đã xảy ra lỗi nội bộ máy chủ. Vui lòng thử lại sau.'
        : err.message,
    },
  });
}
