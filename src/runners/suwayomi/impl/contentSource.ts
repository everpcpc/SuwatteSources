import {
  Chapter,
  ChapterData,
  ChapterPage,
  Content,
  ContentSource,
} from "@suwatte/daisuke";
import {
  getChaptersForMangaAsChapters,
  getManga,
  getChapterPages,
} from "../api";
import { mangaToContent } from "../utils";

type OmittedKeys = "info" | "getDirectory" | "getDirectoryConfig";
export const SuwayomiContentSource: Omit<ContentSource, OmittedKeys> = {
  getContent: async function (contentId: string): Promise<Content> {
    const manga = await getManga(parseInt(contentId));
    return mangaToContent(manga);
  },
  getChapters: async function (contentId: string): Promise<Chapter[]> {
    return getChaptersForMangaAsChapters(parseInt(contentId));
  },
  getChapterData: async function (
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const pages = await getChapterPages(
      parseInt(contentId),
      parseInt(chapterId)
    );

    const chapterPages: ChapterPage[] = pages.map((url) => ({
      url,
    }));

    return {
      pages: chapterPages,
    };
  },
};
