import { Module } from '@nestjs/common';
import { GamesController } from 'src/controllers/games.controller';
import { GamesService } from 'src/services/games.service';
import { RawgService } from 'src/services/rawg.service';

@Module({
  providers: [GamesService, RawgService],
  controllers: [GamesController],
})
export class GamesModule {}
