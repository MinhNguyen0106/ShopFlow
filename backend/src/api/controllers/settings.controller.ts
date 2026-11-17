/**
 * ShopFlow - Settings Controller
 * File: backend/src/api/controllers/settings.controller.ts
 *
 * Điều khiển các yêu cầu xem/sửa hồ sơ cá nhân, đổi mật khẩu và giám sát hạn mức Meta Graph API.
 */

import { Request, Response, NextFunction } from 'express';
import { SettingsService, settingsService } from '../../core/services/settings.service.js';
import { UnauthorizedError } from '../../core/errors/app-error.js';
import { UpdateProfileDto, ChangePasswordDto } from '../dtos/settings.dto.js';

export class SettingsController {
  constructor(private readonly service: SettingsService = settingsService) {}

  /**
   * Helper lấy ID người dùng từ JWT
   */
  private getUserId(req: Request): string {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedError('Chưa xác thực người dùng. Vui lòng đăng nhập lại.');
    }
    return userId;
  }

  /**
   * GET /api/v1/settings/profile
   * Lấy thông tin hồ sơ người dùng
   */
  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const profile = await this.service.getProfile(userId);

      res.status(200).json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/settings/profile
   * Cập nhật thông tin hồ sơ
   */
  public updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const profile = await this.service.updateProfile(userId, req.body as UpdateProfileDto);

      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin hồ sơ thành công',
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/settings/password
   * Đổi mật khẩu tài khoản
   */
  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const result = await this.service.changePassword(userId, req.body as ChangePasswordDto);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/settings/meta-limits
   * Giám sát hạn ngạch Meta Graph API & Webhook
   */
  public getMetaLimits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const limits = await this.service.getMetaLimits(userId);

      res.status(200).json({
        success: true,
        data: limits,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const settingsController = new SettingsController();
