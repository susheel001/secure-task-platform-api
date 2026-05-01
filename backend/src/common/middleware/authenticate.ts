import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/AppError';
import { verifyAccessToken } from '../utils/jwt';

export const authenticate = (request: Request, _response: Response, next: NextFunction) => {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required', 'AUTH_REQUIRED'));
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const payload = verifyAccessToken(token);
    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (_error) {
    next(new AppError(401, 'Invalid or expired access token', 'INVALID_ACCESS_TOKEN'));
  }
};
