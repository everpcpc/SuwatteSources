import { PageLinkProvider, PageLinkLabel } from "@suwatte/daisuke";

export const SuwayomiPageProvider: PageLinkProvider = {
  async getLibraryPageLinks(): Promise<PageLinkLabel[]> {
    return [
      {
        title: "Library",
        link: {
          request: {
            page: 1,
          },
        },
      },
    ];
  },

  async getBrowsePageLinks(): Promise<PageLinkLabel[]> {
    return [
      {
        title: "Library",
        link: {
          request: {
            page: 1,
          },
        },
      },
    ];
  },
};
