import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Client as PgClient } from 'pg';
import { createClient as createRedisClient } from 'redis';
import { AppModule } from 'src/modules/app.module';
import { setupSwagger } from 'src/swagger';

dotenv.config();

async function checkPostgresConnection() {
  console.log('Checking Postgres connection');

  let client = new PgClient({
    connectionString: process.env.DATABASE_URL,
  });

  while (true) {
    try {
      await client.connect();
      await client.query('SELECT 1');
      console.log('Postgres ready');
      return;
    } catch (error) {
      console.error(error);
      console.log('Postgres not ready, retrying in 5 seconds...');
    } finally {
      await client.end();
      client = new PgClient({
        connectionString: process.env.DATABASE_URL,
      });
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function checkRedisConnection() {
  console.log('Checking Redis connection');

  const client = createRedisClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  while (true) {
    try {
      await client.connect();
      await client.ping();
      console.log('Redis ready');
      return;
    } catch (error) {
      console.error(error);
      console.log('Redis not ready, retrying in 5 seconds...');
    } finally {
      await client.disconnect();
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function bootstrap() {
  await checkPostgresConnection();
  await checkRedisConnection();

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
