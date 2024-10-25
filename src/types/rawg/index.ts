export type Game = {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  background_image_additional?: string;
  rating: number;
  rating_top: number;
  ratings: unknown;
  reactions: unknown;
  ratings_count: number;
  reviews_text_count: string;
  added: number;
  added_by_status: unknown;
  metacritic: number;
  playtime: number;
  suggestions_count: number;
  updated: string;
  esrb_rating: EsrbRating;
  platforms: {
    platform: Platform;
    released_at: string;
    requirements: Requirements;
  }[];
};

export type GameDetails = {
  name_original: string;
  description: string;
  website: string;
  metacritic_platforms: MetacriticPlatform[];
  screenshots_count: number;
  movies_count: number;
  creators_count: number;
  achievements_count: number;
  parent_achievements_count: string;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  reddit_count: number;
  twitch_count: string;
  youtube_count: string;
  alternative_names: string[];
  metacritic_url: string;
  parents_count: number;
  additions_count: number;
  game_series_count: number;
};

type MetacriticPlatform = {
  metascore: number;
  url: string;
};

type EsrbRating = {
  id: number;
  name: string;
  slug: string;
};

type Platform = {
  id: number;
  slug: string;
  name: string;
};

type Requirements = {
  minimum: string;
  recommended: string;
};
