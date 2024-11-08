import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  RawgGame as Game,
  RawgGameDetails as GameDetails,
} from 'share-ur-save-common';

interface IGetGamesParams {
  page?: number;
  page_size?: number;
  search?: string;
  search_precise?: boolean;
  search_exact?: boolean;
  parent_platforms?: string;
  platforms?: string;
  stores?: string;
  developers?: string;
  publishers?: string;
  genres?: string;
  tags?: string;
  creators?: string;
  dates?: string;
  updated?: string;
  platforms_count?: number;
  metacritic?: string;
  exclude_collection?: number;
  exclude_additions?: boolean;
  exclude_parents?: boolean;
  exclude_game_series?: boolean;
  exclude_stores?: string;
  ordering?:
    | 'name'
    | 'released'
    | 'added'
    | 'created'
    | 'updated'
    | 'rating'
    | 'metacritic'
    | '-name'
    | '-released'
    | '-added'
    | '-created'
    | '-updated'
    | '-rating'
    | '-metacritic';
}

interface IGetGamesData {
  count: number;
  next: string;
  previous: string;
  results: Game[];
}

@Injectable()
export class RawgService {
  private API: AxiosInstance;

  constructor() {
    this.API = axios.create({
      baseURL: 'https://api.rawg.io/api/',
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        key: process.env.RAWG_API_KEY,
      },
      validateStatus: () => true,
    });
  }

  async getGameById(id: number | string): Promise<Game & GameDetails> {
    const response: AxiosResponse<Game & GameDetails> = await this.API.get<
      Game & GameDetails
    >(`/games/${id}`, { params: { id } });

    return response.data;
  }

  async getGames(params?: IGetGamesParams): Promise<IGetGamesData> {
    const response: AxiosResponse<IGetGamesData> =
      await this.API.get<IGetGamesData>('/games', { params });
    return response.data;
  }
}
