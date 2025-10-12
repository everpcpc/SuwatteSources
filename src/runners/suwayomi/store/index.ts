/**
 * Store for Suwayomi Configuration
 */
export const SuwayomiStore = {
  host: async () => {
    const value = await SecureStore.string("host");
    return value;
  },
  setHost: async (host: string) => {
    await SecureStore.set("host", host);
  },
};
