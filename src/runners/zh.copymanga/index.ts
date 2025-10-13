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
  PublicationStatus,
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
import { ChapterListResponse, SearchParams, ListingResponse } from "./types";
import {
  chapterGroupsToChapters,
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
} from "./utils";
import { ConfigStore } from "./store";

export const info: RunnerInfo = {
  id: "zh.copymanga",
  name: "拷贝漫画",
  version: 1.2,
  website: "https://www.mangacopy.com/",
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

    // Parse HTML to extract manga details
    const titleMatch = response.data.match(/<h6[^>]*>([^<]+)<\/h6>/);
    const title = titleMatch ? titleMatch[1].trim() : "";

    const coverMatch = response.data.match(/img[^>]*data-src="([^"]+)"/);
    const cover = coverMatch ? coverMatch[1].replace(".328x422.jpg", "") : "";

    // Extract authors from span.comicParticulars-right-txt > a
    const authorsMatch = response.data.match(
      /<span class="comicParticulars-right-txt">([\s\S]*?)<\/span>/
    );
    const creators: string[] = [];
    if (authorsMatch) {
      const authorLinks = authorsMatch[1].match(/<a[^>]*>([^<]+)<\/a>/g) || [];
      authorLinks.forEach((link) => {
        const nameMatch = link.match(/>([^<]+)</);
        if (nameMatch) creators.push(nameMatch[1].trim());
      });
    }

    // Extract summary
    const summaryMatch = response.data.match(
      /<p class="intro"[^>]*>([^<]*)<\/p>/
    );
    const summary = summaryMatch ? summaryMatch[1].trim() : "";

    // Extract tags
    const tagsMatch = response.data.match(
      /<span class="comicParticulars-tag">([\s\S]*?)<\/span>/
    );
    const themes: Tag[] = [];
    if (tagsMatch) {
      const tagLinks = tagsMatch[1].match(/<a[^>]*>([^<]+)<\/a>/g) || [];
      tagLinks.forEach((link) => {
        const tagMatch = link.match(/>([^<]+)</);
        if (tagMatch) {
          const tag = tagMatch[1].trim().replace(/^#/, "");
          themes.push({ id: tag, title: tag });
        }
      });
    }

    // Extract status
    const statusMatch = response.data.match(
      /狀態：<\/li>[\s\S]*?<span class="comicParticulars-right-txt"[^>]*>([^<]+)<\/span>/
    );
    let status = PublicationStatus.ONGOING;
    if (statusMatch) {
      const statusText = statusMatch[1].trim();
      if (statusText === "已完結" || statusText === "短篇") {
        status = PublicationStatus.COMPLETED;
      }
    }

    return {
      title,
      cover,
      creators,
      summary,
      status,
      webUrl: `${baseUrl}/comic/${contentId}`,
      properties:
        themes.length > 0
          ? [
              {
                id: "theme",
                title: "題材",
                tags: themes,
              },
            ]
          : [],
    };
  }

  // Get chapter list for a manga
  async getChapters(contentId: string): Promise<Chapter[]> {
    // First, get the HTML manga detail page to extract the decryption key
    const baseUrl = await getBaseUrl();
    const mangaPageUrl = `${baseUrl}/comic/${contentId}`;
    const detailHeaders = await getRequestHeaders();
    const mangaPageResponse = await this.client.get(mangaPageUrl, {
      headers: detailHeaders,
    });

    // Extract the key from script tags in the HTML page
    // The key is in a script tag like: var key = 'some-key'
    const keyMatch = mangaPageResponse.data.match(/var\s+\w+\s*=\s*'([^']+)'/);
    if (!keyMatch || !keyMatch[1]) {
      throw new Error("Failed to extract decryption key from manga page");
    }
    const decryptionKey = keyMatch[1];

    // Now get the chapter list
    const url = await generateChapterListUrl(contentId);
    console.info(`GET: ${url}`);
    const headers = await getRequestHeaders({ includesDnts: true });
    const response = await this.client.get(url, { headers });

    const resultsMatch = response.data.match(/"results":"([^"]+)"/);
    if (!resultsMatch || !resultsMatch[1]) {
      return [];
    }

    const encryptedResults = resultsMatch[1];
    const decryptedResults = decryptString(encryptedResults, decryptionKey);

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

    // Extract the decryption key from script tag (same as in getChapters)
    const keyMatch = response.data.match(/var\s+\w+\s*=\s*'([^']+)'/);
    if (!keyMatch || !keyMatch[1]) {
      throw new Error("Failed to extract decryption key from chapter page");
    }
    const key = keyMatch[1];

    // Extract encrypted contentKey from script
    const contentKeyMatch = response.data.match(/var contentKey = '([^']+)'/);
    if (!contentKeyMatch || !contentKeyMatch[1]) {
      throw new Error("Failed to extract encrypted content key");
    }

    const encryptedContentKey = contentKeyMatch[1];
    const decryptedContent = decryptString(encryptedContentKey, key);

    const pageList = JSON.parse(decryptedContent);

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
    console.info(`GET: ${url}`);
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

    // Parse HTML to extract manga list from div.exemptComic-box[list] attribute
    const listMatch = response.data.match(
      /class="row exemptComic-box"[^>]*list="([^"]+)"/
    );
    if (!listMatch || !listMatch[1]) {
      return { results: [], isLastPage: true };
    }

    // Decode HTML entities and convert single quotes to double quotes
    const listJson = listMatch[1]
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/'([^']+)':/g, '"$1":') // Convert keys
      .replace(/:\s*'([^']*)'/g, ': "$1"'); // Convert string values

    const mangaList = JSON.parse(listJson);

    // Check if there's a next page by looking at pagination
    const hasMore = !response.data.includes('li class="page-all-item active"');

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
    console.info(`GET: ${url}`);
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
