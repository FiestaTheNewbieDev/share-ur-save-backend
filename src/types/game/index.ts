import { Game } from '@prisma/client';
import { GameDetails, Game as RawgGame } from 'src/types/rawg';

export type CombinedGame = Game & {
  rawgData: RawgGame & GameDetails;
};
