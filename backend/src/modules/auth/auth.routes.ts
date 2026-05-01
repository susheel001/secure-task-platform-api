import { Router } from 'express';

import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middleware/authenticate';
import { authRateLimiter } from '../../common/middleware/rateLimit';
import { validate } from '../../common/middleware/validate';
import { authController } from './auth.controller';
import { loginBodySchema, registerBodySchema } from './auth.schemas';

export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimiter,
  validate({ body: registerBodySchema }),
  asyncHandler(authController.register),
);

authRouter.post(
  '/login',
  authRateLimiter,
  validate({ body: loginBodySchema }),
  asyncHandler(authController.login),
);

authRouter.post('/refresh', authRateLimiter, asyncHandler(authController.refresh));
authRouter.post('/logout', asyncHandler(authController.logout));
authRouter.get('/me', authenticate, asyncHandler(authController.me));
