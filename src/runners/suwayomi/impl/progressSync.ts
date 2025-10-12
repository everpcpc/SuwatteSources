import { ProgressSyncHandler, ContentProgressState } from "@suwatte/daisuke";
import { graphqlRequest } from "../api";

export const SuwayomiProgressProvider: ProgressSyncHandler = {
  getProgressState: async function (
    mangaId: string
  ): Promise<ContentProgressState> {
    // Query to get manga progress
    const query = `
      query GetMangaProgress($id: Int!) {
        manga(id: $id) {
          id
          chapters {
            nodes {
              id
              isRead
              lastPageRead
              lastReadAt
            }
          }
        }
      }
    `;

    const data = await graphqlRequest<any>(query, { id: parseInt(mangaId) });
    const chapters = data.manga?.chapters?.nodes || [];

    const readChapterIds = chapters
      .filter((ch: any) => ch.isRead)
      .map((ch: any) => ch.id.toString());

    const lastReadChapter = chapters.find((ch: any) => Boolean(ch.lastReadAt));

    if (!lastReadChapter) {
      return { readChapterIds };
    }

    const lastReadAt = parseInt(lastReadChapter.lastReadAt);
    if (isNaN(lastReadAt)) {
      return { readChapterIds };
    }
    const readDate = new Date(lastReadAt * 1000);
    return {
      readChapterIds,
      currentReadingState: {
        chapterId: lastReadChapter.id.toString(),
        page: lastReadChapter.lastPageRead,
        readDate,
        progress:
          Math.round(
            (lastReadChapter.lastPageRead / lastReadChapter.pageCount) * 100
          ) / 100,
      },
    };
  },
};
