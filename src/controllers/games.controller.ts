import {
  BadRequestException,
  Controller,
  Get,
  Optional,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Request, Response } from 'express';
import { Ordering } from 'share-ur-save-common';
import { GamesService } from 'src/services/games.service';

class GetGameDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

class GetGamesDto {
  @IsString()
  @Optional()
  keyword: string;

  @IsNumber()
  @Optional()
  size: number;

  @IsString()
  @Optional()
  sort: Ordering;
}

const BASE_URL = '/game';

@Controller('')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get(`${BASE_URL}/:id`)
  async getGame(
    @Param() params: GetGameDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    console.log('[GAME CONTROLLER] Get game request');

    if (!params.id) throw new BadRequestException('ID required');

    const data = await this.gamesService.getGame(params.id);

    return response.status(200).send({ game: data });
  }

  @Get(`/games`)
  async getGames(
    @Query() query: GetGamesDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    console.log('[GAMES CONTROLLER] Get games request');

    const params: any = {};

    if (query.size) params.size = query.size;
    if (query.sort) params.sort = query.sort;

    const games = await this.gamesService.getGames(query.keyword, params);

    return response
      .status(200)
      .send({ keyword: query.keyword, count: games.length, games });
  }
}
