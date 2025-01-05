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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { AuthGuard } from 'src/guards/auth.guard';
import { SavesService } from 'src/services/saves.service';
import { SaveUpvotesService } from 'src/services/saveUpvotes.service';
import { IsAllowedDownloadUrl } from 'src/validators/isAllowedDownloadUrl.validator';

class AddGameSaveDto {
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

  constructor(
    private savesService: SavesService,
    private saveUpvotesService: SaveUpvotesService,
  ) {}

  @Post(`/game/:gameUuid/add-save`)
  @UseInterceptors(FileInterceptor('thumbnail'))
  async addSave(
    @Param('gameUuid') gameUuid: string,
    @Body() body: AddGameSaveDto,
    @UploadedFile() thumbnail: Express.Multer.File,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const user: User = request.user as User;

    this.logger.log(`Add save by ${user.email} to ${gameUuid}`);

    const result = await this.savesService.create({
      gameUuid,
      authorUuid: user.uuid,
      thumbnail,
      ...body,
    });

    return response.status(201).json({ save: result });
  }

  @Get(`/game/:gameUuid/get-saves`)
  async getSaves(
    @Param('gameUuid') gameUuid: string,
    @Query() query: GetSaveDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    this.logger.log(`Get saves for ${gameUuid}`);

    const results = await this.savesService.getGameSaves(gameUuid, {
      tab: query.tab || 'new-today',
      size: query.size ? parseInt(query.size.toString()) : undefined,
      page: query.page ? parseInt(query.page.toString()) : undefined,
      customerUuid: (request.user as User)?.uuid,
    });

    return response
      .status(200)
      .json({ count: results.saves.length, ...results });
  }

  @Post(`/save/:saveUuid/upvote`)
  @UseGuards(AuthGuard)
  async upVote(
    @Param('saveUuid') saveUuid: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const user: User = request.user as User;

    this.logger.log(`Save ${saveUuid} upvoted by ${user.email}`);

    const results = await this.saveUpvotesService.vote(
      saveUuid,
      user.uuid,
      'UP',
    );

    return response.status(200).send({ message: 'Upvoted', upvote: results });
  }

  @Post(`/save/:saveUuid/downvote`)
  @UseGuards(AuthGuard)
  async downVote(
    @Param('saveUuid') saveUuid: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const user: User = request.user as User;

    this.logger.log(`Save ${saveUuid} downvoted by ${user.email}`);

    const results = await this.saveUpvotesService.vote(
      saveUuid,
      user.uuid,
      'DOWN',
    );

    return response.status(200).send({ message: 'Downvoted', upvote: results });
  }
}
