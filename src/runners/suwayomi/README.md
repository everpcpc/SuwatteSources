# Suwayomi Runner

Suwayomi runner for Suwatte - a GraphQL-based manga server client implementation.

## Features

- **GraphQL API Support**: Full GraphQL-based communication with Suwayomi server
- **Content Management**: Browse and read manga from your Suwayomi library
- **Progress Sync**: Automatic reading progress synchronization
- **Custom Preferences**: Configure server URL

## Structure

```
suwayomi/
├── api/              # GraphQL API layer
│   ├── manga.ts     # Manga and chapter queries
│   ├── request.ts   # GraphQL request handler
│   └── index.ts
├── impl/            # Feature implementations
│   ├── contentSource.ts    # Content fetching
│   ├── directoryHandler.ts # Library browsing
│   ├── imageHandler.ts     # Image request handling
│   ├── pageLinkProvider.ts # Page navigation
│   ├── preference.ts       # Settings UI
│   ├── progressSync.ts     # Reading progress sync
│   ├── setup.ts           # Initial setup
│   └── index.ts
├── store/           # Persistent storage
│   └── index.ts
├── types/           # TypeScript type definitions
│   └── index.ts     # GraphQL types (MangaType, ChapterType, etc.)
├── utils/           # Helper functions
│   ├── constants.ts # Constants and enums
│   ├── helpers.ts   # Conversion utilities
│   └── index.ts
├── index.ts         # Main entry point
└── README.md
```

## Key Differences from Komga

1. **No Library Concept**: Suwayomi doesn't have multiple libraries like Komga. All manga are in a single collection.
2. **GraphQL API**: Uses GraphQL instead of REST API for all data fetching.
3. **Different Data Model**:
   - Komga: Series → Books
   - Suwayomi: Manga → Chapters

## Setup

1. Configure your Suwayomi server URL in the runner preferences
2. Browse your library and start reading!

## API Queries

The runner uses several GraphQL queries:

- `GetMangas`: Fetch all manga in library
- `GetManga`: Fetch single manga details
- `GetChapters`: Fetch chapters for a manga
- `GetMangaProgress`: Sync reading progress

## Configuration

Server URL can be configured in preferences. The runner supports:

- HTTP and HTTPS protocols
- Custom port numbers

Default: `http://localhost:4567`
