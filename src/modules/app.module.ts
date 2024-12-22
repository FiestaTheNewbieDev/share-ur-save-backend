import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from 'src/controllers/app.controller';
import { AuthModule } from 'src/modules/auth.module';
import { GamesModule } from 'src/modules/games.module';
import { HealthModule } from 'src/modules/health.module';
import { LoggingModule } from 'src/modules/logging.module';
import { PrismaModule } from 'src/modules/prisma.module';
import { RedisModule } from 'src/modules/redis.module';
import { SavesModule } from 'src/modules/saves.module';
import { UsersModule } from 'src/modules/users.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    LoggingModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    HealthModule,
    UsersModule,
    AuthModule,
    GamesModule,
    SavesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
