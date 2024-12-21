import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/controllers/app.controller';
import { AuthModule } from 'src/modules/auth.module';
import { GamesModule } from 'src/modules/games.module';
import { HealthModule } from 'src/modules/health.module';
import { PrismaModule } from 'src/modules/prisma.module';
import { RedisModule } from 'src/modules/redis.module';
import { UsersModule } from 'src/modules/users.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    UsersModule,
    AuthModule,
    GamesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
