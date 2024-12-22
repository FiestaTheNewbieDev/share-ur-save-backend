import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from 'src/controllers/auth.controller';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { UsersModule } from 'src/modules/users.module';
import { AuthService } from 'src/services/auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthMiddleware, AuthGuard],
  exports: [AuthMiddleware, AuthGuard],
})
export class AuthModule {}
