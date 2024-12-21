import { Injectable } from '@nestjs/common';
import { Redis, RedisKey } from 'ioredis';

@Injectable()
export class RedisService {
  private redisClient: Redis;

  private status: 'online' | 'offline' = 'offline';

  constructor() {
    this.redisClient = new Redis();

    this.redisClient.on('connect', () => {
      this.status = 'online';
    });

    this.redisClient.on('error', (error) => {});

    this.redisClient.on('reconnecting', () => {});

    this.redisClient.on('end', () => {
      this.status = 'offline';
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

  async get(key: RedisKey) {
    return this.redisClient.get(key);
  }

  async del(key: RedisKey) {
    return this.redisClient.del(key);
  }

  getStatus() {
    return this.status;
  }
}
