import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.js';
import { getPoolStats } from '../../infrastructure/database/db.client.js';
import { alertService } from '../../core/services/alert.service.js';
import { metricsService } from '../../infrastructure/monitoring/metrics.service.js';
import {
  webhookProcessingQueue,
  phoneMaskingQueue,
  automationReplyQueue,
  scheduledPostQueue,
} from '../../infrastructure/queue/bullmq.client.js';

export class SystemController {
  /**
   * GET /api/v1/system/health-stats
   * Trả về tổng quan chỉ số sức khỏe hạ tầng thời gian thực
   */
  public async getHealthStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dbStats = getPoolStats();
      const activeConnections = Math.max(0, dbStats.total - dbStats.idle);
      metricsService.updateDbPoolMetrics(activeConnections, dbStats.idle, dbStats.waiting);

      // Thống kê job counts từ các queues của BullMQ
      let queueStats = {
        webhookProcessing: { waiting: 0, active: 0, failed: 0 },
        phoneMasking: { waiting: 0, active: 0, failed: 0 },
        automationReply: { waiting: 0, active: 0, failed: 0 },
        scheduledPost: { waiting: 0, active: 0, failed: 0 },
      };

      try {
        const fetchJobCountsPromise = Promise.allSettled([
          webhookProcessingQueue.getJobCounts('waiting', 'active', 'failed'),
          phoneMaskingQueue.getJobCounts('waiting', 'active', 'failed'),
          automationReplyQueue.getJobCounts('waiting', 'active', 'failed'),
          scheduledPostQueue.getJobCounts('waiting', 'active', 'failed'),
        ]);

        // Giới hạn timeout 300ms để không làm chậm API nếu Redis đang mất kết nối
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Queue stats timeout')), 300)
        );

        const results = (await Promise.race([fetchJobCountsPromise, timeoutPromise])) as PromiseSettledResult<any>[];

        const [webhookCounts, phoneCounts, replyCounts, postCounts] = results;

        if (webhookCounts && webhookCounts.status === 'fulfilled') {
          queueStats.webhookProcessing = {
            waiting: webhookCounts.value.waiting || 0,
            active: webhookCounts.value.active || 0,
            failed: webhookCounts.value.failed || 0,
          };
        }
        if (phoneCounts && phoneCounts.status === 'fulfilled') {
          queueStats.phoneMasking = {
            waiting: phoneCounts.value.waiting || 0,
            active: phoneCounts.value.active || 0,
            failed: phoneCounts.value.failed || 0,
          };
        }
        if (replyCounts && replyCounts.status === 'fulfilled') {
          queueStats.automationReply = {
            waiting: replyCounts.value.waiting || 0,
            active: replyCounts.value.active || 0,
            failed: replyCounts.value.failed || 0,
          };
        }
        if (postCounts && postCounts.status === 'fulfilled') {
          queueStats.scheduledPost = {
            waiting: postCounts.value.waiting || 0,
            active: postCounts.value.active || 0,
            failed: postCounts.value.failed || 0,
          };
        }
      } catch {
        // Bỏ qua nếu Redis chưa sẵn sàng hoặc timeout
      }

      const mem = process.memoryUsage();

      res.status(200).json({
        success: true,
        data: {
          uptimeSeconds: Math.floor(process.uptime()),
          nodeEnv: env.NODE_ENV,
          memory: {
            heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
            heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
            rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
          },
          database: {
            status: 'connected',
            totalConnections: dbStats.total,
            activeConnections,
            idleConnections: dbStats.idle,
            waitingRequests: dbStats.waiting,
          },
          queues: queueStats,
          alerting: {
            enabled: env.ALERT_ENABLED,
            hasBotToken: Boolean(env.TELEGRAM_BOT_TOKEN),
            hasChatId: Boolean(env.TELEGRAM_CHAT_ID),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/system/test-alert
   * Gửi cảnh báo thử nghiệm tới Telegram
   */
  public async testAlert(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await alertService.testTelegramConnection();
      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const systemController = new SystemController();
