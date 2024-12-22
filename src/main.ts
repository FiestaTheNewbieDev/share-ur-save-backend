import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { PostgresCheckGuard } from 'src/guards/healthGuards/postgresCheck.guard';
import { RedisCheckGuard } from 'src/guards/healthGuards/redisCheck.guard';
import { LoggingInterceptor } from 'src/interceptors/logging.interceptor';
import { AppModule } from 'src/modules/app.module';
import { setupSwagger } from 'src/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    cors({
      origin: 'http://localhost:8080',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.static('public'));
  app.useLogger(new Logger());
  app.useGlobalInterceptors(app.get(LoggingInterceptor));
  app.useGlobalGuards(app.get(PostgresCheckGuard));
  app.useGlobalGuards(app.get(RedisCheckGuard));
  app.useGlobalPipes(new ValidationPipe());

  setupSwagger(app);

  await app.listen(3000);
}

bootstrap();
