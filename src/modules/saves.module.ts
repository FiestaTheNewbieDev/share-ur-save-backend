import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SavesController } from 'src/controllers/saves.controller';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';
import { SavesService } from 'src/services/saves.service';

@Module({
  providers: [SavesService],
  controllers: [SavesController],
})
export class SavesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'save/:gameUuid', method: RequestMethod.POST });
  }
}
