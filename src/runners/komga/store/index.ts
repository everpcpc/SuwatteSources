export const KomgaStore = {
  host: () => ObjectStore.string("host"),
  credentials: () => SecureStore.string("credentials"),
  authenticated: () => ObjectStore.get("authenticated"),
  syncChaptersMarked: () => ObjectStore.boolean("syncChaptersMarked"),
};
