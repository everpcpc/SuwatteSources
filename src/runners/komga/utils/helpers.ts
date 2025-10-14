import {
  Chapter,
  Content,
  DefinedLanguages,
  Highlight,
  PublicationStatus,
  ReadingMode,
} from "@suwatte/daisuke";
import { getHost } from "../api";
import { BookDto, SeriesDto } from "../types";
import { Sort } from "./constants";

export const convertSort = (val: string | undefined): Sort | undefined => {
  switch (val) {
    case "metadata.titleSort":
      return Sort.Name;
    case "createdDate":
      return Sort.DateAdded;
    case "lastModifiedDate":
      return Sort.DateUpdated;
    case "booksMetadata.releaseDate":
      return Sort.ReleaseDate;
    case "name":
      return Sort.FolderName;
    case "booksCount":
      return Sort.BooksCount;
    case "readProgress.readDate":
      return Sort.ReadDate;
    case "metadata.numberSort":
      return Sort.Number;
    default:
      return undefined;
  }
};

/**
 * builds the sort query param using the key and its order
 */
export const buildSort = (key: Sort, asc: boolean | undefined) =>
  `${key},${asc ? "asc" : "desc"}`;

/**
 * Generates a url using the user specified host
 */
export const genURL = async (url: string) => {
  const val = `${await getHost()}${url}`;
  return val;
};

export const seriesToTile = (series: SeriesDto, host: string): Highlight => {
  const cover = `${host}/api/v1/series/${series.id}/thumbnail`;
  const subtitle = `${series.booksCount} Book${
    series.booksCount != 1 ? "s" : ""
  }`;
  return {
    id: series.id,
    title: series.metadata.title ?? series.name,
    subtitle,
    cover,
    ...(series.booksUnreadCount > 0 && {
      badge: {
        color: "#0096FF",
        count: series.booksUnreadCount,
      },
    }),
  };
};

export const bookToHighlight = (book: BookDto, host: string): Highlight => {
  return {
    id: book.seriesId,
    title: book.seriesTitle,
    subtitle: `${book.media.pagesCount}p • ${book.metadata.number} - ${book.metadata.title}`,
    cover: `${host}/api/v1/books/${book.id}/thumbnail`,
    // Blue Badge if book has not been started
    ...(book.readProgress === null && {
      badge: {
        color: "#0096FF",
      },
    }),
  };
};

export const bookToChapter = (
  book: BookDto,
  host: string,
  index: number
): Chapter => {
  return {
    chapterId: book.id,
    title: book.metadata.title,
    date: new Date(book.created),
    number: book.metadata.numberSort,
    index,
    thumbnail: `${host}/api/v1/books/${book.id}/thumbnail`,
    language: DefinedLanguages.UNIVERSAL,
  };
};

export const seriesToContent = async (series: SeriesDto): Promise<Content> => {
  const host = await getHost();
  const cover = `${host}/api/v1/series/${series.id}/thumbnail`;

  const info: string[] = [];
  if (series.booksCount == series.booksReadCount) {
    info.push("Finished");
  } else if (series.booksCount == series.booksUnreadCount) {
    info.push("Not Started");
  } else if (series.booksUnreadCount != 0) {
    info.push("Reading");
  }

  if (series.metadata.publisher) {
    info.push(series.metadata.publisher);
  }

  const readingDirection = convertReadingMode(series.metadata.readingDirection);
  if (readingDirection) {
    info.push(`${series.metadata.readingDirection}`);
  }

  if (series.metadata.genres.length != 0) {
    info.push(...series.metadata.genres);
  }
  return {
    title: series.metadata.title ?? series.name,
    cover,
    status: convertStatus(series.metadata.status),
    info,
    summary: series.metadata.summary,
    recommendedPanelMode: readingDirection,
  };
};

const convertStatus = (val: string): PublicationStatus | undefined => {
  val = val.toLowerCase();

  switch (val) {
    case "ended": {
      return PublicationStatus.COMPLETED;
    }
    case "ongoing": {
      return PublicationStatus.ONGOING;
    }
    case "abandoned": {
      return PublicationStatus.CANCELLED;
    }
    case "hiatus": {
      return PublicationStatus.HIATUS;
    }
    default: {
      return undefined;
    }
  }
};

const convertReadingMode = (val: string): ReadingMode | undefined => {
  val = val.toUpperCase();

  switch (val) {
    case "LEFT_TO_RIGHT": {
      return ReadingMode.PAGED_MANGA;
    }
    case "RIGHT_TO_LEFT": {
      return ReadingMode.PAGED_COMIC;
    }
    case "VERTICAL": {
      return ReadingMode.PAGED_VERTICAL;
    }
    case "WEBTOON": {
      return ReadingMode.WEBTOON;
    }
    default: {
      return undefined;
    }
  }
};
