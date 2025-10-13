export type MangaExcerpt = {
  path_word: string;
  name: string;
  cover: string;
  author: { name: string }[];
  status: number;
};

export type ChapterGroup = {
  name: string;
  chapters: ChapterItem[];
};

export type ChapterItem = {
  id: string;
  name: string;
  type: number;
};

export type ChapterListResponse = {
  build: {
    path_word: string;
  };
  groups: Record<string, ChapterGroup>;
};

export type PageItem = {
  url: string;
};

export type SearchParams = {
  theme?: string;
  status?: string;
  region?: string;
  ordering?: string;
  offset?: number;
  limit?: number;
  q?: string;
};

export type Part = {
  chapter: number;
  volume?: number;
  title?: string;
};

export enum SearchType {
  All = "",
  Title = "name",
  Author = "author",
  Translator = "local",
}

export type SearchRequest = {
  page: number;
  keyword: string;
  by: SearchType;
};

export enum Status {
  All = -1,
  Ongoing = 0,
  Completed = 1,
  OneShot = 2,
}

export enum Region {
  All = -1,
  Japan = 0,
  Korea = 1,
  West = 2,
}

// Manga detail response types
export type DisplayValue<T> = {
  display: string;
  value: T;
};

export type Author = {
  name: string;
  path_word: string;
};

export type Theme = {
  name: string;
  path_word: string;
};

export type LastChapter = {
  uuid: string;
  name: string;
};

export type ComicDetail = {
  uuid: string;
  b_404: boolean;
  b_hidden: boolean;
  ban: number;
  name: string;
  alias: string;
  path_word: string;
  close_comment: boolean;
  close_roast: boolean;
  free_type: DisplayValue<number>;
  restrict: DisplayValue<number>;
  reclass: DisplayValue<number>;
  females: any[];
  males: any[];
  clubs: any[];
  img_type: number;
  seo_baidu: string;
  region: DisplayValue<number>;
  status: DisplayValue<number>;
  author: Author[];
  theme: Theme[];
  parodies: any[];
  brief: string;
  datetime_updated: string;
  cover: string;
  last_chapter: LastChapter;
  popular: number;
};

export type GroupInfo = {
  path_word: string;
  count: number;
  name: string;
};

export type MangaDetailResults = {
  is_banned: boolean;
  is_lock: boolean;
  is_login: boolean;
  is_mobile_bind: boolean;
  is_vip: boolean;
  comic: ComicDetail;
  popular: number;
  groups: Record<string, GroupInfo>;
};

export type MangaDetailResponse = {
  code: number;
  message: string;
  results: MangaDetailResults;
};

export type ListingItem = {
  sort: number;
  sort_last: number;
  rise_sort: number;
  rise_num: number;
  date_type: number;
  popular: number;
  comic: {
    name: string;
    path_word: string;
    females: any[];
    males: any[];
    author: Author[];
    img_type: number;
    theme: Theme[];
    cover: string;
    popular: number;
  };
};

export type ListingResults = {
  list: ListingItem[];
  total: number;
  offset: number;
  limit: number;
};

export type ListingResponse = {
  code: number;
  message: string;
  results: ListingResults;
};
