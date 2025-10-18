import {
  Chapter,
  Content,
  DefinedLanguages,
  Highlight,
  Property,
  PublicationStatus,
  ReadingMode,
  Tag,
} from "@suwatte/daisuke";
import { ChapterType, MangaType, MangaStatus } from "../types";
import { Sort } from "./constants";
import { SuwayomiStore } from "../store";

// Declare getHost here to avoid circular dependency
export const getHost = async (): Promise<string> => {
  const host = await SuwayomiStore.host();
  if (!host) throw new Error("You have not defined a server url!");
  return host.endsWith("/") ? host.slice(0, -1) : host;
};

export const convertSort = (val: string | undefined): Sort | undefined => {
  switch (val) {
    case "TITLE":
      return Sort.Title;
    case "IN_LIBRARY_AT":
      return Sort.DateAdded;
    case "LAST_FETCHED_AT":
      return Sort.LastUpdated;
    default:
      return undefined;
  }
};

/**
 * Generates a url using the user specified host
 */
export const genURL = async (url: string) => {
  const val = `${await getHost()}${url}`;
  return val;
};

export const mangaToTile = (manga: MangaType, host: string): Highlight => {
  const cover = manga.thumbnailUrl
    ? `${host}/api/v1/manga/${manga.id}/thumbnail?fetchedAt=${Date.now()}`
    : "";
  const subtitle = `${manga.chapters?.totalCount ?? 0} Chapter${
    (manga.chapters?.totalCount ?? 0) != 1 ? "s" : ""
  }`;
  return {
    id: manga.id.toString(),
    title: manga.title,
    subtitle,
    cover,
    ...(manga.unreadCount > 0 && {
      badge: {
        color: "#0096FF",
        count: manga.unreadCount,
      },
    }),
  };
};

export const chapterToChapter = (
  chapter: ChapterType,
  index: number
): Chapter => {
  const uploadDate = parseInt(chapter.uploadDate);
  let date: Date;
  if (!uploadDate) {
    date = new Date(0);
  } else {
    date = new Date(uploadDate);
  }
  return {
    chapterId: chapter.id.toString(),
    title: chapter.name,
    date,
    number: chapter.chapterNumber,
    index,
    language: DefinedLanguages.UNIVERSAL,
  };
};

export const mangaToContent = async (manga: MangaType): Promise<Content> => {
  const host = await getHost();
  const cover = manga.thumbnailUrl
    ? `${host}/api/v1/manga/${manga.id}/thumbnail?fetchedAt=${Date.now()}`
    : "";

  const info: string[] = [];
  if (manga.unreadCount === 0 && (manga.chapters?.totalCount ?? 0) > 0) {
    info.push("Finished");
  } else if (manga.unreadCount === manga.chapters?.totalCount) {
    info.push("Not Started");
  } else if (manga.unreadCount > 0) {
    info.push("Reading");
  }

  const creators: string[] = [];
  if (manga.author) {
    creators.push(manga.author);
  }

  const properties: Property[] = [];
  const tags: Tag[] = [];
  if (manga.source) {
    tags.push({
      id: manga.source.name,
      title: manga.source.displayName,
    });
  }

  if (manga.genre && manga.genre.length > 0) {
    for (const genre of manga.genre) {
      if (genre !== "") {
        tags.push({
          id: genre,
          title: genre,
        });
      }
    }
  }
  properties.push({
    id: "genres",
    title: "Genres",
    tags: tags,
  });

  return {
    title: manga.title,
    creators,
    cover,
    status: convertStatus(manga.status),
    info,
    properties,
    summary: manga.description,
    recommendedPanelMode: ReadingMode.PAGED_MANGA,
  };
};

const convertStatus = (val: MangaStatus): PublicationStatus | undefined => {
  switch (val) {
    case MangaStatus.COMPLETED:
    case MangaStatus.PUBLISHING_FINISHED: {
      return PublicationStatus.COMPLETED;
    }
    case MangaStatus.ONGOING: {
      return PublicationStatus.ONGOING;
    }
    case MangaStatus.CANCELLED: {
      return PublicationStatus.CANCELLED;
    }
    case MangaStatus.ON_HIATUS: {
      return PublicationStatus.HIATUS;
    }
    default: {
      return undefined;
    }
  }
};
