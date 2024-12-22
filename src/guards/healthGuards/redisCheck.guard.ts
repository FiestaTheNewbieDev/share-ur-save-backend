import {
  CanActivate,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RedisService } from 'src/services/redis.service';

@Injectable()
export class RedisCheckGuard implements CanActivate {
  private logger = new Logger(RedisCheckGuard.name);

  constructor(private redisService: RedisService) {}

  async canActivate(): Promise<boolean> {
    const status = this.redisService.getStatus();

    if (status === 'offline') {
      this.logger.error('Redis offline');
      throw new ServiceUnavailableException();
    }

    return true;
  }
}
