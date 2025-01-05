import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Save, SaveUpvote, UpvoteType } from 'share-ur-save-common';
import { PrismaService } from 'src/services/prisma.service';
import { SavesService } from 'src/services/saves.service';

@Injectable()
export class SaveUpvotesService {
  constructor(
    private prismaService: PrismaService,
    @Inject(forwardRef(() => SavesService)) private savesService: SavesService,
  ) {}

  populateSaveWithUpvotes(
    save: Save & { saveUpvotes: SaveUpvote[] },
    customerUuid: string,
  ) {
    let customerVote: SaveUpvote;
    let upvotesCount = 0;
    let downvotesCount = 0;

    save.saveUpvotes.forEach((vote) => {
      if (vote.type === 'UP') {
        upvotesCount++;
      } else if (vote.type === 'DOWN') {
        downvotesCount++;
      }

      if (vote.userUuid === customerUuid) {
        customerVote = vote;
      }
    });

    const score = upvotesCount - downvotesCount;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { saveUpvotes, ...saveWithoutUpvotes } = save;

    return { ...saveWithoutUpvotes, score, customerVote };
  }

  async vote(
    saveUuid: string,
    userUuid: string,
    type: UpvoteType,
  ): Promise<any> {
    // Check if the user has already voted on the save
    const existingVote = await this.prismaService.saveUpvote.findFirst({
      where: {
        saveUuid,
        userUuid,
      },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Delete the existing vote
        await this.prismaService.saveUpvote.delete({
          where: {
            userUuid_saveUuid: {
              saveUuid,
              userUuid,
            },
          },
        });
      } else {
        // Update the existing vote
        await this.prismaService.saveUpvote.update({
          where: {
            userUuid_saveUuid: {
              saveUuid,
              userUuid,
            },
          },
          data: { type },
        });
      }
    } else {
      await this.prismaService.saveUpvote.create({
        data: {
          userUuid: userUuid,
          saveUuid: saveUuid,
          type,
        },
      });
    }

    return this.savesService.getGameSave(saveUuid, { customerUuid: userUuid });
  }
}
