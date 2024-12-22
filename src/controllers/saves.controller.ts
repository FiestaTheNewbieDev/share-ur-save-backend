import {
  Body,
  Controller,
  Logger,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Validate,
} from 'class-validator';
import { Request, Response } from 'express';
import { User } from 'share-ur-save-common';
import { SavesService } from 'src/services/saves.service';
import { IsAllowedDownloadUrl } from 'src/validators/isAllowedDownloadUrl.validator';

const BASE_URL = '/save';

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

@Controller('')
export class SavesController {
  private logger = new Logger(SavesController.name);

  constructor(private savesService: SavesService) {}

  @Post(`${BASE_URL}/:gameUuid`)
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
}
