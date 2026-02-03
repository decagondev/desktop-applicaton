# Architecture Summary

**Project**: Second Brain Desktop Application | **Updated**: 2026-02-03

## Structure

| Area | Path | Purpose |
|------|------|---------|
| Electron Main | `electron/main.ts` | App lifecycle, IPC handlers, security |
| Preload | `electron/preload.ts` | Context bridge, safe API exposure |
| React App | `src/` | User interface and state |
| Features | `src/features/` | Feature modules (dashboard, chat, etc.) |
| Shared | `src/shared/` | Common utilities, types, contexts |
| Tests | `**/__tests__/` | Co-located with source files |
| Docs | `docs/`, `.lbi/docs/` | Documentation |

## Stack

| Layer | Tech | Version |
|-------|------|---------|
| Language | TypeScript | 5.x |
| UI | React | 18.x |
| Build | Vite | 5.x |
| Desktop | Electron | 40+ |
| Styling | Tailwind CSS | 4.x |
| Testing | Vitest | 1.x |
| Vector DB | SQLite + VSS | - |
| LLM | Groq SDK | - |

## Critical Paths

- `electron/main.ts` → Application entry, all IPC handlers
- `electron/preload.ts` → Security boundary, API exposure
- `src/features/{feature}/index.ts` → Feature public API
- `src/shared/types/electron.d.ts` → IPC type definitions
- `.lbi/memory/constitution.md` → Development principles

## Integration Points

- **Groq** → LLM chat completions, RAG responses
- **OpenAI** → Embeddings (text-embedding-3-small), Whisper transcription
- **Tavily** → Web search for real-time information
- **GitHub** → Repository cloning, issues, PRs, diffs

## Patterns

- **Feature Modules**: `components/`, `hooks/`, `context/`, `types/`, `index.ts`
- **IPC Naming**: `{feature}-{action}` (e.g., `vector-add`, `chat-query`)
- **Interface Naming**: Prefix with `I` (e.g., `IVectorEntry`, `IChatMessage`)
- **Context Pattern**: Provider + useContext hook per feature
- **Testing**: `__tests__/` subfolder, `.test.ts(x)` extension

## Security Model

- `nodeIntegration: false` - No Node.js in renderer
- `contextIsolation: true` - Separate renderer context
- `safeStorage` - Encrypted API key storage
- CSP headers - Restrict resource loading
- Input validation - All IPC handlers validate input

## Data Flow

```
User Action → Renderer → IPC → Main Process → Service → External API
                                    ↓
                              SQLite/Vector DB
```

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Vector DB | In-memory + SQLite | Speed + persistence |
| LLM | Groq (primary) | Fast inference, good free tier |
| Embeddings | OpenAI | High quality, standard dimensions |
| State | React Context | Simple, co-located with features |
| Testing | Vitest | Fast, Vite-native |

## Quality Gates

- 80% test coverage minimum
- ESLint zero errors
- TypeScript strict mode pass
- All IPC handlers documented
- Security checklist complete
