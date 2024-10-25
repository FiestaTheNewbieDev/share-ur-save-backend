import { Module } from '@nestjs/common';
import { GameController } from 'src/controllers/game.controller';
import { GamesController } from 'src/controllers/games.controller';
import { GamesService } from 'src/services/games.service';
import { RawgService } from 'src/services/rawg.service';

@Module({
  providers: [GamesService, RawgService],
  controllers: [GameController, GamesController],
})
export class GamesModule {}
