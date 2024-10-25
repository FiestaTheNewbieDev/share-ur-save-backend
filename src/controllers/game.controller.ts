import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { Request, Response } from 'express';
import { GamesService } from 'src/services/games.service';

class GetGameDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

@Controller('game')
export class GameController {
  constructor(private gamesService: GamesService) {}

  @Get('/:id')
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
}
