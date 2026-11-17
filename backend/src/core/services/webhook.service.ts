/**
 * ShopFlow - Webhook Domain Service
 * File: backend/src/core/services/webhook.service.ts
 *
 * Xử lý xác thực Handshake từ Meta và tiếp nhận (Ingest) sự kiện Webhook (Comment, Messenger).
 */

import { env } from '../../config/env.js';
import {
  MetaWebhookPayload,
  MetaWebhookMessagingItem,
  extractWebhookEvents,
  NormalizedWebhookEvent,
} from '../../api/dtos/webhook.dto.js';
import {
  WebhookLogRepository,
  webhookLogRepository as defaultWebhookLogRepo,
} from '../../infrastructure/repositories/webhook-log.repository.js';
import {
  ConnectedPageRepository,
  connectedPageRepository as defaultConnectedPageRepo,
} from '../../infrastructure/repositories/connected-page.repository.js';
import {
  CustomerRepository,
  customerRepository as defaultCustomerRepo,
} from '../../infrastructure/repositories/customer.repository.js';
import {
  MessageCommentRepository,
  messageCommentRepository as defaultMessageCommentRepo,
} from '../../infrastructure/repositories/message-comment.repository.js';
import {
  MetaGraphApiClient,
  metaGraphApiClient as defaultMetaGraphClient,
} from '../../infrastructure/meta/graph-api.client.js';
import {
  SocketService,
  socketService as defaultSocketService,
} from './socket.service.js';
import {
  phoneMaskingQueue as defaultPhoneMaskingQueue,
  PhoneMaskingJobData,
  automationReplyQueue as defaultAutomationReplyQueue,
  AutomationReplyJobData,
} from '../../infrastructure/queue/bullmq.client.js';
import { Queue } from 'bullmq';
import { decryptToken } from '../../utils/crypto.helper.js';
import { ForbiddenError } from '../errors/app-error.js';
import { logger } from '../../utils/logger.js';

export class WebhookService {
  constructor(
    private readonly webhookRepo: WebhookLogRepository = defaultWebhookLogRepo,
    private readonly phoneQueue: Queue<PhoneMaskingJobData> = defaultPhoneMaskingQueue,
    private readonly replyQueue: Queue<AutomationReplyJobData> = defaultAutomationReplyQueue,
    private readonly pageRepo: ConnectedPageRepository = defaultConnectedPageRepo,
    private readonly customerRepo: CustomerRepository = defaultCustomerRepo,
    private readonly messageCommentRepo: MessageCommentRepository = defaultMessageCommentRepo,
    private readonly graphClient: MetaGraphApiClient = defaultMetaGraphClient,
    private readonly socketSvc: SocketService = defaultSocketService
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

        // 1. Xử lý sự kiện tin nhắn Messenger (Customer Inbound Message)
        if (event.eventType === 'message') {
          const item = (event.payload || {}) as MetaWebhookMessagingItem;
          const senderFbId = item.sender?.id;
          const recipientFbId = item.recipient?.id;
          const isEcho = Boolean((item.message as Record<string, unknown> | undefined)?.is_echo);
          const messageText = item.message?.text || '';
          const mid = item.message?.mid || event.eventId;
          const attachments = item.message?.attachments;

          // Bỏ qua tin nhắn echo từ chính Fanpage
          if (senderFbId && !isEcho && senderFbId !== event.pageId) {
            const connectedPage = await this.pageRepo.findByPageId(event.pageId || recipientFbId || '');
            if (connectedPage) {
              let senderName = 'Khách hàng Facebook';
              try {
                if (connectedPage.page_access_token) {
                  const plainToken = decryptToken(connectedPage.page_access_token);
                  const profile = await this.graphClient.getCustomerProfile(senderFbId, plainToken);
                  if (profile?.name) {
                    senderName = profile.name;
                  } else if (profile?.first_name) {
                    senderName = `${profile.first_name} ${profile.last_name || ''}`.trim();
                  }
                }
              } catch {
                // Bỏ qua lỗi gọi Meta Graph API
              }

              const customer = await this.customerRepo.upsertMessengerCustomer(
                connectedPage.id,
                senderFbId,
                senderName
              );

              const conversation = await this.messageCommentRepo.ensureConversation(
                connectedPage.id,
                customer.id,
                senderFbId,
                'messenger'
              );

              const savedMessage = await this.messageCommentRepo.saveCustomerMessage({
                conversationId: conversation.id,
                pageId: connectedPage.id,
                metaId: mid,
                senderFbId,
                content: messageText,
                mediaPayload: attachments,
              });

              // Phát sự kiện Socket.io thời gian thực tới phòng Fanpage
              this.socketSvc.emitNewInboxItem(connectedPage.id, {
                event: 'NEW_INBOX_ITEM',
                page_id: connectedPage.id,
                conversation_id: conversation.id,
                type: 'messenger',
                customer: {
                  id: customer.id,
                  customer_fb_id: customer.customer_fb_id,
                  customer_name: customer.customer_name,
                  phone_number: customer.phone_number,
                  tags: customer.tags || [],
                },
                message: {
                  id: savedMessage.id,
                  meta_id: savedMessage.meta_id,
                  sender_type: 'customer',
                  sender_fb_id: senderFbId,
                  content: savedMessage.content,
                  is_hidden: false,
                  private_reply_sent: false,
                  media_payload: savedMessage.media_payload,
                  created_at: savedMessage.created_at,
                },
                unread_count: 1,
                window_24h_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
              });

              logger.info(
                { pageId: connectedPage.id, customerId: customer.id, messageId: savedMessage.id },
                '[WebhookService] ✔ Đã tiếp nhận và đồng bộ tin nhắn Messenger vào Hộp thư Live Chat'
              );
            }
          }
        }

        // 2. Nếu là sự kiện bình luận (comment), đẩy ngay vào hàng đợi phone-masking-queue
        if (event.eventType === 'comment') {
          const val = (event.payload || {}) as Record<string, unknown>;
          const from = (val.from || {}) as Record<string, string>;

          await this.phoneQueue.add(
            'mask-phone-in-comment',
            {
              eventId:     event.eventId,
              pageId:      event.pageId || '',
              commentId:   (val.comment_id as string) || event.eventId,
              postId:      val.post_id as string | undefined,
              fromId:      from.id || '',
              fromName:    from.name,
              message:     (val.message as string) || '',
              createdTime: val.created_time as number | undefined,
              rawPayload:  event.payload,
            },
            {
              jobId: `comment-${event.eventId}`, // Đảm bảo Idempotency không enqueue trùng
            }
          ).catch((queueErr) => {
            logger.error(
              { eventId: event.eventId, err: (queueErr as Error).message },
              '[WebhookService] Lỗi khi đưa bình luận vào phone-masking-queue'
            );
          });

          // 3. Đưa vào hàng đợi automation-reply-queue xử lý kịch bản tự động
          if (this.replyQueue) {
            await this.replyQueue.add(
              'automation-reply-to-comment',
              {
                commentId:   (val.comment_id as string) || event.eventId,
                postId:      val.post_id as string | undefined,
                pageId:      event.pageId || '',
                senderFbId:  from.id || '',
                senderName:  from.name,
                commentText: (val.message as string) || '',
              },
              {
                jobId: `reply-${event.eventId}`,
              }
            ).catch((queueErr) => {
              logger.error(
                { eventId: event.eventId, err: (queueErr as Error).message },
                '[WebhookService] Lỗi khi đưa bình luận vào automation-reply-queue'
              );
            });
          }
        }
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
