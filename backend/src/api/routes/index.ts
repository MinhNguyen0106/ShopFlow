import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';

export const apiV1Router = Router();

// Mount health check route
apiV1Router.use('/health', healthRouter);

// Mount authentication routes
apiV1Router.use('/auth', authRouter);

