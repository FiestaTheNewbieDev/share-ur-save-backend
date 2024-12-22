import { Injectable } from '@nestjs/common';
import { Save } from 'share-ur-save-common/dist/prisma/client';
import { PrismaService } from 'src/services/prisma.service';

type CreateSaveParams = Pick<
  Save,
  'title' | 'downloadUrl' | 'authorUuid' | 'gameUuid'
> & { description?: string };

@Injectable()
export class SavesService {
  constructor(private prismaService: PrismaService) {}

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
