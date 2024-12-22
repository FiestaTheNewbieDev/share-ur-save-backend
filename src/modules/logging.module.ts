import { Module } from '@nestjs/common';
import { LoggingInterceptor } from 'src/interceptors/logging.interceptor';

@Module({
  providers: [LoggingInterceptor],
  exports: [LoggingInterceptor],
})
export class LoggingModule {}
