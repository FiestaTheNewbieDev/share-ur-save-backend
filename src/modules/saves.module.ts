import { Module } from '@nestjs/common';
import { SavesController } from 'src/controllers/saves.controller';
import { SavesService } from 'src/services/saves.service';
import { SaveUpvotesService } from 'src/services/saveUpvotes.service';

@Module({
  providers: [SavesService, SaveUpvotesService],
  controllers: [SavesController],
})
export class SavesModule {}
