import { Injectable } from '@nestjs/common';
import { SavesTab } from 'share-ur-save-common';
import { Save } from 'share-ur-save-common/dist/prisma/client';
import { PrismaService } from 'src/services/prisma.service';

type CreateSaveParams = Pick<
  Save,
  'title' | 'downloadUrl' | 'authorUuid' | 'gameUuid'
> & { description?: string };

const DEFAULT_PAGE_SIZE = 10;

@Injectable()
export class SavesService {
  constructor(private prismaService: PrismaService) {}

  async getLatestGameSaves(
    gameUuid: string,
    params?: { size?: number; page: number },
  ): Promise<Save[]> {
    return this.prismaService.save.findMany({
      where: { gameUuid },
      orderBy: { createdAt: 'desc' },
      take: params.size || DEFAULT_PAGE_SIZE,
      skip: (params.page - 1) * params.size || 0,
    });
  }

  async getNewTodayGameSaves(
    gameUuid: string,
    params?: { size?: number; page: number },
  ): Promise<Save[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.prismaService.save.findMany({
      where: {
        gameUuid,
        OR: [
          { createdAt: { gte: startOfDay, lte: endOfDay } },
          { updatedAt: { gte: startOfDay, lte: endOfDay } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: params.size || DEFAULT_PAGE_SIZE,
      skip: (params.page - 1) * params.size || 0,
    });
  }

  async getNewThisWeekGameSaves(
    gameUuid: string,
    params?: { size?: number; page: number },
  ): Promise<Save[]> {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date();
    endOfWeek.setHours(23, 59, 59, 999);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return this.prismaService.save.findMany({
      where: {
        gameUuid,
        OR: [
          { createdAt: { gte: startOfWeek, lte: endOfWeek } },
          { updatedAt: { gte: startOfWeek, lte: endOfWeek } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: params.size || DEFAULT_PAGE_SIZE,
      skip: (params.page - 1) * params.size || 0,
    });
  }

  async getGameSaves(
    gameUuid: string,
    params?: {
      tab?: SavesTab;
      size?: number;
      page?: number;
    },
  ): Promise<Save[]> {
    switch (params.tab) {
      case 'new-today':
        return this.getNewTodayGameSaves(gameUuid, {
          size: params.size,
          page: params.page,
        });
      case 'new-this-week':
        return this.getNewThisWeekGameSaves(gameUuid, {
          size: params.size,
          page: params.page,
        });
      case 'latest':
        return this.getLatestGameSaves(gameUuid, {
          size: params.size,
          page: params.page,
        });
      default:
        return this.getLatestGameSaves(gameUuid, {
          size: params.size,
          page: params.page,
        });
    }
  }

  async create(params: CreateSaveParams): Promise<Save> {
    return this.prismaService.save.create({
      data: {
        gameUuid: params.gameUuid,
        authorUuid: params.authorUuid,
        title: params.title,
        description: params.description,
        downloadUrl: params.downloadUrl,
      },
    });
  }
}
