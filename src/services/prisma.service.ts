import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaClient } from 'share-ur-save-common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private logger = new Logger(PrismaService.name);
  private status: 'online' | 'offline' = 'offline';

  constructor() {
    super({ log: ['warn', 'error'] });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.status = 'online';
      this.logger.log('Prisma connected');
    } catch (error) {
      this.status = 'offline';
      this.logger.error('Prisma connection failed', error.stack);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.status = 'offline';
    this.logger.log('Prisma disconnected');
  }

  @Cron('5 * * * * *')
  async checkConnection() {
    if (this.status === 'offline')
      try {
        await this.$connect();
        this.status = 'online';
        this.logger.log('Prisma reconnected');
      } catch (error) {
        this.status = 'offline';
        this.logger.error('Prisma reconnection failed', error.stack);
      }
  }

  getStatus() {
    return this.status;
  }
}
