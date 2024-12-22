import {
  Injectable,
  Logger,
  NestMiddleware,
  Next,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from 'share-ur-save-common';
import { RedisService } from 'src/services/redis.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private logger = new Logger(AuthMiddleware.name);

  constructor(private redisService: RedisService) {}

  async use(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction,
  ) {
    const user: User = (await this.redisService.get(
      request.cookies['session_id'],
    )) as User;

    this.logger.log(`Requested by ${user?.email || 'ANONYMOUS'}`);

    if (!user) throw new UnauthorizedException();

    request.user = user;

    next();
  }
}
