import Redis from 'ioredis';

import { env } from '../config/env';
import { logger } from '../config/logger';

class CacheService {
  private client: Redis | null = null;

  private readonly enabled = env.ENABLE_REDIS_CACHE;

  constructor() {
    if (!this.enabled) {
      return;
    }

    this.client = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableAutoPipelining: true,
    });

    this.client.on('error', (error) => {
      logger.warn('Redis cache error', { error: error.message });
    });
  }

  async connect() {
    if (!this.client) {
      return;
    }

    if (this.client.status === 'wait' || this.client.status === 'end') {
      try {
        await this.client.connect();
        logger.info('Redis cache connected');
      } catch (error) {
        logger.warn('Redis cache unavailable, continuing without cache', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (!this.client) {
      return null;
    }

    await this.connect();

    try {
      const payload = await this.client.get(key);
      return payload ? (JSON.parse(payload) as T) : null;
    } catch (error) {
      logger.warn('Cache read failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlInSeconds: number) {
    if (!this.client) {
      return;
    }

    await this.connect();

    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlInSeconds);
    } catch (error) {
      logger.warn('Cache write failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deletePattern(pattern: string) {
    if (!this.client) {
      return;
    }

    await this.connect();

    try {
      let cursor = '0';

      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;

        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      logger.warn('Cache invalidation failed', {
        pattern,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async disconnect() {
    if (!this.client) {
      return;
    }

    await this.client.quit();
  }
}

export const cacheService = new CacheService();
