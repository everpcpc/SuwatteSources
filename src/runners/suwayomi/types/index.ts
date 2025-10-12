// Suwayomi GraphQL Types

export interface MangaType {
  id: number;
  title: string;
  thumbnailUrl?: string;
  url: string;
  artist?: string;
  author?: string;
  description?: string;
  genre: string[];
  status: MangaStatus;
  inLibrary: boolean;
  inLibraryAt: number;
  source?: {
    id: string;
    name: string;
    displayName: string;
  };
  chapters: {
    nodes: ChapterType[];
    totalCount: number;
  };
  trackRecords?: {
    nodes: any[];
  };
  unreadCount: number;
  downloadCount: number;
  bookmarkCount: number;
  lastReadChapter?: ChapterType;
  firstUnreadChapter?: ChapterType;
  latestFetchedChapter?: ChapterType;
  categories: {
    nodes: CategoryType[];
  };
}

export interface ChapterType {
  id: number;
  chapterNumber: number;
  name: string;
  mangaId: number;
  isRead: boolean;
  isBookmarked: boolean;
  isDownloaded: boolean;
  pageCount: number;
  lastPageRead: number;
  lastReadAt: string;
  uploadDate: string;
  scanlator?: string;
  url: string;
  realUrl?: string;
  sourceOrder: number;
  manga?: MangaType;
}

export interface CategoryType {
  id: number;
  name: string;
  default: boolean;
  order: number;
  includeInUpdate: boolean;
  mangas?: {
    nodes: MangaType[];
    totalCount: number;
  };
}

export enum MangaStatus {
  UNKNOWN = "UNKNOWN",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  LICENSED = "LICENSED",
  PUBLISHING_FINISHED = "PUBLISHING_FINISHED",
  CANCELLED = "CANCELLED",
  ON_HIATUS = "ON_HIATUS",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export interface MangaNodeList {
  nodes: MangaType[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    endCursor?: string;
    startCursor?: string;
  };
}

export interface ChapterNodeList {
  nodes: ChapterType[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    endCursor?: string;
    startCursor?: string;
  };
}

export interface GetMangasQueryVariables {
  condition?: {
    inLibrary?: boolean;
  };
  filter?: {
    categoryId?: {
      equalTo?: number;
    };
  };
  orderBy?: string;
  orderByType?: SortOrder;
}

export interface GetChaptersQueryVariables {
  condition?: {
    mangaId: number;
  };
  orderBy?: string;
  orderByType?: SortOrder;
}
