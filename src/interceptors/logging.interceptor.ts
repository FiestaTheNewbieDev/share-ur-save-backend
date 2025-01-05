import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, Observable, tap } from 'rxjs';
import { User } from 'share-ur-save-common';
import { RedisService } from 'src/services/redis.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger();

  constructor(private redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    const now = Date.now();

    const method = request.method;
    const url = request.url;

    const user: User = request.user as User;

    this.logger.log(
      `${method} ${url} - Requested by ${user?.email || 'ANONYMOUS'}`,
    );

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${method} ${url} - Executed in ${Date.now() - now}ms`);
      }),
      catchError((error) => {
        this.logger.error(
          `${method} ${url} - Failed with status ${error.message}`,
          error.stack,
        );
        throw error;
      }),
    );
  }
}
