/**
 * ShopFlow - Settings Routes
 * File: backend/src/api/routes/settings.routes.ts
 *
 * Định tuyến các endpoints Quản lý Hồ sơ, Đổi mật khẩu và Giám sát Hạn ngạch Meta Graph API.
 */

import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate-request.middleware.js';
import { UpdateProfileDtoSchema, ChangePasswordDtoSchema } from '../dtos/settings.dto.js';

export const settingsRouter = Router();

// Toàn bộ endpoints trong settings đều yêu cầu đăng nhập hợp lệ
settingsRouter.use(authenticateToken);

/**
 * GET /api/v1/settings/profile
 * Xem thông tin hồ sơ tài khoản
 */
settingsRouter.get('/profile', settingsController.getProfile);

/**
 * PUT /api/v1/settings/profile
 * Cập nhật thông tin hồ sơ tài khoản
 */
settingsRouter.put(
  '/profile',
  validateRequest({ body: UpdateProfileDtoSchema }),
  settingsController.updateProfile
);

/**
 * PUT /api/v1/settings/password
 * Đổi mật khẩu an toàn
 */
settingsRouter.put(
  '/password',
  validateRequest({ body: ChangePasswordDtoSchema }),
  settingsController.changePassword
);

/**
 * GET /api/v1/settings/meta-limits
 * Giám sát hạn mức Meta Graph API & Webhook Health
 */
settingsRouter.get('/meta-limits', settingsController.getMetaLimits);
