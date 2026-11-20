import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface SystemAlertPayload {
  title: string;
  category: 'HTTP_5XX' | 'META_API_RATE_LIMIT' | 'BULLMQ_DLQ' | 'DB_CONNECTION' | 'MANUAL_TEST' | 'SYSTEM_CRASH';
  severity: AlertSeverity;
  message: string;
  metadata?: Record<string, unknown>;
  error?: Error | unknown;
}

export class AlertService {
  private cooldowns = new Map<string, { lastSent: number; count: number }>();
  private readonly defaultCooldownMs = 5 * 60 * 1000; // 5 phút

  /**
   * Định dạng tin nhắn gửi tới Telegram theo định dạng HTML
   */
  public formatTelegramMessage(payload: SystemAlertPayload, suppressedCount = 0): string {
    const icon = payload.severity === 'CRITICAL' ? '🚨' : payload.severity === 'WARNING' ? '⚠️' : 'ℹ️';
    const envName = env.NODE_ENV.toUpperCase();
    const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    let msg = `${icon} <b>[SHOPFLOW ALERT - ${payload.severity}]</b>\n\n`;
    msg += `<b>Môi trường:</b> <code>${envName}</code>\n`;
    msg += `<b>Danh mục:</b> <code>${payload.category}</code>\n`;
    msg += `<b>Thời gian:</b> ${timeStr}\n`;
    msg += `<b>Tiêu đề:</b> ${payload.title}\n`;
    msg += `<b>Chi tiết:</b> ${payload.message}\n`;

    if (payload.metadata && Object.keys(payload.metadata).length > 0) {
      msg += `\n<b>Thông số kỹ thuật:</b>\n<pre>${JSON.stringify(payload.metadata, null, 2)}</pre>`;
    }

    if (suppressedCount > 0) {
      msg += `\n<i>(Đã gom ${suppressedCount} lỗi tương tự trong 5 phút vừa qua)</i>`;
    }

    return msg;
  }

  /**
   * Gửi cảnh báo hệ thống tới Telegram Webhook có áp dụng cơ chế throttle
   */
  public async sendAlert(payload: SystemAlertPayload, skipThrottle = false): Promise<boolean> {
    const isEnabled = env.ALERT_ENABLED;
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;

    // Nếu không bật cảnh báo hoặc thiếu thông tin Telegram -> log cảnh báo và bỏ qua
    if (!isEnabled || !botToken || !chatId) {
      logger.debug(
        { category: payload.category, title: payload.title },
        '[AlertService] Cảnh báo Telegram tắt hoặc thiếu cấu hình TELEGRAM_BOT_TOKEN/CHAT_ID'
      );
      return false;
    }

    // Kiểm tra Cooldown chống bão thông báo (ngoại trừ MANUAL_TEST hoặc skipThrottle)
    const key = `${payload.category}:${payload.title}`;
    const now = Date.now();
    const existing = this.cooldowns.get(key);

    if (!skipThrottle && existing && now - existing.lastSent < this.defaultCooldownMs) {
      existing.count += 1;
      this.cooldowns.set(key, existing);
      logger.info(
        { category: payload.category, suppressedCount: existing.count },
        '[AlertService] Bỏ qua cảnh báo lặp lại (Throttled)'
      );
      return false;
    }

    const suppressedCount = existing ? existing.count : 0;
    this.cooldowns.set(key, { lastSent: now, count: 0 });

    const text = this.formatTelegramMessage(payload, suppressedCount);

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error({ status: response.status, body: errorBody }, '[AlertService] Lỗi khi gửi tin nhắn tới Telegram API');
        return false;
      }

      logger.info({ category: payload.category, title: payload.title }, '[AlertService] Đã gửi cảnh báo Telegram thành công');
      return true;
    } catch (err) {
      logger.error({ err }, '[AlertService] Ngoại lệ kết nối Telegram API');
      return false;
    }
  }

  /**
   * Kiểm tra kết nối cấu hình Telegram Bot
   */
  public async testTelegramConnection(): Promise<{ success: boolean; message: string }> {
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return {
        success: false,
        message: 'Chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong môi trường (.env)',
      };
    }

    const testPayload: SystemAlertPayload = {
      title: 'Kiểm tra kết nối kênh cảnh báo Telegram ShopFlow',
      category: 'MANUAL_TEST',
      severity: 'INFO',
      message: 'Hệ thống kết nối thành công tới Telegram Bot Webhook. Kênh cảnh báo đã sẵn sàng hoạt động!',
      metadata: {
        serverTime: new Date().toISOString(),
        nodeEnv: env.NODE_ENV,
      },
    };

    const ok = await this.sendAlert(testPayload, true);
    return {
      success: ok,
      message: ok
        ? 'Gửi cảnh báo thử nghiệm tới Telegram thành công!'
        : 'Không thể gửi tin nhắn tới Telegram. Vui lòng kiểm tra lại Bot Token và Chat ID.',
    };
  }

  /**
   * Dọn dẹp cache cooldown phục vụ testing
   */
  public resetCooldowns(): void {
    this.cooldowns.clear();
  }
}

export const alertService = new AlertService();
