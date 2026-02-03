# Technology Stack: Second Brain Desktop Application

## Overview

This document catalogs all technologies, libraries, and tools used in the Second Brain Desktop Application.

## Core Stack

| Layer | Technology | Version | Purpose | Documentation |
|-------|------------|---------|---------|---------------|
| Language | TypeScript | 5.x | Primary development language | [typescriptlang.org](https://www.typescriptlang.org/) |
| UI Framework | React | 18.x | Component-based UI | [react.dev](https://react.dev/) |
| Build Tool | Vite | 5.x | Fast development and bundling | [vitejs.dev](https://vitejs.dev/) |
| Desktop Framework | Electron | 40+ | Cross-platform desktop wrapper | [electronjs.org](https://www.electronjs.org/) |
| Styling | Tailwind CSS | 4.x | Utility-first CSS framework | [tailwindcss.com](https://tailwindcss.com/) |

## Frontend Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| React Router | 6.x | Client-side routing |
| Recharts | 2.x | Data visualization / charts |
| React Markdown | - | Markdown rendering |
| Monaco Editor | - | Code/text editing |

## Backend / Main Process

| Library | Version | Purpose |
|---------|---------|---------|
| better-sqlite3 | - | SQLite database driver |
| systeminformation | - | System stats (existing dashboard) |

## AI / RAG Stack

| Library | Version | Purpose |
|---------|---------|---------|
| LangChain.js | - | RAG orchestration and chains |
| Groq SDK | - | Groq LLM API client |
| @xenova/transformers | - | Local embeddings (optional) |

## Vector Database

| Library | Version | Purpose |
|---------|---------|---------|
| SQLite-vss | - | Vector similarity search extension |
| FAISS.js | - | Alternative: Facebook AI similarity search |

## Document Processing

| Library | Version | Purpose |
|---------|---------|---------|
| pdf.js | - | PDF parsing |
| mammoth | - | DOCX to HTML conversion |
| marked | - | Markdown parsing |
| cheerio | - | HTML parsing and scraping |

## External API Integrations

| Service | Library | Purpose |
|---------|---------|---------|
| Groq | groq-sdk | LLM inference |
| Tavily | tavily-js | Web search API |
| GitHub | @octokit/rest | GitHub API client |
| Whisper | openai | Audio transcription |

## Git Integration

| Library | Version | Purpose |
|---------|---------|---------|
| simple-git | - | Git operations (clone, pull) |
| @octokit/rest | - | GitHub API (issues, PRs, diffs) |

## Testing Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 1.x | Unit and integration testing |
| @testing-library/react | - | React component testing |
| @testing-library/user-event | - | User interaction simulation |
| Playwright | 1.x | End-to-end testing |
| jsdom | - | DOM simulation for tests |

## Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| TypeScript | Type checking |
| electron-builder | Desktop app packaging |
| concurrently | Parallel script execution |

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | Root TypeScript config |
| `tsconfig.app.json` | App-specific TS config |
| `tsconfig.electron.json` | Electron main process TS config |
| `vite.config.ts` | Vite build configuration |
| `eslint.config.js` | ESLint rules |
| `package.json` | Dependencies and scripts |

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `GROQ_API_KEY` | Groq LLM API authentication | Yes (for chat) |
| `TAVILY_API_KEY` | Tavily search API authentication | Optional |
| `GITHUB_TOKEN` | GitHub API authentication | Optional |
| `OPENAI_API_KEY` | Whisper transcription | Optional |

## Minimum System Requirements

| Component | Requirement |
|-----------|-------------|
| OS | Windows 10+, macOS 10.15+, Ubuntu 20.04+ |
| RAM | 4GB minimum, 8GB recommended |
| Disk | 500MB for app, 1GB+ for data |
| Node.js | 18.x or 20.x (development) |

## Dependency Management

- **Package Manager**: npm (package-lock.json for reproducibility)
- **Dependency Updates**: Monthly review of security advisories
- **Version Pinning**: Exact versions in production, caret (^) in development

## Version Compatibility Matrix

| Electron | Node.js | Chromium | V8 |
|----------|---------|----------|-----|
| 40.x | 20.x | 134.x | 13.4 |

## Future Considerations

| Technology | Purpose | Status |
|------------|---------|--------|
| Tesseract.js | OCR for images | Planned (E2-US2.4) |
| CLIP embeddings | Multimodal search | Planned (E2-US2.4) |
| Transformers.js | Local embeddings | Optional fallback |
