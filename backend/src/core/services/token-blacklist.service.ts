/**
 * ShopFlow - Token Blacklist Service
 * File: backend/src/core/services/token-blacklist.service.ts
 *
 * Quản lý danh sách đen các token đã bị thu hồi (đăng xuất) bằng Redis.
 * Sử dụng mã băm SHA-256 để tiết kiệm bộ nhớ và tự động hết hạn theo TTL của JWT.
 */

import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ICacheService, cacheService as defaultCacheService } from '../../infrastructure/cache/cache.service.js';
import { logger } from '../../utils/logger.js';

export class TokenBlacklistService {
  constructor(
    private readonly cache: ICacheService = defaultCacheService
  ) {}

  /**
   * Tạo khóa băm SHA-256 an toàn từ chuỗi JWT token
   */
  private getCacheKey(token: string): string {
    const hash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    return `bl:token:${hash}`;
  }

  /**
   * Đưa token vào danh sách đen (Blacklist).
   * TTL được tự động tính dựa trên thời hạn `exp` còn lại của token.
   */
  async blacklistToken(token: string): Promise<void> {
    if (!token) return;

    try {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      const key = this.getCacheKey(token);

      if (decoded && typeof decoded.exp === 'number') {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const ttl = decoded.exp - nowInSeconds;

        if (ttl > 0) {
          await this.cache.set(key, 1, ttl);
          logger.info({ ttl, key }, '[TokenBlacklistService] Đã đưa token vào blacklist');
          return;
        }
      }

      // Nếu token đã hết hạn hoặc không có exp, gán TTL mặc định 60 giây
      await this.cache.set(key, 1, 60);
    } catch (error) {
      logger.warn({ error }, '[TokenBlacklistService] Lỗi khi đưa token vào blacklist');
    }
  }

  /**
   * Kiểm tra xem token có nằm trong danh sách đen hay không
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    if (!token) return false;

    try {
      const key = this.getCacheKey(token);
      const val = await this.cache.get<number>(key);
      return val !== null && val !== undefined;
    } catch (error) {
      logger.warn({ error }, '[TokenBlacklistService] Lỗi kiểm tra blacklist token, fallback false');
      return false;
    }
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
