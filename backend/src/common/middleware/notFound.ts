import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/AppError';

export const notFoundHandler = (request: Request, _response: Response, next: NextFunction) => {
  next(new AppError(404, `Route ${request.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
};
