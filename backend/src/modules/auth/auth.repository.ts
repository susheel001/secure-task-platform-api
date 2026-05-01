import type { Prisma } from '@prisma/client';

import { AppError } from '../../common/errors/AppError';
import { prisma } from '../../lib/prisma';

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const userWithPasswordSelect = {
  ...safeUserSelect,
  passwordHash: true,
} satisfies Prisma.UserSelect;

const refreshTokenWithUserSelect = {
  id: true,
  jti: true,
  tokenHash: true,
  userId: true,
  userAgent: true,
  ipAddress: true,
  expiresAt: true,
  revokedAt: true,
  createdAt: true,
  user: {
    select: safeUserSelect,
  },
} satisfies Prisma.RefreshTokenSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
export type UserWithPassword = Prisma.UserGetPayload<{ select: typeof userWithPasswordSelect }>;
export type RefreshTokenRecord = Prisma.RefreshTokenGetPayload<{ select: typeof refreshTokenWithUserSelect }>;

type CreateRefreshTokenInput = {
  jti: string;
  tokenHash: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  rotatedFromId?: string;
};

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: userWithPasswordSelect,
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  },

  createUser(data: { name: string; email: string; passwordHash: string }) {
    return prisma.user.create({
      data,
      select: safeUserSelect,
    });
  },

  createRefreshToken(data: CreateRefreshTokenInput) {
    return prisma.refreshToken.create({
      data,
    });
  },

  findRefreshTokenByJti(jti: string) {
    return prisma.refreshToken.findUnique({
      where: { jti },
      select: refreshTokenWithUserSelect,
    });
  },

  revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  async rotateRefreshToken(currentId: string, nextToken: CreateRefreshTokenInput) {
    return prisma.$transaction(async (transaction) => {
      const revokeResult = await transaction.refreshToken.updateMany({
        where: {
          id: currentId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });

      if (revokeResult.count !== 1) {
        throw new AppError(401, 'Refresh token is no longer active', 'INACTIVE_REFRESH_TOKEN');
      }

      return transaction.refreshToken.create({
        data: nextToken,
      });
    });
  },

  deleteExpiredOrRevokedRefreshTokens() {
    return prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
  },
};
