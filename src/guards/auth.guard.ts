import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from 'share-ur-save-common';
import { RedisService } from 'src/services/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const user: User = (await this.redisService.get(
      request.cookies['session_id'],
    )) as User;

    if (!user) throw new UnauthorizedException();

    return true;
  }
}
