import {
  Injectable,
  Logger,
  NestMiddleware,
  Next,
  Req,
  Res,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from 'share-ur-save-common';
import { AuthService } from 'src/services/auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private logger = new Logger(AuthMiddleware.name);

  constructor(private authService: AuthService) {}

  async use(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction,
  ) {
    let user: Omit<User, 'password'> = null;

    try {
      user = (await this.authService.fetchUser(request.cookies.session_id))
        .user;
    } catch (error) {}

    this.logger.log(`Requested by ${user?.email || 'ANONYMOUS'}`);

    request.user = user;

    next();
  }
}
