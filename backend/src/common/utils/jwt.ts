import jwt, { type JwtPayload } from 'jsonwebtoken';
import { Role } from '@prisma/client';

import { env } from '../../config/env';

type TokenKind = 'access' | 'refresh';

type BaseTokenPayload = JwtPayload & {
  sub: string;
  type: TokenKind;
};

export type AccessTokenPayload = BaseTokenPayload & {
  type: 'access';
  email: string;
  role: Role;
};

export type RefreshTokenPayload = BaseTokenPayload & {
  type: 'refresh';
  jti: string;
};

export const signAccessToken = (user: { id: string; email: string; role: Role }) =>
  jwt.sign(
    {
      type: 'access',
      email: user.email,
      role: user.role,
    },
    env.JWT_ACCESS_SECRET,
    {
      subject: user.id,
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN_MINUTES * 60,
    },
  );

export const signRefreshToken = (payload: { userId: string; jti: string }) =>
  jwt.sign(
    {
      type: 'refresh',
      jti: payload.jti,
    },
    env.JWT_REFRESH_SECRET,
    {
      subject: payload.userId,
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60,
    },
  );

const assertTokenPayload = <T extends BaseTokenPayload>(payload: string | JwtPayload, type: TokenKind) => {
  if (typeof payload === 'string' || payload.type !== type || typeof payload.sub !== 'string') {
    throw new Error('Invalid token payload');
  }

  return payload as T;
};

export const verifyAccessToken = (token: string) =>
  assertTokenPayload<AccessTokenPayload>(jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload, 'access');

export const verifyRefreshToken = (token: string) =>
  assertTokenPayload<RefreshTokenPayload>(jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload, 'refresh');
