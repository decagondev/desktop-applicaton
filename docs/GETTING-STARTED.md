# Getting Started with Second Brain Development

This guide walks you through setting up your development environment for the Second Brain Desktop Application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm 10+** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **VS Code or Cursor** - Recommended IDE

### Verify Installation

```bash
node --version   # Should be 20.x or higher
npm --version    # Should be 10.x or higher
git --version    # Any recent version
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/second-brain.git
cd second-brain
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- React 19, Vite 7, TypeScript
- Electron 40
- Testing libraries (Vitest)
- Development tools (ESLint, Prettier)

### 3. Start Development

#### Web Preview (Fast Iteration)

For quick UI development without Electron:

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

Note: Web preview doesn't have access to system stats or file system.

#### Desktop Development (Full Features)

For full Electron development:

```bash
npm run dev:desktop
```

This starts:
1. Vite dev server for hot-reload
2. Electron main process
3. Opens the desktop window

## Project Overview

### Directory Structure

```
second-brain/
├── electron/           # Electron main process
│   ├── main.ts        # App entry, IPC handlers
│   └── preload.ts     # Secure API bridge
├── src/               # React application
│   ├── features/      # Feature modules
│   ├── shared/        # Shared utilities
│   └── main.tsx       # React entry
├── docs/              # Documentation
├── .lbi/              # LBI workflow files
│   ├── memory/        # Constitution
│   ├── docs/          # Architecture docs
│   └── specs/         # Feature specs
└── .cursor/           # Cursor configuration
    ├── commands/      # LBI commands
    └── rules/         # Project rules
```

### Feature Modules

Each feature in `src/features/` follows this pattern:

```
src/features/{feature}/
├── components/        # React components
│   └── __tests__/    # Component tests
├── hooks/            # Custom hooks
│   └── __tests__/    # Hook tests
├── context/          # React context (if stateful)
├── services/         # Business logic
├── types/            # TypeScript types
└── index.ts          # Barrel export
```

## Development Workflow

### Understanding the LBI Workflow

This project uses spec-driven development:

```
/lbi.request → /lbi.specify → /lbi.design → /lbi.plan → /lbi.implement → /lbi.tests → /lbi.push
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Creating a New Feature

1. **Create a feature branch**
   ```bash
   git checkout -b feature/E1-US1.1-my-feature
   ```

2. **Follow the LBI workflow**
   - Use `/lbi.request` to capture requirements
   - Use `/lbi.specify` to create technical spec
   - Use `/lbi.plan` to create implementation plan

3. **Implement the feature**
   - Create the feature directory: `src/features/my-feature/`
   - Follow the module pattern
   - Write tests as you go

4. **Test and merge**
   ```bash
   npm run test
   npm run lint
   git checkout main
   git merge feature/E1-US1.1-my-feature
   ```

## Common Tasks

### Running Tests

```bash
# Watch mode (development)
npm run test

# Single run
npm run test:run

# With coverage report
npm run test:coverage
```

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Building for Production

```bash
# Build web application
npm run build

# Build desktop for all platforms
npm run build:desktop

# Build for specific platform
npm run build:desktop:win    # Windows
npm run build:desktop:mac    # macOS
npm run build:desktop:linux  # Linux
```

### Type Checking

```bash
npm run typecheck
```

## IDE Setup

### VS Code / Cursor Extensions

Install these recommended extensions:

1. **ESLint** - Linting
2. **Prettier** - Code formatting
3. **TypeScript** - TypeScript support
4. **Tailwind CSS IntelliSense** - CSS utilities
5. **Vitest** - Test runner integration

### Recommended Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## API Keys (Optional)

For full functionality, you'll need API keys:

| Service | Purpose | Get Key |
|---------|---------|---------|
| Groq | LLM chat | [console.groq.com](https://console.groq.com/) |
| OpenAI | Embeddings, Whisper | [platform.openai.com](https://platform.openai.com/) |
| Tavily | Web search | [tavily.com](https://tavily.com/) |
| GitHub | Repo integration | [github.com/settings/tokens](https://github.com/settings/tokens) |

API keys are stored securely using Electron's safeStorage.

## Troubleshooting

### "Electron failed to start"

Ensure you're running the desktop command:
```bash
npm run dev:desktop  # Not npm run dev
```

### "Module not found" errors

Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

### Tests failing

Ensure Electron mock is set up:
```typescript
import { setupElectronMock } from '@/test/mocks/electron';

beforeEach(() => {
  setupElectronMock();
});
```

### TypeScript errors

Run type check to see all issues:
```bash
npm run typecheck
```

## Next Steps

1. Read the [Project Constitution](.lbi/memory/constitution.md) to understand principles
2. Review [Architecture Documentation](.lbi/docs/architecture/) for system design
3. Check [Feature Development Guide](FEATURE-DEVELOPMENT.md) for creating features
4. See [CONTRIBUTING.md](CONTRIBUTING.md) for workflow details

## Resources

- [React Documentation](https://react.dev/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
