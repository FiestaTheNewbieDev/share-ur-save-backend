import { Controller, Get } from '@nestjs/common';
import { GamesService } from 'src/services/games.service';

@Controller('games')
export class GamesController {
  constructor(private gameService: GamesService) {}

  @Get('/')
  async getGames() {
    return this.gameService.getGames();
  }
}
