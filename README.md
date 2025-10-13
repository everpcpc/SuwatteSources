# Suwatte Sources

This repository contains content sources (runners) for [Suwatte](https://suwatte.app/), a manga and comic reader app for iOS.

## 📚 Available Sources

### Komga

- **ID**: `org.komga`
- **Description**: Self-hosted digital comic/manga server
- **Website**: https://komga.org
- **Language**: Universal
- **Features**:
  - Browse your Komga library
  - Sync reading progress
  - Multiple instance support
  - Authentication required

### Suwayomi

- **ID**: `org.suwayomi`
- **Description**: Tachiyomi server implementation for accessing manga sources
- **Website**: https://github.com/Suwayomi
- **Language**: Universal
- **Features**:
  - Access Tachiyomi extensions via server
  - Sync reading progress
  - Multiple instance support
  - Optional authentication

### 拷贝漫画 (CopyManga)

- **ID**: `zh.copymanga`
- **Description**: Popular Chinese manga platform
- **Website**: https://www.mangacopy.com/
- **Language**: Chinese (zh)
- **Features**:
  - Browse and search manga
  - Multiple ranking lists (daily, weekly, monthly, total)
  - Filter by theme, status, region
  - Domain switching (China/Global)

## 🚀 Development

### Prerequisites

- Node.js
- pnpm (v10.18.2+)

### Installation

```bash
pnpm install
```

### Available Scripts

- `pnpm dev` - Start development mode with auto-reload
- `pnpm build` - Build all runners
- `pnpm serve` - Serve runners locally
- `pnpm test` - Run tests
- `pnpm lint` - Run linter

### Project Structure

```
src/runners/
├── komga/           # Komga runner
│   ├── api/         # API client
│   ├── impl/        # Implementation
│   ├── store/       # State management
│   └── types/       # Type definitions
├── suwayomi/        # Suwayomi runner
│   ├── api/         # API client
│   ├── impl/        # Implementation
│   └── types/       # Type definitions
└── zh.copymanga/    # CopyManga runner
    ├── constants.ts
    ├── types.ts
    └── utils.ts
```

## 📦 Building

To build the runners for distribution:

```bash
pnpm build
```

Built runners will be available in the `stt/runners/` directory as `.stt` files.

## 🧪 Testing

This repository is used for internal testing of Suwatte.

Run tests with:

```bash
pnpm test
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related

- [Suwatte App](https://suwatte.app/) - The main application
- [Suwatte Documentation](https://docs.suwatte.app/) - Official documentation
- [@suwatte/daisuke](https://www.npmjs.com/package/@suwatte/daisuke) - Runner development framework
