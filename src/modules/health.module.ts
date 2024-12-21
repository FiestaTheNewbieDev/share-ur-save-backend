import { Module } from '@nestjs/common';
import { PostgresCheckGuard } from 'src/guards/healthGuards/postgresCheck.guard';
import { RedisCheckGuard } from 'src/guards/healthGuards/redisCheck.guard';

@Module({
  providers: [PostgresCheckGuard, RedisCheckGuard],
})
export class HealthModule {}
