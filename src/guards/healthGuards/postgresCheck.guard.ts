import {
  CanActivate,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';

@Injectable()
export class PostgresCheckGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(): Promise<boolean> {
    const status = await this.prismaService.getStatus();

    if (status === 'offline') throw new ServiceUnavailableException();

    return true;
  }
}
