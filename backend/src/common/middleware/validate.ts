import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';

import { AppError } from '../errors/AppError';

type RequestSchema = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

const setRequestValue = (request: Request, key: 'body' | 'query' | 'params', value: unknown) => {
  Object.defineProperty(request, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
};

export const validate =
  (schema: RequestSchema) => (request: Request, _response: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        setRequestValue(request, 'body', schema.body.parse(request.body));
      }

      if (schema.query) {
        setRequestValue(request, 'query', schema.query.parse(request.query));
      }

      if (schema.params) {
        setRequestValue(request, 'params', schema.params.parse(request.params));
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError(400, 'Validation failed', 'VALIDATION_ERROR', {
            issues: error.flatten(),
          }),
        );
      }

      next(error);
    }
  };
