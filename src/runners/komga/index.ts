import {
  CatalogRating,
  ContentSource,
  RunnerInfo,
  SourceConfig,
} from "@suwatte/daisuke";
import {
  KomgaAuthentication,
  KomgaBookEvent,
  KomgaContentSource,
  KomgaDirectoryHandler,
  KomgaImageHandler,
  KomgaMSB,
  KomgaPageProvider,
  KomgaPreferenceProvider,
  KomgaProgressProvider,
  KomgaSetupProvider,
} from "./impl";
import { KomgaPageLinkResolver } from "./impl/pageLinkResolver";

// Define
type Komga = ContentSource;

// Info
const info: RunnerInfo = {
  id: "org.komga",
  name: "Komga",
  version: 1.19,
  minSupportedAppVersion: "6.0.0",
  thumbnail: "komga.png",
  website: "https://komga.org",
  supportedLanguages: ["UNIVERSAL"],
  rating: CatalogRating.SAFE,
};

// Config
const config: SourceConfig = {
  disableChapterDataCaching: true, // Refetch image list each time
  // disableLibraryActions: false,
  // disableContentLinking: false,
  // disableMigrationDestination: false,
  // disableUpdateChecks: false,
  disableCustomThumbnails: true,
  disableLanguageFlags: true,
  disableTrackerLinking: true,
  allowsMultipleInstances: true,
  requiresAuthenticationToAccessContent: true,
};

export const Target: Komga = {
  info,
  config,
  ...KomgaContentSource,
  ...KomgaDirectoryHandler,
  ...KomgaPageProvider,
  ...KomgaPageLinkResolver,
  ...KomgaAuthentication,
  ...KomgaPreferenceProvider,
  ...KomgaMSB,
  ...KomgaImageHandler,
  ...KomgaBookEvent,
  ...KomgaSetupProvider,
  ...KomgaProgressProvider,
};
