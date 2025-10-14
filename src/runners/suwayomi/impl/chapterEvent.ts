import { ChapterEventHandler } from "@suwatte/daisuke";
import { graphqlRequest } from "../api";
import { SuwayomiStore } from "../store";

export const SuwayomiChapterEvent: ChapterEventHandler = {
  onChaptersMarked: async function (
    _: string,
    chapterIds: string[],
    completed: boolean
  ): Promise<void> {
    const syncChaptersMarked = await SuwayomiStore.syncChaptersMarked();
    if (!syncChaptersMarked) {
      return;
    }

    const promises = chapterIds.map((v) => markAsRead(v, completed));
    const state = await Promise.allSettled(promises);

    const failing = state.filter((v) => v.status === "rejected").length;

    if (failing) {
      console.error(`Failed to mark ${failing} Chapters`);
    }
  },

  onChapterRead: async function (_: string, chapterId: string): Promise<void> {
    return markAsRead(chapterId);
  },

  async onPageRead(_, chapterId, page) {
    const mutation = `
      mutation UpdateChapterProgress($id: Int!, $lastPageRead: Int!) {
        updateChapter(input: { id: $id, patch: { lastPageRead: $lastPageRead } }) {
          chapter {
            id
            lastPageRead
          }
        }
      }
    `;

    return graphqlRequest<any>(mutation, {
      id: parseInt(chapterId),
      lastPageRead: page,
    });
  },
};

const markAsRead = async (chapterId: string, completed = true) => {
  const mutation = `
    mutation UpdateChapterRead($id: Int!, $isRead: Boolean!) {
      updateChapter(input: { id: $id, patch: { isRead: $isRead } }) {
        chapter {
          id
          isRead
        }
      }
    }
  `;

  await graphqlRequest<any>(mutation, {
    id: parseInt(chapterId),
    isRead: completed,
  });
};
