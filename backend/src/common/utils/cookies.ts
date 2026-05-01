import type { CookieOptions, Response } from 'express';

import { env, isProduction } from '../../config/env';

const buildCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  sameSite: env.COOKIE_SAME_SITE,
  secure: env.COOKIE_SECURE || isProduction,
  path: '/api/v1/auth',
  maxAge: env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
});

export const setRefreshTokenCookie = (response: Response, refreshToken: string) => {
  response.cookie(env.REFRESH_COOKIE_NAME, refreshToken, buildCookieOptions());
};

export const clearRefreshTokenCookie = (response: Response) => {
  response.clearCookie(env.REFRESH_COOKIE_NAME, buildCookieOptions());
};
