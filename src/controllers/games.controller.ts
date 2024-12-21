import { Controller, Get, Query } from '@nestjs/common';
import { Ordering } from 'share-ur-save-common';
import { GamesService } from 'src/services/games.service';

@Controller('games')
export class GamesController {
  constructor(private gameService: GamesService) {}

  @Get('/')
  async getGames(
    @Query('keyword') keyword?: string,
    @Query('size') size?: number,
    @Query('sort') sort?: Ordering,
  ) {
    console.log('[GAMES CONTROLLER] Get games request');

    const params: any = {};

    if (size) params.size = size;
    if (sort) params.sort = sort;

    const games = await this.gameService.getGames(keyword, params);

    return {
      keyword,
      count: games.length,
      games,
    };
  }
}
