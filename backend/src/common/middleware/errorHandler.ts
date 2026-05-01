import type { NextFunction, Request, Response } from 'express';

import { logger } from '../../config/logger';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction,
) => {
  const appError =
    error instanceof AppError ? error : new AppError(500, 'Internal server error', 'INTERNAL_SERVER_ERROR');

  const logPayload = {
    code: appError.code,
    message: appError.message,
    stack: error.stack,
    method: request.method,
    path: request.originalUrl,
  };

  if (appError.statusCode >= 500) {
    logger.error('Unhandled application error', logPayload);
  } else {
    logger.warn('Request failed', logPayload);
  }

  response.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    code: appError.code,
    ...(appError.details ? { details: appError.details } : {}),
  });
};
