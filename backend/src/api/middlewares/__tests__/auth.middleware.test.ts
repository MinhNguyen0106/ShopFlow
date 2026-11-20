/**
 * ShopFlow - Unit Tests: auth.middleware.ts
 * File: backend/src/api/middlewares/__tests__/auth.middleware.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../auth.middleware.js';
import { generateTokens } from '../../../utils/auth.helper.js';
import { UnauthorizedError, ForbiddenError } from '../../../core/errors/app-error.js';
import { tokenBlacklistService } from '../../../core/services/token-blacklist.service.js';

function createMocks(headers: Record<string, string> = {}) {
  const req = {
    headers: { ...headers },
  } as unknown as Request;

  const res = {} as Response;
  const next = vi.fn() as unknown as NextFunction;

  return { req, res, next };
}

describe('authenticateToken() middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('nên gọi next với UnauthorizedError khi không có header Authorization', async () => {
    const { req, res, next } = createMocks();

    await authenticateToken(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('nên gọi next với UnauthorizedError khi header không có tiền tố Bearer', async () => {
    const { req, res, next } = createMocks({ authorization: 'Basic dXNlcjpwYXNz' });

    await authenticateToken(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Định dạng Authorization header không hợp lệ. Chuẩn bắt buộc: Bearer <token>.',
      })
    );
  });

  it('nên gọi next với UnauthorizedError khi token bị thiếu sau Bearer', async () => {
    const { req, res, next } = createMocks({ authorization: 'Bearer ' });

    await authenticateToken(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('nên từ chối và gọi next với UnauthorizedError khi token đã bị đưa vào blacklist', async () => {
    const mockUser = {
      id:    'blacklisted-user-id',
      email: 'loggedout@shopflow.vn',
      role:  'owner' as const,
    };
    const { accessToken } = generateTokens(mockUser);
    vi.spyOn(tokenBlacklistService, 'isTokenBlacklisted').mockResolvedValueOnce(true);

    const { req, res, next } = createMocks({
      authorization: `Bearer ${accessToken}`,
    });

    await authenticateToken(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Phiên đăng nhập đã kết thúc do đăng xuất. Vui lòng đăng nhập lại.',
      })
    );
    expect(req.user).toBeUndefined();
  });

  it('nên giải mã token, gán vào req.user và gọi next() khi token hợp lệ', async () => {
    const mockUser = {
      id:    'valid-uuid-user',
      email: 'verified@shopflow.vn',
      role:  'owner' as const,
    };
    const { accessToken } = generateTokens(mockUser);
    vi.spyOn(tokenBlacklistService, 'isTokenBlacklisted').mockResolvedValueOnce(false);

    const { req, res, next } = createMocks({
      authorization: `Bearer ${accessToken}`,
    });

    await authenticateToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user?.sub).toBe(mockUser.id);
    expect(req.user?.email).toBe(mockUser.email);
    expect(req.user?.role).toBe(mockUser.role);
  });
});

describe('requireRole() middleware', () => {
  it('nên throw UnauthorizedError nếu req.user chưa tồn tại', () => {
    const req = {} as Request;
    const res = {} as Response;
    const next = vi.fn();

    const guard = requireRole('owner', 'admin');
    expect(() => guard(req, res, next)).toThrow(UnauthorizedError);
  });

  it('nên throw ForbiddenError nếu vai trò của user không nằm trong danh sách cho phép', () => {
    const req = {
      user: { sub: 'id-1', email: 'staff@test.com', role: 'staff', token_type: 'access' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    const guard = requireRole('owner', 'admin');
    expect(() => guard(req, res, next)).toThrow(ForbiddenError);
    expect(next).not.toHaveBeenCalled();
  });

  it('nên gọi next() khi vai trò của user hợp lệ', () => {
    const req = {
      user: { sub: 'id-2', email: 'owner@test.com', role: 'owner', token_type: 'access' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    const guard = requireRole('owner', 'admin');
    guard(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
