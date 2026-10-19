/**
 * ShopFlow - Meta Graph API Client
 * File: backend/src/infrastructure/meta/graph-api.client.ts
 *
 * Client tương tác trực tiếp với Meta Graph API v19+ (Pages API, Comments).
 * Đảm bảo timeout ngắn (< 2.5s) để toàn bộ chu trình hoàn thành trong < 3 giây.
 */

import { logger } from '../../utils/logger.js';

export interface HideCommentResult {
  success: boolean;
  commentId: string;
  error?: string;
}

export class MetaGraphApiClient {
  private readonly baseUrl: string;

  constructor(apiVersion: string = 'v19.0') {
    this.baseUrl = `https://graph.facebook.com/${apiVersion}`;
  }

  /**
   * Gọi Graph API để ẩn bình luận vi phạm hoặc chứa số điện thoại riêng tư.
   * Endpoint: POST /{comment-id} với tham số is_hidden=true & access_token={page_access_token}
   *
   * @param commentId       - Facebook Comment ID
   * @param pageAccessToken - Page Access Token của Fanpage sở hữu bài viết
   * @param timeoutMs       - Thời gian timeout tối đa (mặc định 2500ms để đảm bảo < 3s)
   */
  async hideComment(
    commentId: string,
    pageAccessToken: string,
    timeoutMs: number = 2500
  ): Promise<HideCommentResult> {
    const url = `${this.baseUrl}/${encodeURIComponent(commentId)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_hidden: true,
          access_token: pageAccessToken,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as {
          error?: { message?: string; code?: number };
        };
        const errorMsg =
          errorBody.error?.message || `HTTP ${response.status} ${response.statusText}`;

        logger.error(
          { commentId, status: response.status, error: errorMsg },
          '[MetaGraphApiClient] ✘ Gọi API ẩn bình luận thất bại'
        );

        return {
          success: false,
          commentId,
          error: errorMsg,
        };
      }

      logger.info(
        { commentId },
        '[MetaGraphApiClient] ✔ Ẩn bình luận Facebook thành công qua Graph API'
      );

      return {
        success: true,
        commentId,
      };
    } catch (err) {
      clearTimeout(timer);
      const isTimeout = (err as Error).name === 'AbortError';
      const errorMsg = isTimeout
        ? `Graph API request timeout sau ${timeoutMs}ms`
        : (err as Error).message;

      logger.error(
        { commentId, error: errorMsg, isTimeout },
        '[MetaGraphApiClient] ✘ Lỗi kết nối khi gọi Graph API'
      );

      return {
        success: false,
        commentId,
        error: errorMsg,
      };
    }
  }
}

export const metaGraphApiClient = new MetaGraphApiClient();
