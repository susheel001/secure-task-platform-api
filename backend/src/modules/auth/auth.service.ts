import { randomUUID } from 'node:crypto';

import bcrypt from 'bcryptjs';

import { env } from '../../config/env';
import { AppError } from '../../common/errors/AppError';
import { compareHashedToken, hashToken } from '../../common/utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../common/utils/jwt';
import { authRepository, type SafeUser } from './auth.repository';
import type { LoginInput, RegisterInput } from './auth.schemas';

type SessionMetadata = {
  userAgent?: string;
  ipAddress?: string;
};

type AuthSession = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
};

const buildRefreshTokenExpiry = () =>
  new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

const issueSession = async (
  user: SafeUser,
  metadata: SessionMetadata,
  rotatedFromId?: string,
): Promise<AuthSession> => {
  const jti = randomUUID();
  const refreshToken = signRefreshToken({ userId: user.id, jti });

  const refreshTokenRecord = {
    jti,
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
    expiresAt: buildRefreshTokenExpiry(),
    rotatedFromId,
  };

  if (rotatedFromId) {
    await authRepository.rotateRefreshToken(rotatedFromId, refreshTokenRecord);
  } else {
    await authRepository.createRefreshToken(refreshTokenRecord);
  }

  return {
    user,
    accessToken: signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    }),
    refreshToken,
  };
};

export const authService = {
  async register(input: RegisterInput, metadata: SessionMetadata) {
    const existingUser = await authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new AppError(409, 'An account with this email already exists', 'EMAIL_ALREADY_REGISTERED');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return issueSession(user, metadata);
  },

  async login(input: LoginInput, metadata: SessionMetadata) {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return issueSession(safeUser, metadata);
  },

  async refreshSession(refreshToken: string | undefined, metadata: SessionMetadata) {
    if (!refreshToken) {
      throw new AppError(401, 'Refresh token is required', 'REFRESH_TOKEN_REQUIRED');
    }

    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (_error) {
      throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    const storedToken = await authRepository.findRefreshTokenByJti(payload.jti);

    if (!storedToken || storedToken.userId !== payload.sub) {
      throw new AppError(401, 'Refresh token is not recognized', 'UNKNOWN_REFRESH_TOKEN');
    }

    if (storedToken.revokedAt || storedToken.expiresAt.getTime() <= Date.now()) {
      throw new AppError(401, 'Refresh token is no longer active', 'INACTIVE_REFRESH_TOKEN');
    }

    const tokenMatches = compareHashedToken(refreshToken, storedToken.tokenHash);

    if (!tokenMatches) {
      throw new AppError(401, 'Refresh token validation failed', 'INVALID_REFRESH_TOKEN');
    }

    return issueSession(storedToken.user, metadata, storedToken.id);
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const storedToken = await authRepository.findRefreshTokenByJti(payload.jti);

      if (storedToken && !storedToken.revokedAt) {
        await authRepository.revokeRefreshToken(storedToken.id);
      }
    } catch (_error) {
      return;
    }
  },

  async getCurrentUser(userId: string) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }

    return user;
  },
};
