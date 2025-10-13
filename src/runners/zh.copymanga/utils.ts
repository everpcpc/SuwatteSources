import {
  Chapter,
  DirectoryRequest,
  Highlight,
  PagedResult,
  PublicationStatus,
  ReadingMode,
} from "@suwatte/daisuke";
import {
  ChapterGroup,
  MangaExcerpt,
  Part,
  Region,
  SearchParams,
  Status,
} from "./types";
import { DECRYPT_KEY, DOMAINS, LIMIT } from "./constants";
import CryptoJS from "crypto-js";
import { ConfigStore } from "./store";

export const getBaseUrl = async (): Promise<string> => {
  const domain = await ConfigStore.domain();
  return `https://www.${domain || DOMAINS.China}`;
};

export const getApiBaseUrl = async (): Promise<string> => {
  const domain = await ConfigStore.domain();
  return `https://api.${domain || DOMAINS.China}`;
};

export const getRequestHeaders = async (
  options: { includesDnts?: boolean } = {}
): Promise<Record<string, string>> => {
  const baseUrl = await getBaseUrl();
  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
    Referer: baseUrl,
  };

  if (options.includesDnts) {
    headers["dnts"] = "1";
  }

  return headers;
};

export const decryptString = (
  encryptedString: string,
  decryptionKey?: string
): string => {
  try {
    const iv = encryptedString.substring(0, 16);
    const hexCiphertext = encryptedString.substring(16);

    // Use the provided key or fall back to the default key
    const keyString = decryptionKey || DECRYPT_KEY;
    const key = CryptoJS.enc.Utf8.parse(keyString);
    const ivBytes = CryptoJS.enc.Utf8.parse(iv);

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(hexCiphertext),
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: ivBytes,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};

// Parse search request to URL parameters
export const parseSearchRequest = (request: DirectoryRequest): SearchParams => {
  const page = request.page ?? 1;
  const offset = (page - 1) * LIMIT;
  const params: SearchParams = {
    limit: LIMIT,
    offset,
  };

  if (request.query) {
    params.q = request.query;
  }

  if (request.filters) {
    const { theme, status, region } = request.filters;
    if (theme) params.theme = theme as string;
    if (status) params.status = status as string;
    if (region) params.region = region as string;
  }

  if (request.sort) {
    if (request.sort.ascending) {
      params.ordering = request.sort.id;
    } else {
      params.ordering = `-${request.sort.id}`;
    }
  }

  return params;
};

// Convert manga excerpt to highlight
export const mangaToHighlight = (manga: MangaExcerpt): Highlight => {
  return {
    id: manga.path_word,
    title: manga.name,
    cover: manga.cover.replace(".328x422.jpg", ""),
  };
};

// Convert manga list to page result
export const mangaListToPageResult = (
  mangaList: MangaExcerpt[],
  hasMore: boolean
): PagedResult => {
  return {
    results: mangaList.map(mangaToHighlight),
    isLastPage: !hasMore,
  };
};

// Convert status code to publication status
export const convertStatus = (statusCode: number): PublicationStatus => {
  switch (statusCode) {
    case Status.Ongoing:
      return PublicationStatus.ONGOING;
    case Status.Completed:
    case Status.OneShot:
      return PublicationStatus.COMPLETED;
    default:
      return PublicationStatus.ONGOING; // Default to ONGOING if unknown
  }
};

export const convertRegion = (region: number): Region => {
  switch (region) {
    case Region.Japan:
      return Region.Japan;
    case Region.Korea:
      return Region.Korea;
    case Region.West:
      return Region.West;
    default:
      return Region.Japan;
  }
};

export const regionToDisplay = (region: Region): string => {
  switch (region) {
    case Region.Japan:
      return "日漫";
    case Region.Korea:
      return "韓漫";
    case Region.West:
      return "美漫";
    default:
      return "其它";
  }
};

export const readingModeByRegion = (region: Region): ReadingMode => {
  switch (region) {
    case Region.Japan:
      return ReadingMode.PAGED_MANGA;
    case Region.Korea:
      return ReadingMode.WEBTOON;
    case Region.West:
      return ReadingMode.PAGED_COMIC;
    default:
      return ReadingMode.PAGED_MANGA;
  }
};

// Parse chapter title to extract volume and chapter numbers
export const parseChapterTitle = (chapterName: string, type: number): Part => {
  // If type is 3, don't parse, just return the title
  if (type === 3) {
    return {
      chapter: 0,
      title: chapterName,
    };
  }

  // Handle special cases first
  const trimmed = chapterName.trim();

  // Check for "全一X" patterns at the start
  if (trimmed.startsWith("全") && (trimmed[1] === "一" || trimmed[1] === "1")) {
    if (trimmed[2] === "卷" || trimmed[2] === "冊" || trimmed[2] === "册") {
      return {
        volume: 1,
        chapter: 0,
        title: chapterName,
      };
    }
    if (trimmed[2] === "話" || trimmed[2] === "话" || trimmed[2] === "回") {
      return {
        chapter: 1,
        title: chapterName,
      };
    }
  }

  const regex =
    /^(?<volume>第?(?<volume_num>[\d零一二三四五六七八九十百千]+(\.\d)?)[卷部季冊册]完?)?(?<chapter>(第|连载|CH)?(?<chapter_num>[\d零一二三四五六七八九十百千]+(\.\d+)?)(?<more_chapters>-(\d+(\.\d+)?))?[話话回]?)?([ +]|$)/;
  const match = regex.exec(trimmed);

  if (!match || !match.groups) {
    return {
      chapter: 0,
      title: chapterName,
    };
  }

  const getNumber = (str?: string): number | undefined => {
    if (!str) return;

    const chineseToArabic: Record<string, number> = {
      零: 0,
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
      十: 10,
      百: 100,
      千: 1000,
    };

    const numericValue = parseFloat(str);
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    let result = 0;
    let temp = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const value = chineseToArabic[char];

      if (value >= 10) {
        result += (temp === 0 ? 1 : temp) * value;
        temp = 0;
      } else if (value !== undefined) {
        temp = value;
      }
    }

    return result + temp;
  };

  const volumeNum = getNumber(match.groups.volume_num);
  const chapterNum = getNumber(match.groups.chapter_num);

  // Remove matched parts from the title
  let realTitle = trimmed;
  if (match.groups.volume) {
    realTitle = realTitle.replace(match.groups.volume, "");
  }
  if (!match.groups.more_chapters && match.groups.chapter) {
    realTitle = realTitle.replace(match.groups.chapter, "");
  }
  realTitle = realTitle.trim();

  return {
    volume: volumeNum,
    chapter: chapterNum ?? 0,
    title: realTitle || chapterName,
  };
};

// Get timestamp from UUID
// example: 43acc6f8-5d5d-11ee-9412-d3d228a76de6
export const getTimestampFromUuid = (uuid: string): number => {
  // UUID v1 format: time_low-time_mid-time_hi_and_version-clock_seq-node
  // Extract the time components
  const parts = uuid.split("-");
  if (parts.length !== 5) {
    throw new Error("Invalid UUID format");
  }

  // Extract time components (time_low, time_mid, time_hi_and_version)
  const timeLow = parseInt(parts[0], 16);
  const timeMid = parseInt(parts[1], 16);
  const timeHiAndVersion = parseInt(parts[2], 16) & 0x0fff; // Remove version bits

  // Combine time components into a 60-bit timestamp
  // Convert to BigInt to handle large numbers
  const timestamp =
    (BigInt(timeHiAndVersion) << 48n) |
    (BigInt(timeMid) << 32n) |
    BigInt(timeLow);

  // Convert to Unix timestamp (seconds since epoch)
  // UUID timestamp is 100-nanosecond intervals since October 15, 1582
  // Need to convert to Unix epoch (January 1, 1970)
  const UNIX_EPOCH_DIFF = 122192928000000000n; // Difference in 100ns intervals

  // Calculate Unix timestamp in 100ns intervals
  const unixTimestamp100Ns = timestamp - UNIX_EPOCH_DIFF;

  const seconds = Number(unixTimestamp100Ns / 10000000n);
  const fraction = Number(unixTimestamp100Ns % 10000000n) / 10000000;

  return seconds + fraction;
};

// Convert chapter groups to chapters array
export const chapterGroupsToChapters = async (
  groups: Record<string, ChapterGroup>,
  mangaId: string
): Promise<Chapter[]> => {
  const allChapters: {
    chapterId: string;
    chapterName: string;
    chapterType: number;
    timestamp: number;
    groupName: string;
  }[] = [];
  const baseUrl = await getBaseUrl();

  Object.values(groups).forEach((group) => {
    const groupName = group.name;

    group.chapters.forEach((chapter) => {
      const chapterId = chapter.id;

      try {
        const timestamp = getTimestampFromUuid(chapterId);
        allChapters.push({
          chapterId,
          chapterName: chapter.name,
          chapterType: chapter.type,
          timestamp,
          groupName,
        });
      } catch (error) {
        console.error(`Error processing chapter ${chapterId}:`, error);
      }
    });
  });

  allChapters.sort((a, b) => b.timestamp - a.timestamp);

  return allChapters.map((chapterInfo, index) => {
    // Parse the chapter name to extract volume/chapter numbers
    const part = parseChapterTitle(
      chapterInfo.chapterName,
      chapterInfo.chapterType
    );

    // Create the final title with group prefix if not default group
    const titlePrefix =
      chapterInfo.groupName === "默認" ? "" : `${chapterInfo.groupName}：`;
    const finalTitle = part.title
      ? `${titlePrefix}${part.title}`
      : `${titlePrefix}${chapterInfo.chapterName}`;

    return {
      id: chapterInfo.chapterId,
      chapterId: chapterInfo.chapterId,
      title: finalTitle,
      number: part.chapter,
      volume: part.volume,
      date: new Date(chapterInfo.timestamp * 1000),
      index,
      language: "zh",
      ...(chapterInfo.groupName !== "默認" && {
        providers: [{ id: chapterInfo.groupName, name: chapterInfo.groupName }],
      }),
      contentId: mangaId,
      url: `${baseUrl}/comic/${mangaId}/chapter/${chapterInfo.chapterId}`,
    };
  });
};

// API URL generators
export const generateExploreUrl = async (
  theme: string,
  top: string,
  ordering: string,
  page: number
): Promise<string> => {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/comics?theme=${theme}&top=${top}&ordering=${ordering}&limit=${LIMIT}&offset=${
    (page - 1) * LIMIT
  }`;
};

export const getSearchApiEndpoint = async (): Promise<string> => {
  const baseUrl = await getBaseUrl();
  const searchPageUrl = `${baseUrl}/search`;
  const headers = await getRequestHeaders();

  const client = new NetworkClient();
  const response = await client.get(searchPageUrl, { headers });

  // Extract the API endpoint from the search page
  const match = response.data.match(/const countApi = "([^"]+)"/);
  if (!match || !match[1]) {
    throw new Error("Failed to extract search API endpoint");
  }

  return match[1];
};

export const generateSearchUrl = async (
  query: string,
  page: number
): Promise<string> => {
  const searchApi = await getSearchApiEndpoint();
  return `${searchApi}?q=${encodeURIComponent(
    query
  )}&platform=2&limit=${LIMIT}&offset=${(page - 1) * LIMIT}&q_type=`;
};

export const generateRankUrl = async (
  dateType: string,
  page: number
): Promise<string> => {
  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}/api/v3/ranks?date_type=${dateType}&limit=${LIMIT}&offset=${
    (page - 1) * LIMIT
  }`;
};

export const generateRecsUrl = async (page: number): Promise<string> => {
  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}/api/v3/recs?pos=3200102&limit=${LIMIT}&offset=${
    (page - 1) * LIMIT
  }`;
};

export const generateNewestUrl = async (page: number): Promise<string> => {
  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}/api/v3/update/newest?limit=${LIMIT}&offset=${
    (page - 1) * LIMIT
  }`;
};

export const generateMangaDetailsUrl = async (id: string): Promise<string> => {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/comic/${id}`;
};

export const generateChapterListUrl = async (id: string): Promise<string> => {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/comicdetail/${id}/chapters`;
};

export const generatePageListUrl = async (
  mangaId: string,
  chapterId: string
): Promise<string> => {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/comic/${mangaId}/chapter/${chapterId}`;
};

// Check if the API response has more pages
export const hasMorePages = (data: any): boolean => {
  const total = data.total || 0;
  const offset = data.offset || 0;
  const limit = data.limit || LIMIT;

  return offset + limit < total;
};
