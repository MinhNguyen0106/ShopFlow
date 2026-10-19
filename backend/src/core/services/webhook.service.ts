/**
 * ShopFlow - Webhook Domain Service
 * File: backend/src/core/services/webhook.service.ts
 *
 * Xử lý xác thực Handshake từ Meta và tiếp nhận (Ingest) sự kiện Webhook.
 */

import { env } from '../../config/env.js';
import {
  MetaWebhookPayload,
  extractWebhookEvents,
  NormalizedWebhookEvent,
} from '../../api/dtos/webhook.dto.js';
import {
  WebhookLogRepository,
  webhookLogRepository as defaultWebhookLogRepo,
} from '../../infrastructure/repositories/webhook-log.repository.js';
import { ForbiddenError } from '../errors/app-error.js';
import { logger } from '../../utils/logger.js';

export class WebhookService {
  constructor(
    private readonly webhookRepo: WebhookLogRepository = defaultWebhookLogRepo
  ) {}

  /**
   * Xác thực Meta Webhook Handshake (GET challenge).
   *
   * @param mode      - Thường là 'subscribe'
   * @param token     - FACEBOOK_VERIFY_TOKEN
   * @param challenge - Chuỗi số ngẫu nhiên Meta gửi sang
   * @returns Chuỗi challenge thô nếu hợp lệ
   */
  verifyHandshake(
    mode?: string,
    token?: string,
    challenge?: string
  ): string {
    const expectedToken = env.FACEBOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === expectedToken && challenge) {
      logger.info('[WebhookService] ✔ Xác thực Webhook Handshake thành công');
      return challenge;
    }

    logger.warn(
      { mode, hasToken: !!token, hasChallenge: !!challenge },
      '[WebhookService] ✘ Xác thực Webhook Handshake thất bại: verify_token hoặc mode không khớp'
    );
    throw new ForbiddenError(
      'Xác thực Webhook Handshake thất bại: verify_token hoặc mode không khớp.'
    );
  }

  /**
   * Tiếp nhận payload Webhook từ Meta, trích xuất sự kiện và lưu log Idempotent.
   *
   * @param payload - Payload JSON gửi từ Meta
   */
  async processIncomingWebhook(
    payload: MetaWebhookPayload
  ): Promise<{ received: number; events: NormalizedWebhookEvent[] }> {
    const events = extractWebhookEvents(payload);

    logger.info(
      { totalEvents: events.length, object: payload?.object },
      `[WebhookService] Tiếp nhận ${events.length} sự kiện webhook từ Meta`
    );

    // Ghi nhận sự kiện vào database (bảng webhook_logs) phục vụ Audit & Idempotency
    for (const event of events) {
      try {
        await this.webhookRepo.create({
          event_id:   event.eventId,
          page_id:    event.pageId,
          event_type: event.eventType,
          payload:    event.payload,
        });
      } catch (err) {
        // Không để lỗi DB chặn việc phản hồi 200 OK về Meta
        logger.error(
          { eventId: event.eventId, err: (err as Error).message },
          '[WebhookService] Lỗi khi lưu webhook log'
        );
      }
    }

    return {
      received: events.length,
      events,
    };
  }
}

export const webhookService = new WebhookService();
