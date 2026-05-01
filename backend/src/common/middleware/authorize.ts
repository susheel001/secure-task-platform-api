import type { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';

import { AppError } from '../errors/AppError';

export const authorize =
  (...allowedRoles: Role[]) =>
  (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      return next(new AppError(401, 'Authentication required', 'AUTH_REQUIRED'));
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action', 'FORBIDDEN'));
    }

    next();
  };
