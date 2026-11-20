import { Router } from 'express';
import { systemController } from '../controllers/system.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

export const systemRouter = Router();

// Toàn bộ API quản trị hệ thống đều được bảo vệ bởi JWT Authenticate
systemRouter.use(authenticateToken);

systemRouter.get('/health-stats', (req, res, next) => systemController.getHealthStats(req, res, next));
systemRouter.post('/test-alert', (req, res, next) => systemController.testAlert(req, res, next));
