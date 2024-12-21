import {
  CanActivate,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RedisService } from 'src/services/redis.service';

@Injectable()
export class RedisCheckGuard implements CanActivate {
  constructor(private redisService: RedisService) {}

  async canActivate(): Promise<boolean> {
    const status = this.redisService.getStatus();

    if (status === 'offline') throw new ServiceUnavailableException();

    return true;
  }
}
