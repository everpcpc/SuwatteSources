import { ImageRequestHandler, NetworkRequest } from "@suwatte/daisuke";
import { SuwayomiStore } from "../store";
import { AuthMode } from "../types/auth";

export const SuwayomiImageHandler: ImageRequestHandler = {
  willRequestImage: async (url: string): Promise<NetworkRequest> => {
    const authMode = await SuwayomiStore.authMode();
    const credentials = await SuwayomiStore.credentials();

    const headers: Record<string, string> = {
      Accept: "image/*",
    };

    // Add Basic Auth header only if in Basic Auth mode and credentials are available
    // Cookie mode will automatically send cookies, no need to add header
    if (authMode === AuthMode.BASIC && credentials) {
      headers.Authorization = `Basic ${credentials}`;
    }

    return {
      url,
      headers,
    };
  },
};
