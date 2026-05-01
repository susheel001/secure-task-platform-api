import { Router } from 'express';

import { authRouter } from '../modules/auth/auth.routes';
import { taskRouter } from '../modules/tasks/task.routes';

export const createV1Router = () => {
  const router = Router();

  router.get('/health', (_request, response) => {
    response.status(200).json({
      success: true,
      message: 'API v1 is healthy',
      version: 'v1',
      timestamp: new Date().toISOString(),
    });
  });

  router.use('/auth', authRouter);
  router.use('/tasks', taskRouter);

  return router;
};
