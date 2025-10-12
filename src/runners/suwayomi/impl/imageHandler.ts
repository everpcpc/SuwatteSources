import { ImageRequestHandler } from "@suwatte/daisuke";

export const SuwayomiImageHandler: ImageRequestHandler = {
  willRequestImage: async (url: string) => {
    return {
      url,
    };
  },
};
