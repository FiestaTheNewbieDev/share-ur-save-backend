import { Injectable, Logger } from '@nestjs/common';
import { Redis, RedisKey } from 'ioredis';

@Injectable()
export class RedisService {
  private redisClient: Redis;
  private logger = new Logger(RedisService.name);
  private status: 'online' | 'offline' = 'offline';

  constructor() {
    this.redisClient = new Redis();

    this.redisClient.on('connect', () => {
      this.status = 'online';
      this.logger.log('Redis connected');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis connection failed', error.stack);
    });

    this.redisClient.on('reconnecting', () => {
      this.logger.warn('Redis reconnecting');
    });

    this.redisClient.on('end', () => {
      this.status = 'offline';
      this.logger.log('Redis disconnected');
    });
  }

  async set(
    key: RedisKey,
    value: string,
    expiration?: { mode: 'EX' | 'PX'; duration: number },
  ) {
    if (expiration) {
      switch (expiration.mode) {
        case 'EX':
          return this.redisClient.set(key, value, 'EX', expiration.duration);
        case 'PX':
          return this.redisClient.set(key, value, 'PX', expiration.duration);
        default:
          throw new Error('Invalid expiration mode');
      }
    }
    return this.redisClient.set(key, value);
  }

  async get(key: RedisKey): Promise<string | object> {
    const value = await this.redisClient.get(key);

    try {
      const parsedValue = await JSON.parse(value);
      return parsedValue;
    } catch (error) {
      return value;
    }
  }

  async del(key: RedisKey) {
    return this.redisClient.del(key);
  }

  getStatus() {
    return this.status;
  }
}
