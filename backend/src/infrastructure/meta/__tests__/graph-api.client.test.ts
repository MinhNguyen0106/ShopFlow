/**
 * ShopFlow - Unit Tests: graph-api.client.ts
 * File: backend/src/infrastructure/meta/__tests__/graph-api.client.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MetaGraphApiClient } from '../graph-api.client.js';

describe('MetaGraphApiClient — hideComment()', () => {
  let client: MetaGraphApiClient;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    client = new MetaGraphApiClient('v19.0');
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('gọi đúng URL và headers khi ẩn bình luận thành công', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    });
    globalThis.fetch = mockFetch;

    const result = await client.hideComment('cmt_999', 'EAA_token_test');

    expect(result.success).toBe(true);
    expect(result.commentId).toBe('cmt_999');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://graph.facebook.com/v19.0/cmt_999',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_hidden: true, access_token: 'EAA_token_test' }),
      })
    );
  });

  it('xử lý lỗi khi Graph API trả về HTTP 400/500 có body lỗi', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: vi.fn().mockResolvedValue({
        error: { message: 'Invalid OAuth access token.', code: 190 },
      }),
    });
    globalThis.fetch = mockFetch;

    const result = await client.hideComment('cmt_err_token', 'EAA_invalid_token');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid OAuth access token.');
  });

  it('xử lý khi fetch ném ra ngoại lệ mạng hoặc AbortError (timeout)', async () => {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    const mockFetch = vi.fn().mockRejectedValue(abortError);
    globalThis.fetch = mockFetch;

    const result = await client.hideComment('cmt_timeout', 'EAA_token_test', 100);

    expect(result.success).toBe(false);
    expect(result.error).toContain('timeout');
  });
});
