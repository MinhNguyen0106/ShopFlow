/**
 * ShopFlow - Token Blacklist Service Unit Tests
 * File: backend/src/core/services/__tests__/token-blacklist.service.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { TokenBlacklistService } from '../token-blacklist.service.js';
import { ICacheService } from '../../../infrastructure/cache/cache.service.js';

describe('TokenBlacklistService Unit Tests', () => {
  let mockCache: ICacheService;
  let service: TokenBlacklistService;

  beforeEach(() => {
    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      invalidateByPattern: vi.fn(),
      getOrSet: vi.fn(),
      disconnect: vi.fn(),
    };

    service = new TokenBlacklistService(mockCache);
  });

  it('nên đưa token hợp lệ vào blacklist với TTL chính xác', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // Còn 1 tiếng
    const token = jwt.sign({ sub: 'user-1', exp: futureExp }, 'secret');

    await service.blacklistToken(token);

    expect(mockCache.set).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(mockCache.set).mock.calls[0];
    expect(callArgs).toBeDefined();
    const [key, value, ttl] = callArgs as [string, unknown, number];

    expect(key).toMatch(/^bl:token:[a-f0-9]{64}$/);
    expect(value).toBe(1);
    expect(ttl).toBeGreaterThan(3500);
    expect(ttl).toBeLessThanOrEqual(3600);
  });

  it('nên sử dụng TTL dự phòng 60s nếu token không chứa exp hợp lệ', async () => {
    const token = 'invalid-jwt-raw-string';

    await service.blacklistToken(token);

    expect(mockCache.set).toHaveBeenCalledWith(
      expect.stringMatching(/^bl:token:[a-f0-9]{64}$/),
      1,
      60
    );
  });

  it('không làm gì nếu token truyền vào rỗng', async () => {
    await service.blacklistToken('');
    expect(mockCache.set).not.toHaveBeenCalled();
  });

  it('nên trả về true nếu token đã bị blacklist', async () => {
    const token = 'sample-blacklisted-token';
    vi.mocked(mockCache.get).mockResolvedValueOnce(1);

    const isBlacklisted = await service.isTokenBlacklisted(token);

    expect(isBlacklisted).toBe(true);
    expect(mockCache.get).toHaveBeenCalledWith(
      expect.stringMatching(/^bl:token:[a-f0-9]{64}$/)
    );
  });

  it('nên trả về false nếu token không nằm trong blacklist', async () => {
    const token = 'clean-active-token';
    vi.mocked(mockCache.get).mockResolvedValueOnce(null);

    const isBlacklisted = await service.isTokenBlacklisted(token);

    expect(isBlacklisted).toBe(false);
  });

  it('nên fallback trả về false nếu cache gặp lỗi (graceful fail-open)', async () => {
    const token = 'clean-token';
    vi.mocked(mockCache.get).mockRejectedValueOnce(new Error('Redis connection lost'));

    const isBlacklisted = await service.isTokenBlacklisted(token);

    expect(isBlacklisted).toBe(false);
  });
});
