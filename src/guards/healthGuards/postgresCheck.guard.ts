import {
  CanActivate,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';

@Injectable()
export class PostgresCheckGuard implements CanActivate {
  private logger = new Logger(PostgresCheckGuard.name);

  constructor(private prismaService: PrismaService) {}

  async canActivate(): Promise<boolean> {
    const status = await this.prismaService.getStatus();

    if (status === 'offline') {
      this.logger.error('Postgres DB offline');
      throw new ServiceUnavailableException();
    }

    return status === 'online';
  }
}
