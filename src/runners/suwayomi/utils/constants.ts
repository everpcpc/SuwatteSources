import { DirectoryFilter, FilterType, Option } from "@suwatte/daisuke";

export enum Sort {
  Title = "TITLE",
  DateAdded = "IN_LIBRARY_AT",
  LastUpdated = "LAST_FETCHED_AT",
}

export const SortOptions: Option[] = [
  {
    id: Sort.Title,
    title: "Title",
  },
  {
    id: Sort.DateAdded,
    title: "Date Added",
  },
  {
    id: Sort.LastUpdated,
    title: "Last Updated",
  },
];

export const RESULT_COUNT = 30;

export enum MangaStatusEnum {
  Unknown = "UNKNOWN",
  Ongoing = "ONGOING",
  Completed = "COMPLETED",
  Licensed = "LICENSED",
  PublishingFinished = "PUBLISHING_FINISHED",
  Cancelled = "CANCELLED",
  OnHiatus = "ON_HIATUS",
}

export enum ReadStatus {
  Unread = "UNREAD",
  Reading = "READING",
  Completed = "COMPLETED",
}

export type FilterItems = Record<string, string[]>;

export const FilterOptions: DirectoryFilter[] = [
  {
    id: "status",
    title: "Manga Status",
    type: FilterType.MULTISELECT,
    options: [
      {
        id: MangaStatusEnum.Ongoing,
        title: "Ongoing",
      },
      {
        id: MangaStatusEnum.Completed,
        title: "Completed",
      },
      {
        id: MangaStatusEnum.Licensed,
        title: "Licensed",
      },
      {
        id: MangaStatusEnum.Cancelled,
        title: "Cancelled",
      },
      {
        id: MangaStatusEnum.OnHiatus,
        title: "On Hiatus",
      },
    ],
  },
];
