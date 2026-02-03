# Contributing to Deca Dash

Thank you for your interest in contributing! This guide covers the development workflow, coding standards, and best practices for contributing to Deca Dash.

## Table of Contents

- [Development Setup](#development-setup)
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
git clone https://github.com/your-org/deca-dash.git
cd deca-dash

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
| `npm run electron:build` | Build Electron code only |

### IDE Setup

#### VS Code / Cursor

Recommended extensions:
- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense

Recommended settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*=\\s*[\"']([^\"']*)[\"']", "([^\"']*)"]
  ]
}
```

---

## Git Workflow

### Branch Naming

Use descriptive branch names with prefixes:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/disk-monitoring` |
| `fix/` | Bug fixes | `fix/memory-leak` |
| `refactor/` | Code refactoring | `refactor/stats-hook` |
| `docs/` | Documentation | `docs/api-reference` |
| `test/` | Test additions | `test/network-section` |
| `chore/` | Maintenance | `chore/update-deps` |

### Workflow Steps

1. **Create a feature branch from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/my-feature
   ```

2. **Make atomic commits**
   ```bash
   # Each commit should be one logical change
   git add src/features/dashboard/components/MyWidget.tsx
   git commit -m "feat: add MyWidget component"
   
   git add src/features/dashboard/hooks/useMyData.ts
   git commit -m "feat: add useMyData hook"
   ```

3. **Write tests for your feature**
   ```bash
   git add src/features/dashboard/components/__tests__/MyWidget.test.tsx
   git commit -m "test: add tests for MyWidget"
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
   git merge --no-ff feature/my-feature
   git push origin main
   git branch -d feature/my-feature
   ```

### Commit Message Format

Use conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
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
feat(dashboard): add disk usage widget

fix(memory): correct percentage calculation

docs(api): add IPC handler documentation

refactor(stats): extract polling logic to custom hook

test(network): add NetworkSection component tests
```

---

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use explicit return types for functions
- Avoid `any` type

```typescript
// ✅ Good
interface IWidgetProps {
  title: string;
  data: IWidgetData[];
  onRefresh: () => void;
}

function Widget({ title, data, onRefresh }: IWidgetProps): React.ReactElement {
  return <div>{title}</div>;
}

// ❌ Bad
function Widget(props: any) {
  return <div>{props.title}</div>;
}
```

### React Components

- Use functional components with hooks
- Use `memo` for performance-critical components
- Keep components focused (single responsibility)
- Extract complex logic to custom hooks

```typescript
// ✅ Good - Focused component with extracted logic
function MemorySectionComponent(): React.ReactElement {
  const { memory, isLoading, error } = useStats();
  
  if (error) return <ErrorState error={error} />;
  if (isLoading) return <LoadingState />;
  
  return <MemoryDisplay data={memory} />;
}

export const MemorySection = memo(MemorySectionComponent);
```

### Styling

- Use Tailwind CSS utility classes
- Use responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- Keep class names organized (layout → spacing → colors → effects)

```typescript
// ✅ Good - Organized class names
<div className="
  flex flex-col sm:flex-row      {/* Layout */}
  gap-4 p-4 sm:p-6               {/* Spacing */}
  bg-slate-800 text-slate-200    {/* Colors */}
  rounded-lg transition-colors   {/* Effects */}
">

// ❌ Bad - Unorganized
<div className="text-slate-200 flex rounded-lg p-4 gap-4 bg-slate-800">
```

### File Organization

```
src/features/my-feature/
├── components/
│   ├── MyComponent.tsx
│   ├── MyOtherComponent.tsx
│   └── __tests__/
│       ├── MyComponent.test.tsx
│       └── MyOtherComponent.test.tsx
├── hooks/
│   ├── useMyHook.ts
│   └── __tests__/
│       └── useMyHook.test.ts
├── context/
│   └── MyContext.tsx
├── types/
│   └── my-feature.types.ts
└── index.ts  # Barrel exports
```

### Documentation

- Add JSDoc comments to all public functions
- Document component props with JSDoc
- Include usage examples in comments

```typescript
/**
 * StatCard displays a single metric with optional trend indicator.
 * 
 * @param props - Component props
 * @returns React element
 * 
 * @example
 * ```tsx
 * <StatCard
 *   label="Memory Usage"
 *   value="8.5"
 *   unit="GB"
 *   trend="up"
 * />
 * ```
 */
export function StatCard(props: IStatCardProps): React.ReactElement {
  // ...
}
```

---

## Architecture Guidelines

### SOLID Principles

#### Single Responsibility
Each module/component should have one reason to change.

```typescript
// ✅ Good - Single responsibility
function MemoryChart({ data }: { data: IMemoryStats }) { /* only renders chart */ }
function MemoryStats({ stats }: { stats: IMemoryStats }) { /* only displays stats */ }

// ❌ Bad - Multiple responsibilities
function MemorySection() {
  // Fetches data, formats it, displays stats, renders chart all in one
}
```

#### Open/Closed
Open for extension, closed for modification.

```typescript
// ✅ Good - Configurable via props
function LineGraph({ lines, colors, height }: ILineGraphProps) {
  // Can be extended with new line configurations without modifying
}

// ❌ Bad - Hardcoded configuration
function MemoryLineGraph() {
  // Only works for memory, can't be reused
}
```

#### Dependency Inversion
Depend on abstractions, not concrete implementations.

```typescript
// ✅ Good - Depends on context abstraction
function MyComponent() {
  const { data, refresh } = useStats();  // Uses context hook
  return <div>{data}</div>;
}

// ❌ Bad - Directly depends on implementation
function MyComponent() {
  const data = window.electronAPI.getData();  // Direct dependency
  return <div>{data}</div>;
}
```

### Feature Module Pattern

Each feature should be self-contained:

1. **Components**: UI elements
2. **Hooks**: Business logic and data fetching
3. **Context**: State management
4. **Types**: TypeScript interfaces
5. **Index**: Public exports

```typescript
// src/features/my-feature/index.ts
// Only export what's needed externally
export { MySection } from './components/MySection';
export { useMyData } from './hooks/useMyData';
export { MyProvider, useMyContext } from './context/MyContext';
export type { IMyData, IMyConfig } from './types/my-feature.types';
```

---

## Testing Requirements

### Test Coverage

- Aim for 80%+ coverage on business logic
- All components should have basic rendering tests
- All hooks should have unit tests
- All IPC handlers should be tested

### Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MyComponent } from '../MyComponent';
import { setupElectronMock, clearElectronMock } from '@/test/mocks/electron';

describe('MyComponent', () => {
  beforeEach(() => {
    setupElectronMock();
  });

  afterEach(() => {
    clearElectronMock();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders component heading', () => {
      render(<MyComponent />);
      expect(screen.getByText('My Component')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      render(<MyComponent />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls refresh on button click', async () => {
      const mockRefresh = vi.fn();
      render(<MyComponent onRefresh={mockRefresh} />);
      
      fireEvent.click(screen.getByText('Refresh'));
      
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('displays error message on failure', async () => {
      // Setup error state
      render(<MyComponent error="Something went wrong" />);
      
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Testing Hooks

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook());
    
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('fetches data on mount', async () => {
    const { result } = renderHook(() => useMyHook());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).not.toBeNull();
  });

  it('refreshes data on demand', async () => {
    const { result } = renderHook(() => useMyHook());
    
    await act(async () => {
      await result.current.refresh();
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

---

## Documentation

### Required Documentation

1. **JSDoc comments** for all public functions
2. **README updates** for new features
3. **API documentation** for new IPC handlers
4. **Type definitions** for new interfaces

### Documentation Checklist

- [ ] JSDoc comments added
- [ ] README.md updated (if user-facing feature)
- [ ] API.md updated (if new IPC handlers)
- [ ] EXTENSION-GUIDE.md updated (if new patterns)
- [ ] Type exports documented

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
   npm run build:desktop
   ```

4. **Update documentation** if needed

### PR Description Template

```markdown
## Summary
Brief description of changes.

## Changes
- Added X component
- Updated Y hook
- Fixed Z issue

## Testing
- [ ] Unit tests added
- [ ] Manual testing completed
- [ ] All tests passing

## Screenshots
(If UI changes)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Criteria

PRs will be reviewed for:

1. **Code quality**: Follows coding standards
2. **Architecture**: Follows SOLID principles
3. **Testing**: Adequate test coverage
4. **Documentation**: Proper comments and docs
5. **Performance**: No obvious performance issues
6. **Security**: No security vulnerabilities

---

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search existing issues
3. Open a new issue for discussion
