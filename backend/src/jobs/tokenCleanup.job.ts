import cron from 'node-cron';

import { env } from '../config/env';
import { logger } from '../config/logger';
import { authRepository } from '../modules/auth/auth.repository';

let jobInitialized = false;

export const registerTokenCleanupJob = () => {
  if (!env.ENABLE_TOKEN_CLEANUP_JOB || jobInitialized) {
    return;
  }

  cron.schedule(env.TOKEN_CLEANUP_CRON, async () => {
    try {
      const result = await authRepository.deleteExpiredOrRevokedRefreshTokens();
      logger.info('Refresh token cleanup job completed', { deletedCount: result.count });
    } catch (error) {
      logger.error('Refresh token cleanup job failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  jobInitialized = true;
  logger.info('Refresh token cleanup job registered', { schedule: env.TOKEN_CLEANUP_CRON });
};
