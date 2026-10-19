import { Router } from 'express';
import { healthRouter } from './health.routes.js';

export const apiV1Router = Router();

// Mount health check route
apiV1Router.use('/health', healthRouter);

// Các router tiếp theo trong Sprint 1 sẽ được đăng ký tại đây:
// apiV1Router.use('/auth', authRouter);
// apiV1Router.use('/webhook', webhookRouter);
