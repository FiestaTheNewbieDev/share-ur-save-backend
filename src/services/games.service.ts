import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UUID } from 'crypto';
import type { CombinedGame, GameSearchResult } from 'share-ur-save-common';
import { PrismaService } from 'src/services/prisma.service';
import { RawgService } from 'src/services/rawg.service';

@Injectable()
export class GamesService {
  constructor(
    private rawgService: RawgService,
    private prismaService: PrismaService,
  ) {}

  async getGame(key: string) {
    const parsedKey = parseInt(key);

    let game = await this.prismaService.game.findFirst({
      where: {
        OR: [
          { uuid: key },
          { slug: key },
          { rawgId: isNaN(parsedKey) ? undefined : parsedKey },
        ],
      },
    });

    let rawgGame = await this.rawgService.getGameById(key);

    if (!game && !rawgGame) throw new NotFoundException('Game not found');

    if (!game)
      game = await this.prismaService.game.create({
        data: {
          rawgId: rawgGame.id,
          slug: rawgGame.slug,
          name: rawgGame.name,
        },
      });

    if (!rawgGame) rawgGame = await this.rawgService.getGameById(game.rawgId);

    const combinedGame: CombinedGame = {
      ...game,
      rawgData: rawgGame,
    };

    return combinedGame;
  }

  async getGameByUuid(uuid: UUID): Promise<CombinedGame> {
    const game = await this.prismaService.game.findUnique({
      where: {
        uuid,
      },
    });

    if (!game) throw new NotFoundException('Game not found');

    const rawgGame = await this.rawgService.getGameById(game.rawgId);

    if (!rawgGame) throw new InternalServerErrorException();

    const combinedData: CombinedGame = {
      ...game,
      rawgData: rawgGame,
    };

    return combinedData;
  }

  async getGameByRawgId(id: number): Promise<CombinedGame> {
    const rawgGame = await this.rawgService.getGameById(id);

    if (!rawgGame) throw new NotFoundException('Game not found');

    let game = await this.prismaService.game.findUnique({
      where: {
        rawgId: rawgGame.id,
      },
    });

    if (!game)
      game = await this.prismaService.game.create({
        data: {
          rawgId: rawgGame.id,
          slug: rawgGame.slug,
          name: rawgGame.name,
        },
      });

    const combinedData: CombinedGame = {
      ...game,
      rawgData: rawgGame,
    };

    return combinedData;
  }

  async getGameBySlug(slug: string) {
    const rawgGame = await this.rawgService.getGameById(slug);

    if (!rawgGame) throw new NotFoundException('Game not found');

    let game = await this.prismaService.game.findUnique({
      where: {
        slug: rawgGame.slug,
      },
    });

    if (!game)
      game = await this.prismaService.game.create({
        data: {
          rawgId: rawgGame.id,
          slug: rawgGame.slug,
          name: rawgGame.name,
        },
      });

    const combinedData: CombinedGame = {
      ...game,
      rawgData: rawgGame,
    };

    return combinedData;
  }

  async getGames(
    search?: string,
    params?: { size?: number },
  ): Promise<GameSearchResult[]> {
    const data = await this.rawgService.getGames({
      search,
      page_size: params.size,
    });

    return Promise.all(
      data.results.map(async (game) => {
        return GamesService.convertCombinedGameToSearchResult(
          await this.getGameByRawgId(game.id),
        );
      }),
    );
  }

  private static async convertCombinedGameToSearchResult(game: CombinedGame) {
    const result: GameSearchResult = {
      uuid: game.uuid,
      rawgId: game.rawgId,
      slug: game.slug,

      name: game.name,
      rawgData: {
        id: game.rawgData.id,
        slug: game.rawgData.slug,
        name: game.rawgData.name,
        released: game.rawgData.released,
        background_image: game.rawgData.background_image,
      },

      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      deletedAt: game.deletedAt,
    };

    return result;
  }
}
