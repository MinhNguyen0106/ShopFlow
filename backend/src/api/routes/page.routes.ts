/**
 * ShopFlow - Connected Pages Routes
 * File: backend/src/api/routes/page.routes.ts
 */

import { Router } from 'express';
import { pageController } from '../controllers/page.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate-request.middleware.js';
import { UpdatePageStatusDtoSchema } from '../dtos/page.dto.js';

export const pageRouter = Router();

// Tất cả các routes quản lý Fanpage đều yêu cầu xác thực JWT
pageRouter.use(authenticateToken);

/**
 * @route   GET /api/v1/pages
 * @desc    Lấy danh sách tất cả các Fanpage đã kết nối của user
 * @access  Private
 */
pageRouter.get('/', pageController.getPages);

/**
 * @route   GET /api/v1/pages/:pageId
 * @desc    Lấy chi tiết Fanpage và số liệu thống kê
 * @access  Private
 */
pageRouter.get('/:pageId', pageController.getPageDetail);

/**
 * @route   PATCH /api/v1/pages/:pageId/status
 * @desc    Bật/Tắt trạng thái hoạt động (is_active) của Fanpage
 * @access  Private
 */
pageRouter.patch(
  '/:pageId/status',
  validateRequest({ body: UpdatePageStatusDtoSchema }),
  pageController.updateStatus
);

/**
 * @route   POST /api/v1/pages/:pageId/subscribe-webhook
 * @desc    Đồng bộ và đăng ký lại Webhook với Meta
 * @access  Private
 */
pageRouter.post('/:pageId/subscribe-webhook', pageController.subscribeWebhook);

/**
 * @route   DELETE /api/v1/pages/:pageId
 * @desc    Hủy kết nối Fanpage an toàn
 * @access  Private
 */
pageRouter.delete('/:pageId', pageController.disconnectPage);
