import type { NextFunction, Request, Response } from 'express';
import xss from 'xss';

const sensitiveKeys = new Set(['password', 'currentPassword', 'newPassword', 'token', 'refreshToken']);

const sanitizeValue = (value: unknown, currentKey?: string): unknown => {
  if (typeof value === 'string') {
    if (currentKey && sensitiveKeys.has(currentKey)) {
      return value.trim();
    }

    return xss(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, currentKey));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, unknown>>((accumulator, [key, entryValue]) => {
      accumulator[key] = sanitizeValue(entryValue, key);
      return accumulator;
    }, {});
  }

  return value;
};

const setRequestValue = (request: Request, key: 'body' | 'query' | 'params', value: unknown) => {
  Object.defineProperty(request, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
};

export const sanitizeRequest = (request: Request, _response: Response, next: NextFunction) => {
  setRequestValue(request, 'body', sanitizeValue(request.body));
  setRequestValue(request, 'query', sanitizeValue(request.query));
  setRequestValue(request, 'params', sanitizeValue(request.params));
  next();
};
