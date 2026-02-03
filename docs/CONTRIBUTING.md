# Contributing to Second Brain Desktop Application

Thank you for your interest in contributing! This guide covers the development workflow, coding standards, and best practices.

## Table of Contents

- [Development Setup](#development-setup)
- [LBI Workflow](#lbi-workflow)
- [Git Workflow](#git-workflow)
- [Coding Standards](#coding-standards)
- [Architecture Guidelines](#architecture-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)

---

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/second-brain.git
cd second-brain

# Install dependencies
npm install

# Start development
npm run dev:desktop
```

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start web dev server |
| `npm run dev:desktop` | Start Electron with hot-reload |
| `npm run build` | Build web app |
| `npm run build:desktop` | Build Electron for all platforms |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |

### IDE Setup

#### VS Code / Cursor

Recommended extensions:
- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense

---

## LBI Workflow

This project uses the LBI (Lean Build Intelligence) spec-driven development workflow.

### Workflow Steps

For each feature, follow this workflow:

```
/lbi.request → /lbi.specify → /lbi.design → /lbi.plan → /lbi.implement → /lbi.tests → /lbi.review → /lbi.push
```

### Step Details

1. **`/lbi.request`** - Capture the feature request
   - Creates `.lbi/specs/{feature}/request.md`
   - Defines user goals, scope, and acceptance criteria

2. **`/lbi.specify`** - Create technical specification
   - Creates `.lbi/specs/{feature}/spec.md`
   - Defines requirements, components, test scenarios

3. **`/lbi.design`** - Create design documentation
   - Creates `.lbi/specs/{feature}/design.md`
   - Documents architecture decisions, data models, API design

4. **`/lbi.plan`** - Create implementation plan
   - Creates `.lbi/specs/{feature}/plan.md`
   - Breaks work into phases and tasks

5. **`/lbi.implement`** - Execute the plan
   - Follow the plan, commit granularly
   - Update plan as tasks complete

6. **`/lbi.tests`** - Write and run tests
   - 80% coverage minimum
   - All tests must pass

7. **`/lbi.review`** - Code review
   - Self-review or peer review
   - Check against constitution

8. **`/lbi.push`** - Merge and push
   - Merge to main
   - Clean up feature branch

### Project Constitution

Read `.lbi/memory/constitution.md` for project principles and quality standards. All contributions must comply with the constitution.

---

## Git Workflow

### Branch Naming

Use the epic and user story convention:

```
feature/E{epic}-US{story}-{slug}    # New features
fix/{description}                    # Bug fixes
chore/{description}                  # Maintenance
docs/{description}                   # Documentation only
refactor/{description}               # Code refactoring
```

### Examples

```
feature/E1-US1.1-vector-db
feature/E2-US2.1-document-upload
feature/E3-US3.1-chat-interface
fix/memory-leak-in-polling
chore/update-dependencies
```

### Workflow Steps

1. **Create a feature branch from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/E1-US1.1-vector-db
   ```

2. **Make atomic commits**
   ```bash
   # Each commit should be one logical change
   git add src/features/vector-store/types/
   git commit -m "feat: add VectorStore type definitions"
   
   git add src/features/vector-store/services/
   git commit -m "feat: implement VectorStoreService"
   ```

3. **Write tests for your feature**
   ```bash
   git add src/features/vector-store/__tests__/
   git commit -m "test: add VectorStore unit tests"
   ```

4. **Run tests before merging**
   ```bash
   npm run test:run
   npm run lint
   npm run build
   ```

5. **Merge to main**
   ```bash
   git checkout main
   git merge feature/E1-US1.1-vector-db
   git branch -d feature/E1-US1.1-vector-db
   ```

### Commit Message Format

Use conventional commit format:

```
<type>: <description>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat: add vector store with SQLite backup
fix: correct memory leak in stats polling
docs: update architecture documentation
test: add unit tests for PdfParser
refactor: extract embedding generation to service
```

---

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Prefix interfaces with `I` (e.g., `IVectorEntry`)
- Use explicit return types for functions
- Avoid `any` type without justification

```typescript
// Good
interface IVectorEntry {
  id: string;
  content: string;
  embedding: number[];
}

function processEntry(entry: IVectorEntry): IProcessedEntry {
  return { ...entry, processed: true };
}

// Bad
function processEntry(entry: any) {
  return { ...entry, processed: true };
}
```

### React Components

- Use functional components with hooks
- Define prop interfaces with JSDoc
- Keep components focused (single responsibility)
- Extract complex logic to custom hooks

```typescript
/**
 * Props for the MessageList component
 */
interface IMessageListProps {
  /** Array of messages to display */
  messages: IChatMessage[];
  /** Whether messages are loading */
  isLoading?: boolean;
}

export function MessageList({ 
  messages, 
  isLoading = false 
}: IMessageListProps): React.ReactElement {
  // ...
}
```

### File Organization

Follow the feature module pattern:

```
src/features/{feature}/
├── components/
│   ├── Component.tsx
│   └── __tests__/
│       └── Component.test.tsx
├── hooks/
│   ├── useHook.ts
│   └── __tests__/
│       └── useHook.test.ts
├── context/
│   └── FeatureContext.tsx
├── services/
│   └── FeatureService.ts
├── types/
│   └── feature.types.ts
└── index.ts  # Barrel exports
```

---

## Architecture Guidelines

### SOLID Principles

All code must follow SOLID principles:

1. **Single Responsibility**: One reason to change per class/module
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Subtypes substitutable for base types
4. **Interface Segregation**: Small, focused interfaces
5. **Dependency Inversion**: Depend on abstractions

See `.cursor/rules/solid-principles.mdc` for detailed examples.

### Feature Module Pattern

Each feature should be self-contained:

1. **Components**: UI elements
2. **Hooks**: Business logic and data fetching
3. **Context**: State management
4. **Services**: External integrations
5. **Types**: TypeScript interfaces
6. **Index**: Public exports (barrel file)

### IPC Pattern

For Electron IPC communication:

1. Define handler in `electron/main.ts` or `electron/modules/`
2. Expose via `electron/preload.ts`
3. Add types in `src/shared/types/`
4. Use via `window.{api}` in renderer

See `.cursor/rules/electron-ipc.mdc` for details.

---

## Testing Requirements

### Coverage

- Minimum 80% coverage for new code
- All public functions must have tests
- Test edge cases and error conditions

### Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('feature', () => {
    it('should do expected behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Run Tests

```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

---

## Documentation

### Required Documentation

1. **JSDoc comments** for all public functions
2. **README updates** for user-facing features
3. **Architecture docs** for significant changes
4. **Type exports** documented in index.ts

### JSDoc Example

```typescript
/**
 * Search the vector store for relevant entries
 * 
 * @param query - Search query text
 * @param options - Search options
 * @returns Array of search results with relevance scores
 * @throws {VectorStoreError} If the store is not initialized
 * 
 * @example
 * ```typescript
 * const results = await vectorStore.search('how to deploy', { limit: 5 });
 * ```
 */
async search(query: string, options?: ISearchOptions): Promise<ISearchResult[]>
```

---

## Pull Request Process

### Before Submitting

1. **Run the full test suite**
   ```bash
   npm run test:run
   ```

2. **Run linting**
   ```bash
   npm run lint
   ```

3. **Build successfully**
   ```bash
   npm run build
   ```

4. **Update documentation** if needed

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added for new functionality
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch named correctly
- [ ] LBI workflow followed

### Review Criteria

PRs will be reviewed for:

1. **Code quality**: Follows coding standards
2. **Architecture**: Follows SOLID principles
3. **Testing**: Adequate test coverage (80%+)
4. **Documentation**: Proper comments and docs
5. **Security**: No security vulnerabilities
6. **Constitution compliance**: Follows project principles

---

## Questions?

1. Check existing documentation in `docs/` and `.lbi/docs/`
2. Read the constitution at `.lbi/memory/constitution.md`
3. Check Cursor rules in `.cursor/rules/`
4. Open an issue for discussion
