import {
  CatalogRating,
  ContentSource,
  RunnerInfo,
  SourceConfig,
} from "@suwatte/daisuke";
import {
  SuwayomiChapterEvent,
  SuwayomiContentSource,
  SuwayomiDirectoryHandler,
  SuwayomiImageHandler,
  SuwayomiPageProvider,
  SuwayomiPreferenceProvider,
  SuwayomiProgressProvider,
  SuwayomiSetupProvider,
} from "./impl";

// Define
type Suwayomi = ContentSource;

// Info
const info: RunnerInfo = {
  id: "org.suwayomi",
  name: "Suwayomi",
  version: 1.1,
  minSupportedAppVersion: "6.0.0",
  thumbnail: "suwayomi.png",
  website: "https://github.com/Suwayomi",
  supportedLanguages: ["UNIVERSAL"],
  rating: CatalogRating.SAFE,
};

// Config
const config: SourceConfig = {
  disableChapterDataCaching: true, // Refetch image list each time
  disableLibraryActions: true, // Disable being able to add to user library
  disableContentLinking: true,
  disableCustomThumbnails: true,
  disableLanguageFlags: true,
  disableMigrationDestination: true,
  disableTrackerLinking: true,
  disableUpdateChecks: true,
  allowsMultipleInstances: true,
  requiresAuthenticationToAccessContent: false, // Authentication is optional for Suwayomi
};

export const Target: Suwayomi = {
  info,
  config,
  ...SuwayomiContentSource,
  ...SuwayomiDirectoryHandler,
  ...SuwayomiPageProvider,
  ...SuwayomiPreferenceProvider,
  ...SuwayomiImageHandler,
  ...SuwayomiChapterEvent,
  ...SuwayomiSetupProvider,
  ...SuwayomiProgressProvider,
};
