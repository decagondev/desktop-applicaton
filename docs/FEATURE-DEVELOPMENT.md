# Feature Development Guide

This guide explains how to create new features for the Second Brain Desktop Application following the established patterns and principles.

## Feature Module Pattern

Every feature follows a standardized structure:

```
src/features/{feature-name}/
├── components/
│   ├── {ComponentName}.tsx
│   └── __tests__/
│       └── {ComponentName}.test.tsx
├── hooks/
│   ├── use{HookName}.ts
│   └── __tests__/
│       └── use{HookName}.test.ts
├── context/                    # Optional: if stateful
│   └── {Feature}Context.tsx
├── services/                   # Optional: business logic
│   ├── {ServiceName}Service.ts
│   └── __tests__/
│       └── {ServiceName}Service.test.ts
├── types/
│   └── {feature-name}.types.ts
├── constants/                  # Optional
│   └── {feature-name}.constants.ts
└── index.ts                    # Barrel export (REQUIRED)
```

## Step-by-Step: Creating a Feature

### 1. Plan the Feature

Before coding, follow the LBI workflow:

```bash
# Create feature branch
git checkout -b feature/E{epic}-US{story}-{feature-name}
```

Use the LBI commands:
- `/lbi.request` - Capture requirements
- `/lbi.specify` - Create technical spec
- `/lbi.design` - Document design decisions
- `/lbi.plan` - Create implementation plan

### 2. Create the Directory Structure

```bash
mkdir -p src/features/my-feature/{components,hooks,context,services,types}/__tests__
```

### 3. Define Types

Start with type definitions:

```typescript
// src/features/my-feature/types/my-feature.types.ts

/**
 * Configuration for the MyFeature component
 */
export interface IMyFeatureConfig {
  /** Whether the feature is enabled */
  enabled: boolean;
  /** Maximum items to display */
  maxItems: number;
}

/**
 * A single item in the feature
 */
export interface IMyFeatureItem {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Context state for MyFeature
 */
export interface IMyFeatureContext {
  /** Current items */
  items: IMyFeatureItem[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Add a new item */
  addItem: (item: Omit<IMyFeatureItem, 'id'>) => Promise<void>;
  /** Remove an item by ID */
  removeItem: (id: string) => Promise<void>;
}
```

### 4. Create the Context (if stateful)

```typescript
// src/features/my-feature/context/MyFeatureContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { IMyFeatureContext, IMyFeatureItem } from '../types/my-feature.types';

const MyFeatureContext = createContext<IMyFeatureContext | null>(null);

interface IMyFeatureProviderProps {
  children: ReactNode;
}

/**
 * Provider for MyFeature state management
 */
export function MyFeatureProvider({ children }: IMyFeatureProviderProps): React.ReactElement {
  const [items, setItems] = useState<IMyFeatureItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCallback(async (item: Omit<IMyFeatureItem, 'id'>) => {
    setIsLoading(true);
    try {
      const newItem: IMyFeatureItem = {
        ...item,
        id: crypto.randomUUID(),
      };
      setItems(prev => [...prev, newItem]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const value: IMyFeatureContext = {
    items,
    isLoading,
    error,
    addItem,
    removeItem,
  };

  return (
    <MyFeatureContext.Provider value={value}>
      {children}
    </MyFeatureContext.Provider>
  );
}

/**
 * Hook to access MyFeature context
 * @throws Error if used outside MyFeatureProvider
 */
export function useMyFeature(): IMyFeatureContext {
  const context = useContext(MyFeatureContext);
  if (!context) {
    throw new Error('useMyFeature must be used within MyFeatureProvider');
  }
  return context;
}
```

### 5. Create Custom Hooks

```typescript
// src/features/my-feature/hooks/useMyFeatureData.ts
import { useState, useEffect, useCallback } from 'react';
import type { IMyFeatureItem } from '../types/my-feature.types';

interface UseMyFeatureDataOptions {
  /** Polling interval in ms (0 to disable) */
  pollInterval?: number;
}

interface UseMyFeatureDataReturn {
  data: IMyFeatureItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage MyFeature data
 * 
 * @param options - Configuration options
 * @returns Data state and refresh function
 */
export function useMyFeatureData(
  options: UseMyFeatureDataOptions = {}
): UseMyFeatureDataReturn {
  const { pollInterval = 0 } = options;
  
  const [data, setData] = useState<IMyFeatureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch data from IPC or API
      const result = await window.myFeatureAPI?.getData();
      if (result) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    if (pollInterval > 0) {
      const interval = setInterval(refresh, pollInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, pollInterval]);

  return { data, isLoading, error, refresh };
}

export type { UseMyFeatureDataOptions, UseMyFeatureDataReturn };
```

### 6. Create Components

```typescript
// src/features/my-feature/components/MyFeatureList.tsx
import { memo } from 'react';
import type { IMyFeatureItem } from '../types/my-feature.types';

/**
 * Props for MyFeatureList component
 */
interface IMyFeatureListProps {
  /** Items to display */
  items: IMyFeatureItem[];
  /** Callback when item is clicked */
  onItemClick?: (item: IMyFeatureItem) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Displays a list of MyFeature items
 */
function MyFeatureListComponent({
  items,
  onItemClick,
  className = '',
}: IMyFeatureListProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <div className={`text-slate-400 text-center py-8 ${className}`}>
        No items yet
      </div>
    );
  }

  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map(item => (
        <li
          key={item.id}
          className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer"
          onClick={() => onItemClick?.(item)}
        >
          <h3 className="font-medium text-slate-200">{item.name}</h3>
          <p className="text-sm text-slate-400">
            {item.createdAt.toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );
}

export const MyFeatureList = memo(MyFeatureListComponent);
```

### 7. Create the Barrel Export

```typescript
// src/features/my-feature/index.ts

/**
 * MyFeature public API
 * 
 * @packageDocumentation
 */

// Components
export { MyFeatureList } from './components/MyFeatureList';
export { MyFeatureForm } from './components/MyFeatureForm';

// Hooks
export { useMyFeatureData } from './hooks/useMyFeatureData';
export type { 
  UseMyFeatureDataOptions, 
  UseMyFeatureDataReturn 
} from './hooks/useMyFeatureData';

// Context
export { MyFeatureProvider, useMyFeature } from './context/MyFeatureContext';

// Types
export type {
  IMyFeatureConfig,
  IMyFeatureItem,
  IMyFeatureContext,
} from './types/my-feature.types';
```

### 8. Add IPC Handlers (if needed)

```typescript
// electron/modules/my-feature.ts
import { ipcMain } from 'electron';

/**
 * Register IPC handlers for MyFeature
 */
export function registerMyFeatureHandlers(): void {
  ipcMain.handle('my-feature-get-data', async () => {
    try {
      // Fetch data
      return { items: [] };
    } catch (error) {
      console.error('Error in my-feature-get-data:', error);
      return null;
    }
  });

  ipcMain.handle('my-feature-add-item', async (_event, item) => {
    try {
      // Add item
      return { success: true };
    } catch (error) {
      console.error('Error in my-feature-add-item:', error);
      return { success: false, error: 'Failed to add item' };
    }
  });
}
```

Update preload:

```typescript
// electron/preload.ts (add to existing)
const myFeatureAPI = {
  getData: () => ipcRenderer.invoke('my-feature-get-data'),
  addItem: (item) => ipcRenderer.invoke('my-feature-add-item', item),
};

contextBridge.exposeInMainWorld('myFeatureAPI', myFeatureAPI);
```

Add types:

```typescript
// src/shared/types/my-feature.d.ts
interface IMyFeatureAPI {
  getData: () => Promise<{ items: IMyFeatureItem[] } | null>;
  addItem: (item: Omit<IMyFeatureItem, 'id'>) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    myFeatureAPI?: IMyFeatureAPI;
  }
}

export {};
```

### 9. Write Tests

```typescript
// src/features/my-feature/components/__tests__/MyFeatureList.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MyFeatureList } from '../MyFeatureList';

describe('MyFeatureList', () => {
  const mockItems = [
    { id: '1', name: 'Item 1', createdAt: new Date('2024-01-01') },
    { id: '2', name: 'Item 2', createdAt: new Date('2024-01-02') },
  ];

  it('renders items correctly', () => {
    render(<MyFeatureList items={mockItems} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    render(<MyFeatureList items={[]} />);

    expect(screen.getByText('No items yet')).toBeInTheDocument();
  });

  it('calls onItemClick when item clicked', () => {
    const handleClick = vi.fn();
    render(<MyFeatureList items={mockItems} onItemClick={handleClick} />);

    fireEvent.click(screen.getByText('Item 1'));

    expect(handleClick).toHaveBeenCalledWith(mockItems[0]);
  });
});
```

### 10. Integrate into App

```typescript
// src/App.tsx
import { MyFeatureProvider } from '@features/my-feature';

export function App(): React.ReactElement {
  return (
    <MyFeatureProvider>
      {/* Your app content */}
    </MyFeatureProvider>
  );
}
```

## SOLID Principles Checklist

When creating a feature, verify:

- [ ] **Single Responsibility**: Each component/hook does one thing
- [ ] **Open/Closed**: Can extend via props/config without modifying
- [ ] **Liskov Substitution**: Components with same interface are interchangeable
- [ ] **Interface Segregation**: Interfaces are small and focused
- [ ] **Dependency Inversion**: Uses context/props, not direct imports

## Quality Checklist

Before completing a feature:

- [ ] All components have tests (80%+ coverage)
- [ ] All hooks have tests
- [ ] Types are fully defined with JSDoc
- [ ] Barrel export includes all public API
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] Documentation updated

## Common Patterns

### Loading/Error States

```typescript
function MyComponent() {
  const { data, isLoading, error } = useMyFeatureData();

  if (error) {
    return <ErrorState message={error} />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <DataDisplay data={data} />;
}
```

### Form Handling

```typescript
function MyForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(validationErrors);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Polling Data

```typescript
const { data, refresh } = useMyFeatureData({
  pollInterval: 5000, // Poll every 5 seconds
});
```

## Resources

- [Component Architecture](.lbi/docs/architecture/component-architecture.md)
- [SOLID Principles](.cursor/rules/solid-principles.mdc)
- [Testing Conventions](.cursor/rules/testing.mdc)
- [TypeScript Conventions](.cursor/rules/typescript-conventions.mdc)
