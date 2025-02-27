import {
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryRequest,
  FilterType,
  ImageRequestHandler,
  NetworkRequest,
  PagedResult,
  Property,
  RunnerInfo,
  CatalogRating,
  Tag,
  UIPicker,
  Form,
  RunnerPreferenceProvider,
} from "@suwatte/daisuke";
import {
  DOMAINS,
  LISTING_TYPES,
  SORT_OPTIONS,
  getProperties,
} from "./constants";
import {
  ChapterListResponse,
  MangaDetailResponse,
  SearchParams,
  ListingResponse,
} from "./types";
import {
  chapterGroupsToChapters,
  convertRegion,
  convertStatus,
  decryptString,
  generateChapterListUrl,
  generateExploreUrl,
  generateMangaDetailsUrl,
  generateNewestUrl,
  generatePageListUrl,
  generateRankUrl,
  generateRecsUrl,
  generateSearchUrl,
  getBaseUrl,
  getRequestHeaders,
  hasMorePages,
  mangaListToPageResult,
  parseSearchRequest,
  readingModeByRegion,
  regionToDisplay,
} from "./utils";
import { ConfigStore } from "./store";

export const info: RunnerInfo = {
  id: "zh.copymanga",
  name: "拷贝漫画",
  version: 1.1,
  website: "https://www.copymanga.tv",
  supportedLanguages: ["zh"],
  thumbnail: "copymanga.png",
  minSupportedAppVersion: "5.0",
  rating: CatalogRating.MIXED,
};

export class Target
  implements ContentSource, ImageRequestHandler, RunnerPreferenceProvider
{
  private client: NetworkClient = new NetworkClient();

  info: RunnerInfo = info;

  // Get manga details
  async getContent(contentId: string): Promise<Content> {
    const baseUrl = await getBaseUrl();
    const url = await generateMangaDetailsUrl(contentId);
    console.log(`GET: ${url}`);
    const headers = await getRequestHeaders();
    const response = await this.client.get(url, { headers });
    const data = JSON.parse(response.data) as MangaDetailResponse;

    if (data.code !== 200) {
      throw new Error(`Failed to fetch manga details: ${data.message}`);
    }
    if (!data.results) {
      throw new Error(`Empty manga details: ${data.message}`);
    }
    const results = data.results;

    const info: string[] = [];

    const comic = results.comic;
    const cover = comic.cover ? comic.cover.replace(".328x422.jpg", "") : "";
    const title = comic.name || "";
    const additionalTitles = comic.alias
      ? comic.alias.split(",").map((alias: string) => alias.trim())
      : [];
    const creators = comic.author
      ? comic.author.map((author) => author.name)
      : [];

    const summary = comic.brief || "";
    const status = convertStatus(comic.status.value);

    if (comic.popular) {
      info.push(`🔥熱度: ${comic.popular}`);
    }
    if (comic.datetime_updated) {
      info.push(`🗓最後更新: ${comic.datetime_updated}`);
    }
    const region = convertRegion(comic.region.value);
    info.push(regionToDisplay(region));
    info.push(comic.reclass.display);

    const recommendedPanelMode = readingModeByRegion(region);

    const themes: Tag[] = [];
    if (comic.theme) {
      comic.theme.forEach((theme: any) => {
        if (theme.name) {
          themes.push({
            id: theme.path_word || theme.name,
            title: theme.name,
          });
        }
      });
    }
    const isNSFW = comic.restrict.value === 0 ? false : true;

    return {
      title,
      additionalTitles,
      recommendedPanelMode,
      cover,
      creators,
      summary,
      status,
      info,
      webUrl: `${baseUrl}/comic/${contentId}`,
      isNSFW,
      properties: [
        {
          id: "theme",
          title: "題材",
          tags: themes,
        },
      ],
    };
  }

  // Get chapter list for a manga
  async getChapters(contentId: string): Promise<Chapter[]> {
    const url = await generateChapterListUrl(contentId);
    console.log(`GET: ${url}`);
    const headers = await getRequestHeaders();
    const response = await this.client.get(url, { headers });

    const resultsMatch = response.data.match(/"results":"([^"]+)"/);
    if (!resultsMatch || !resultsMatch[1]) {
      return [];
    }

    const encryptedResults = resultsMatch[1];
    const decryptedResults = decryptString(encryptedResults);

    try {
      const chapterListData = JSON.parse(
        decryptedResults
      ) as ChapterListResponse;
      return chapterGroupsToChapters(chapterListData.groups, contentId);
    } catch (error) {
      console.error("Error parsing chapter list:", error);
      return [];
    }
  }

  // Get page list for a chapter
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const url = await generatePageListUrl(contentId, chapterId);
    const headers = await getRequestHeaders();
    console.log(`GET: ${url}`);
    const response = await this.client.get(url, { headers });
    const data = JSON.parse(response.data);

    if (!data.results || !data.results.chapter) {
      return { pages: [] };
    }

    const chapter = data.results.chapter;
    const pageList = chapter.contents || [];

    // Use the image format from the API response
    const imageFormat = "jpg";
    const imageQuality = "c800x";
    const imageExt = `${imageQuality}.${imageFormat}`;

    const pages = pageList.map((page: any, index: number) => ({
      index,
      url: page.url,
    }));

    return { pages };
  }

  // Get tags
  async getTags(): Promise<Property[]> {
    return getProperties();
  }

  // Get manga list based on filters and page
  async getDirectory(request: DirectoryRequest): Promise<PagedResult> {
    const params = parseSearchRequest(request);

    if (request.listId) {
      return this.getListing({ id: request.listId }, request.page || 1);
    }

    if (params.q) {
      return this.search(params.q, request.page || 1);
    }

    return this.browse(params);
  }

  // Search for manga
  private async search(query: string, page: number): Promise<PagedResult> {
    const url = await generateSearchUrl(query, page);
    const headers = await getRequestHeaders();
    console.log(`GET: ${url}`);
    const response = await this.client.get(url, { headers });
    const data = JSON.parse(response.data);

    if (!data.results || !data.results.list) {
      return { results: [], isLastPage: true };
    }

    const mangaList = data.results.list;
    const hasMore = hasMorePages(data.results);

    return mangaListToPageResult(mangaList, hasMore);
  }

  // Browse manga with filters
  private async browse(params: SearchParams): Promise<PagedResult> {
    const theme = params.theme || "";
    const top = params.region || "";
    const ordering = params.ordering || "-datetime_updated";
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const page = Math.floor(offset / limit) + 1;

    const url = await generateExploreUrl(theme, top, ordering, page);
    const headers = await getRequestHeaders();
    console.log(`GET: ${url}`);
    const response = await this.client.get(url, { headers });
    const data = JSON.parse(response.data);

    if (!data.results || !data.results.list) {
      return { results: [], isLastPage: true };
    }

    const mangaList = data.results.list;
    const hasMore = hasMorePages(data.results);

    return mangaListToPageResult(mangaList, hasMore);
  }

  // Get directory config
  async getDirectoryConfig(): Promise<DirectoryConfig> {
    return {
      filters: [
        {
          id: "theme",
          title: "題材",
          type: FilterType.SELECT,
          options: getProperties().find((p) => p.id === "theme")?.tags || [],
        },
        {
          id: "status",
          title: "狀態",
          type: FilterType.SELECT,
          options: getProperties().find((p) => p.id === "status")?.tags || [],
        },
        {
          id: "region",
          title: "地區",
          type: FilterType.SELECT,
          options: getProperties().find((p) => p.id === "region")?.tags || [],
        },
      ],
      sort: {
        options: SORT_OPTIONS,
        default: {
          id: "datetime_updated",
          ascending: false,
        },
        canChangeOrder: true,
      },
      lists: [
        {
          id: LISTING_TYPES.DAY_RANK,
          title: "日榜",
        },
        {
          id: LISTING_TYPES.WEEK_RANK,
          title: "周榜",
        },
        {
          id: LISTING_TYPES.MONTH_RANK,
          title: "月榜",
        },
        {
          id: LISTING_TYPES.TOTAL_RANK,
          title: "總榜",
        },
        {
          id: LISTING_TYPES.RECS,
          title: "推薦",
        },
        {
          id: LISTING_TYPES.NEWEST,
          title: "最新",
        },
      ],
    };
  }

  // Get listing for a specific category
  async getListing(listing: { id: string }, page = 1): Promise<PagedResult> {
    let url: string;

    switch (listing.id) {
      case LISTING_TYPES.DAY_RANK:
        url = await generateRankUrl(LISTING_TYPES.DAY_RANK, page);
        break;
      case LISTING_TYPES.WEEK_RANK:
        url = await generateRankUrl(LISTING_TYPES.WEEK_RANK, page);
        break;
      case LISTING_TYPES.MONTH_RANK:
        url = await generateRankUrl(LISTING_TYPES.MONTH_RANK, page);
        break;
      case LISTING_TYPES.TOTAL_RANK:
        url = await generateRankUrl(LISTING_TYPES.TOTAL_RANK, page);
        break;
      case LISTING_TYPES.RECS:
        url = await generateRecsUrl(page);
        break;
      case LISTING_TYPES.NEWEST:
        url = await generateNewestUrl(page);
        break;
      default:
        return this.getDirectory({ page });
    }

    const headers = await getRequestHeaders();
    console.log(`GET: ${url}`);
    const response = await this.client.get(url, { headers });
    const data = JSON.parse(response.data) as ListingResponse;

    if (!data.results || !data.results.list) {
      return { results: [], isLastPage: true };
    }

    const mangaList = data.results.list.map((manga) => ({
      ...manga.comic,
      status: 1,
    }));
    const hasMore = hasMorePages(data.results);

    return mangaListToPageResult(mangaList, hasMore);
  }

  // Handle image requests
  async willRequestImage(url: string): Promise<NetworkRequest> {
    const headers = await getRequestHeaders();
    return {
      url,
      headers,
    };
  }

  async getPreferenceMenu(): Promise<Form> {
    return {
      sections: [
        {
          header: "Core",
          children: [
            UIPicker({
              id: "domain",
              title: "Domain",
              value: (await ConfigStore.domain()) || DOMAINS.China,
              options: [
                { id: DOMAINS.China, title: `China(${DOMAINS.China})` },
                { id: DOMAINS.Global, title: `Global(${DOMAINS.Global})` },
              ],
              async didChange(value) {
                await ObjectStore.set("domain", value);
              },
            }),
          ],
        },
      ],
    };
  }
}
