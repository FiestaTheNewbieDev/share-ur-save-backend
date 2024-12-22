import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
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
  @IsOptional()
  keyword: string;

  @IsNumberString()
  @IsOptional()
  size: number;

  @IsString()
  @IsOptional()
  sort: Ordering;
}

const BASE_URL = '/game';

@Controller('')
export class GamesController {
  private logger = new Logger(GamesController.name);

  constructor(private gamesService: GamesService) {}

  @Get(`${BASE_URL}/:id`)
  async getGame(
    @Param() params: GetGameDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    this.logger.log(`Get game with ID: ${params.id}`);

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
    this.logger.log(`Get games`);

    const params: any = {};

    if (query.size) params.size = query.size;
    if (query.sort) params.sort = query.sort;

    const games = await this.gamesService.getGames(query.keyword, params);

    return response
      .status(200)
      .send({ keyword: query.keyword, count: games.length, games });
  }
}
