import { Injectable } from '@nestjs/common';
import * as cron from 'cron-parser';
import {
  AggregatedSave,
  Save,
  SavesTab,
  SaveUpvote,
} from 'share-ur-save-common';
import { FirebaseService } from 'src/services/firebase.service';
import { PrismaService } from 'src/services/prisma.service';
import { SaveUpvotesService } from 'src/services/saveUpvotes.service';

type CreateSaveParams = Pick<
  Save,
  'title' | 'downloadUrl' | 'authorUuid' | 'gameUuid'
> & { description?: string; thumbnail: Express.Multer.File };

type GetGameSavesParams = {
  customerUuid?: string;
  page?: number;
  size?: number;
};

type GetGameSavesResponse = {
  saves: AggregatedSave[];
  totalCount: number;
  totalPages: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

@Injectable()
export class SavesService {
  constructor(
    private prismaService: PrismaService,
    private firebaseService: FirebaseService,
    private saveUpvotesService: SaveUpvotesService,
  ) {}

  private static calculateTotalPages(totalCount?: number, pageSize?: number) {
    return Math.ceil(totalCount / (pageSize || DEFAULT_PAGE_SIZE));
  }

  async getGameSave(uuid: string, params?: { customerUuid?: string }) {
    const save = await this.prismaService.save
      .findUnique({
        where: { uuid },
        include: {
          author: {
            select: { uuid: true, username: true, displayName: true },
          },
          saveUpvotes: true,
        },
      })
      .then((save) =>
        this.saveUpvotesService.populateSaveWithUpvotes(
          save,
          params?.customerUuid,
        ),
      );

    return save;
  }

  async getNewGameSavesByCronExp(
    gameUuid: string,
    cronExp: string,
    params?: GetGameSavesParams,
  ): Promise<GetGameSavesResponse> {
    const interval = cron.parseExpression(cronExp);
    const gte = interval.prev().toDate();
    const lte = interval.next().toDate();

    const baseRequest: any = {
      where: {
        gameUuid,
        OR: [{ createdAt: { gte, lte } }, { updatedAt: { gte, lte } }],
      },
    };

    const [saves, totalCount] = await Promise.all([
      await this.prismaService.save
        .findMany({
          ...baseRequest,
          orderBy: { createdAt: 'desc' },
          take: params.size || DEFAULT_PAGE_SIZE,
          skip: (params.page - 1) * params.size || 0,
          include: {
            author: {
              select: { uuid: true, username: true, displayName: true },
            },
            saveUpvotes: true,
          },
        })
        .then((saves) =>
          saves.map((save: Save & { saveUpvotes: SaveUpvote[] }) =>
            this.saveUpvotesService.populateSaveWithUpvotes(
              save,
              params.customerUuid,
            ),
          ),
        ),
      await this.prismaService.save.count(baseRequest),
    ]);

    const totalPages = SavesService.calculateTotalPages(
      totalCount,
      params.size,
    );

    return {
      saves: saves as any[],
      totalCount,
      totalPages,
    };
  }

  async getLatestGameSaves(
    gameUuid: string,
    params?: GetGameSavesParams,
  ): Promise<GetGameSavesResponse> {
    const baseRequest: any = {
      where: { gameUuid },
    };

    const [saves, totalCount] = await Promise.all([
      await this.prismaService.save
        .findMany({
          ...baseRequest,
          orderBy: { createdAt: 'desc' },
          take: params.size || DEFAULT_PAGE_SIZE,
          skip: ((params.page || DEFAULT_PAGE) - 1) * params.size || 0,
          include: {
            author: {
              select: { uuid: true, username: true, displayName: true },
            },
            saveUpvotes: true,
          },
        })
        .then((saves) =>
          saves.map((save: Save & { saveUpvotes: SaveUpvote[] }) =>
            this.saveUpvotesService.populateSaveWithUpvotes(
              save,
              params.customerUuid,
            ),
          ),
        ),
      await this.prismaService.save.count(baseRequest),
    ]);

    const totalPages = SavesService.calculateTotalPages(
      totalCount,
      params.size,
    );

    return { saves: saves as AggregatedSave[], totalCount, totalPages };
  }

  async getPopularGameSaves(gameUuid: string, params?: GetGameSavesParams) {
    const baseRequest: any = {
      where: { gameUuid },
    };

    const [saves, totalCount] = await Promise.all([
      await this.prismaService.save
        .findMany({
          ...baseRequest,
          orderBy: { upvotes: 'desc' },
          take: params.size || DEFAULT_PAGE_SIZE,
          skip: ((params.page || DEFAULT_PAGE) - 1) * params.size || 0,
          include: {
            author: {
              select: { uuid: true, username: true, displayName: true },
            },
            saveUpvotes: true,
          },
        })
        .then((saves) =>
          saves.map((save: Save & { saveUpvotes: SaveUpvote[] }) =>
            this.saveUpvotesService.populateSaveWithUpvotes(
              save,
              params.customerUuid,
            ),
          ),
        ),
      await this.prismaService.save.count(baseRequest),
    ]);

    const totalPages = SavesService.calculateTotalPages(
      totalCount,
      params.size,
    );

    return { saves: saves as AggregatedSave[], totalCount, totalPages };
  }

  async getGameSaves(
    gameUuid: string,
    params?: {
      tab?: SavesTab;
    } & GetGameSavesParams,
  ): Promise<GetGameSavesResponse> {
    switch (params.tab) {
      case 'new-today':
        return this.getNewGameSavesByCronExp(gameUuid, '0 0 * * *', {
          size: params.size,
          page: params.page,
          customerUuid: params.customerUuid,
        });
      case 'new-this-week':
        return this.getNewGameSavesByCronExp(gameUuid, '0 0 * * 1', {
          size: params.size,
          page: params.page,
          customerUuid: params.customerUuid,
        });
      case 'latest':
        return this.getLatestGameSaves(gameUuid, {
          size: params.size,
          page: params.page,
          customerUuid: params.customerUuid,
        });
      case 'popular':
        return this.getPopularGameSaves(gameUuid, {
          size: params.size,
          page: params.page,
          customerUuid: params.customerUuid,
        });
      default:
        return this.getLatestGameSaves(gameUuid, {
          size: params.size,
          page: params.page,
          customerUuid: params.customerUuid,
        });
    }
  }

  async create(params: CreateSaveParams): Promise<AggregatedSave> {
    const save = await this.prismaService.save.create({
      data: {
        gameUuid: params.gameUuid,
        authorUuid: params.authorUuid,
        title: params.title,
        description: params.description,
        downloadUrl: params.downloadUrl,
      },
    });

    if (params.thumbnail) {
      const thumbnailUrl = await this.firebaseService.uploadFile(
        `${save.uuid}/thumbnail`,
        params.thumbnail,
      );

      return (await this.prismaService.save.update({
        where: { uuid: save.uuid },
        data: { thumbnailUrl },
        include: {
          author: {
            select: { uuid: true, username: true, displayName: true },
          },
        },
      })) as AggregatedSave;
    }

    return (await this.prismaService.save.findUnique({
      where: { uuid: save.uuid },
      include: {
        author: {
          select: { uuid: true, username: true, displayName: true },
        },
      },
    })) as AggregatedSave;
  }
}
