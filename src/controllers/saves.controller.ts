import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Validate,
} from 'class-validator';
import { Request, Response } from 'express';
import { SavesTab, User } from 'share-ur-save-common';
import { SavesService } from 'src/services/saves.service';
import { IsAllowedDownloadUrl } from 'src/validators/isAllowedDownloadUrl.validator';

const BASE_URL = '/saves';

class AddGameDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @Validate(IsAllowedDownloadUrl)
  downloadUrl: string;
}

class GetSaveDto {
  @IsString()
  @IsOptional()
  @IsEnum(['new-today', 'new-this-week', 'latest', 'popular'])
  tab?: SavesTab;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  size?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  page?: number;
}

@Controller('')
export class SavesController {
  private logger = new Logger(SavesController.name);

  constructor(private savesService: SavesService) {}

  @Post(`/save/:gameUuid`)
  async addSave(
    @Param('gameUuid') gameUuid: string,
    @Body() body: AddGameDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const user: User = request.user as User;

    this.logger.log(`Add save by ${user.email} to ${gameUuid}`);

    const result = await this.savesService.create({
      gameUuid,
      authorUuid: user.uuid,
      ...body,
    });

    return response.status(201).json({ save: result });
  }

  @Get(`${BASE_URL}/:gameUuid`)
  async getSaves(
    @Param('gameUuid') gameUuid: string,
    @Query() query: GetSaveDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    this.logger.log(`Get saves for ${gameUuid}`);

    const saves = await this.savesService.getGameSaves(gameUuid, {
      tab: query.tab || 'new-today',
      size: query.size ? parseInt(query.size.toString()) : undefined,
      page: query.page ? parseInt(query.page.toString()) : undefined,
    });

    return response.status(200).json({ count: saves.length, saves });
  }
}
