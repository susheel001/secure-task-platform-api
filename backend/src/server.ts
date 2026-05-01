import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { registerTokenCleanupJob } from './jobs/tokenCleanup.job';
import { cacheService } from './lib/redis';
import { prisma } from './lib/prisma';

const server = app.listen(env.PORT, async () => {
  await cacheService.connect();
  registerTokenCleanupJob();
  logger.info(`API server listening on port ${env.PORT}`);
});

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    await cacheService.disconnect();
    logger.info('Shutdown complete');
    process.exit(0);
  });
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
