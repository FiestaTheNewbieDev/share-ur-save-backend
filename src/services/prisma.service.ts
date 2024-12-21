import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'share-ur-save-common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
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
    } catch (error) {
      this.status = 'offline';
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.status = 'offline';
  }

  getStatus() {
    return this.status;
  }
}
