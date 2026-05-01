import type { Request, Response } from 'express';

import { env } from '../../config/env';
import { clearRefreshTokenCookie, setRefreshTokenCookie } from '../../common/utils/cookies';
import { authService } from './auth.service';

const buildSessionMetadata = (request: Request) => ({
  userAgent: request.get('user-agent') ?? undefined,
  ipAddress: request.ip,
});

const getRefreshTokenFromCookie = (request: Request) =>
  request.cookies?.[env.REFRESH_COOKIE_NAME] as string | undefined;

export const authController = {
  async register(request: Request, response: Response) {
    const session = await authService.register(request.body, buildSessionMetadata(request));
    setRefreshTokenCookie(response, session.refreshToken);

    response.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: session.user,
        accessToken: session.accessToken,
      },
    });
  },

  async login(request: Request, response: Response) {
    const session = await authService.login(request.body, buildSessionMetadata(request));
    setRefreshTokenCookie(response, session.refreshToken);

    response.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: session.user,
        accessToken: session.accessToken,
      },
    });
  },

  async refresh(request: Request, response: Response) {
    const refreshToken = getRefreshTokenFromCookie(request);
    const session = await authService.refreshSession(refreshToken, buildSessionMetadata(request));
    setRefreshTokenCookie(response, session.refreshToken);

    response.status(200).json({
      success: true,
      message: 'Session refreshed',
      data: {
        user: session.user,
        accessToken: session.accessToken,
      },
    });
  },

  async logout(request: Request, response: Response) {
    await authService.logout(getRefreshTokenFromCookie(request));
    clearRefreshTokenCookie(response);

    response.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  },

  async me(request: Request, response: Response) {
    const user = await authService.getCurrentUser(request.user!.id);

    response.status(200).json({
      success: true,
      data: user,
    });
  },
};
