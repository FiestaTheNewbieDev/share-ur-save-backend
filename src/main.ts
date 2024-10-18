import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cors from 'cors';
import express from 'express';
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
  app.use(express.static('public'));
  app.useGlobalPipes(new ValidationPipe());

  setupSwagger(app);

  await app.listen(3000);
}
bootstrap();
