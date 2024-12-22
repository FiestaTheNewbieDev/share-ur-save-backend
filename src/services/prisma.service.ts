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

    this.$use(async (params, next) => {
      if (params.action === 'delete') {
        // Change action to an update
        params.action = 'update';
        params.args.data = { deletedAt: new Date() };
      }
      if (params.action === 'deleteMany') {
        // Change action to an updateMany
        params.action = 'updateMany';
        if (params.args.data !== undefined) {
          params.args.data.deletedAt = new Date();
        } else {
          params.args.data = { deletedAt: new Date() };
        }
      }
      return next(params);
    });
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
