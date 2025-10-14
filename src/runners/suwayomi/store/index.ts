import { AuthMode } from "../types/auth";

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
  credentials: async () => {
    const value = await SecureStore.string("credentials");
    return value;
  },
  authenticated: async () => {
    const value = await ObjectStore.boolean("authenticated");
    return value;
  },
  authMode: async (): Promise<AuthMode> => {
    const value = await ObjectStore.string("authMode");
    return (value as AuthMode) ?? AuthMode.NONE;
  },
  setAuthMode: async (mode: AuthMode) => {
    await ObjectStore.set("authMode", mode);
  },
  syncChaptersMarked: async () => {
    const value = await ObjectStore.boolean("syncChaptersMarked");
    return value;
  },
};
