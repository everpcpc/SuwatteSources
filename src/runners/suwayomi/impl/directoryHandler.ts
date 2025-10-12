import {
  DirectoryConfig,
  DirectoryHandler,
  DirectoryRequest,
  PagedResult,
} from "@suwatte/daisuke";
import {
  RESULT_COUNT,
  FilterOptions,
  SortOptions,
  mangaToTile,
  Sort,
  convertSort,
  getHost,
} from "../utils";
import { SortOrder } from "../types";
import { getMangasInLibrary, searchMangas } from "../api";

/**
 * Implementation of the DirectoryHandler Methods
 */
export const SuwayomiDirectoryHandler: DirectoryHandler = {
  getDirectory: function (request: DirectoryRequest): Promise<PagedResult> {
    return fetchDirectory(request);
  },
  getDirectoryConfig: async function (
    _: string | undefined
  ): Promise<DirectoryConfig> {
    return buildDirectoryConfig();
  },
};

/**
 * Builds the Directory View Sort Options & Filters
 */
function buildDirectoryConfig(): DirectoryConfig {
  return {
    searchable: true,
    filters: FilterOptions,
    sort: {
      options: SortOptions,
      canChangeOrder: true,
    },
  };
}

type IResponse = Promise<PagedResult>;
async function fetchDirectory(request: DirectoryRequest): IResponse {
  const host = await getHost();
  if (!host) {
    throw new Error("Host not defined");
  }

  const sort = convertSort(request.sort?.id) ?? Sort.LastUpdated;
  const orderByType = request.sort?.ascending ? SortOrder.ASC : SortOrder.DESC;
  const filters = request.filters ?? {};

  let mangas;
  if (request.query) {
    mangas = await searchMangas(request.query, request.page, filters);
  } else {
    mangas = await getMangasInLibrary(sort, orderByType, request.page, filters);
  }

  const results = mangas.map((v) => mangaToTile(v, host));

  return {
    results,
    isLastPage: results.length < RESULT_COUNT,
  };
}
