import { AuthMode } from "../types/auth";

/**
 * Store for Suwayomi Configuration
 */
export const SuwayomiStore = {
  host: async () => {
    const value = await ObjectStore.string("host");
    return value ?? "";
  },
  setHost: async (host: string) => {
    await ObjectStore.set("host", host);
  },

  credentials: async () => {
    const value = await SecureStore.string("credentials");
    return value;
  },
  setCredentials: async (credentials: string) => {
    await SecureStore.set("credentials", credentials);
  },
  removeCredentials: async () => {
    await SecureStore.remove("credentials");
  },

  authenticated: async () => {
    const value = await ObjectStore.boolean("authenticated");
    return value;
  },
  setAuthenticated: async (authenticated: boolean) => {
    await ObjectStore.set("authenticated", authenticated);
  },
  removeAuthenticated: async () => {
    await ObjectStore.remove("authenticated");
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
  setSyncChaptersMarked: async (sync: boolean) => {
    await ObjectStore.set("syncChaptersMarked", sync);
  },
};
