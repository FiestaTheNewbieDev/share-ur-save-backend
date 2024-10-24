import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/controllers/app.controller';
import { AuthModule } from 'src/modules/auth.module';
import { PrismaModule } from 'src/modules/prisma.module';
import { RedisModule } from 'src/modules/redis.module';
import { UserModule } from 'src/modules/user.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
