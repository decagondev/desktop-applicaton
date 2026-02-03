# Extension Guide

This guide explains how to extend Deca Dash with new data sources, widgets, and features. Follow these patterns to maintain consistency with the existing architecture.

## Table of Contents

- [Adding a New Data Source](#adding-a-new-data-source)
- [Creating a New Widget](#creating-a-new-widget)
- [Adding Chart Types](#adding-chart-types)
- [Custom IPC Handlers](#custom-ipc-handlers)
- [State Management Patterns](#state-management-patterns)
- [Testing Extensions](#testing-extensions)

---

## Adding a New Data Source

### Step 1: Define the Data Interface

Create TypeScript interfaces for your data in `src/shared/types/electron.d.ts`:

```typescript
/**
 * Disk statistics
 */
export interface IDiskStats {
  /** Filesystem name */
  fs: string;
  /** Mount point */
  mount: string;
  /** Total size in bytes */
  size: number;
  /** Used space in bytes */
  used: number;
  /** Available space in bytes */
  available: number;
  /** Usage percentage */
  usedPercent: number;
}
```

### Step 2: Create the IPC Handler

Add the handler in `electron/main.ts`:

```typescript
import si from 'systeminformation';

/**
 * Get disk statistics
 * @returns Array of disk stats for all mounted filesystems
 */
ipcMain.handle('get-disk-stats', async () => {
  try {
    const disks = await si.fsSize();
    return disks.map(disk => ({
      fs: disk.fs,
      mount: disk.mount,
      size: disk.size,
      used: disk.used,
      available: disk.available,
      usedPercent: disk.use,
    }));
  } catch (error) {
    console.error('Error getting disk stats:', error);
    return null;
  }
});
```

### Step 3: Expose via Preload Script

Update `electron/preload.ts`:

```typescript
// Add to interface
interface ElectronAPI {
  // ... existing methods
  getDiskStats: () => Promise<IDiskStats[] | null>;
}

// Add to API object
const electronAPI: ElectronAPI = {
  // ... existing methods
  getDiskStats: () => ipcRenderer.invoke('get-disk-stats'),
};
```

### Step 4: Update Type Declarations

Update `src/shared/types/electron.d.ts`:

```typescript
export interface ElectronAPI {
  // ... existing methods
  getDiskStats: () => Promise<IDiskStats[] | null>;
}
```

### Step 5: Add to Dashboard Types

Update `src/features/dashboard/types/dashboard.types.ts`:

```typescript
import type { IDiskStats } from '@shared/types/electron.d';
export type { IDiskStats };

// Update state interface
export interface IStatsState {
  // ... existing fields
  disks: IDiskStats[] | null;
}
```

### Step 6: Update the Hook

Modify `src/features/dashboard/hooks/useSystemStats.ts`:

```typescript
// Add fetch function
const fetchDiskStats = useCallback(async (): Promise<IDiskStats[] | null> => {
  if (!isAvailable || !window.electronAPI) return null;
  try {
    return await window.electronAPI.getDiskStats();
  } catch (error) {
    console.error('Error fetching disk stats:', error);
    return null;
  }
}, [isAvailable]);

// Update refreshStats to include disks
const refreshStats = useCallback(async (): Promise<void> => {
  // ... existing code
  const [memory, network, processes, disks] = await Promise.all([
    fetchMemoryStats(),
    fetchNetworkStats(),
    fetchTopProcesses(10),
    fetchDiskStats(),
  ]);
  
  setState(prev => ({
    ...prev,
    memory,
    network,
    processes,
    disks,  // Add this
    // ... rest
  }));
}, [/* ... add fetchDiskStats */]);
```

---

## Creating a New Widget

### Widget Structure

Each widget should follow this structure:

```
src/features/dashboard/components/
├── DiskSection.tsx          # Main component
└── __tests__/
    └── DiskSection.test.tsx # Tests
```

### Basic Widget Template

```typescript
/**
 * DiskSection component
 * Displays disk usage statistics
 * Follows Single Responsibility - focused on disk display
 */

import { memo } from 'react';
import { useStats } from '../context/StatsContext';
import { StatCard } from './StatCard';
import { PieChart } from './PieChart';
import type { IPieSegment } from '../types/dashboard.types';
import { CHART_COLORS } from '../types/dashboard.types';

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Disk icon SVG component
 */
function DiskIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" 
      />
    </svg>
  );
}

/**
 * DiskSection component
 */
function DiskSectionComponent(): React.ReactElement {
  const { disks, isLoading, error, isAvailable } = useStats();

  // Handle unavailable state
  if (!isAvailable) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-slate-700/50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <DiskIcon /> Disk Usage
        </h2>
        <p className="text-slate-400 text-sm">
          Disk statistics are only available in the Electron app.
        </p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-red-700/50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <DiskIcon /> Disk Usage
        </h2>
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    );
  }

  // Handle loading state
  if (isLoading && !disks) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-slate-700/50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <DiskIcon /> Disk Usage
        </h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-slate-700/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-slate-700/50">
      <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <DiskIcon /> Disk Usage
      </h2>
      
      <div className="space-y-4">
        {disks?.map(disk => {
          const pieData: IPieSegment[] = [
            { name: 'Used', value: disk.used, color: CHART_COLORS.memory.used },
            { name: 'Free', value: disk.available, color: CHART_COLORS.memory.free },
          ];
          
          return (
            <div key={disk.mount} className="p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-200">{disk.mount}</span>
                <span className="text-xs text-slate-400">{disk.fs}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">Total</span>
                  <p className="text-slate-200">{formatBytes(disk.size)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Used</span>
                  <p className="text-slate-200">{formatBytes(disk.used)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Free</span>
                  <p className="text-slate-200">{formatBytes(disk.available)}</p>
                </div>
              </div>
              <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${disk.usedPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const DiskSection = memo(DiskSectionComponent);
```

### Add to Dashboard Layout

Update `src/features/dashboard/components/DashboardLayout.tsx`:

```typescript
import { DiskSection } from './DiskSection';

function DashboardLayoutComponent(): React.ReactElement {
  return (
    <div className="...">
      <main className="space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <MemorySection />
          <NetworkSection />
        </div>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <ProcessesSection />
          <DiskSection />  {/* Add new section */}
        </div>
      </main>
    </div>
  );
}
```

### Export from Feature Index

Update `src/features/dashboard/index.ts`:

```typescript
export { DiskSection } from './components/DiskSection';
```

---

## Adding Chart Types

### Using Recharts

Deca Dash uses Recharts for data visualization. Here's how to add new chart types:

#### Area Chart Example

```typescript
import { memo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../types/dashboard.types';

interface IAreaGraphProps {
  data: Array<{ timestamp: number; value: number }>;
  height?: number;
  color?: string;
}

function AreaGraphComponent({ 
  data, 
  height = 200,
  color = CHART_COLORS.memory.used 
}: IAreaGraphProps): React.ReactElement {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="timestamp" 
            tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
            tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
          />
          <YAxis 
            tick={{ fill: CHART_COLORS.text, fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: CHART_COLORS.background,
              border: `1px solid ${CHART_COLORS.grid}`,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const AreaGraph = memo(AreaGraphComponent);
```

#### Bar Chart Example

```typescript
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function BarGraphComponent({ data, height = 200 }): React.ReactElement {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fill: CHART_COLORS.text }} />
          <YAxis tick={{ fill: CHART_COLORS.text }} />
          <Tooltip />
          <Bar dataKey="value" fill={CHART_COLORS.memory.used} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## Custom IPC Handlers

### Handler Best Practices

1. **Always use try-catch**: Return `null` on errors, never throw
2. **Log errors**: Use `console.error` for debugging
3. **Validate inputs**: Check parameters before processing
4. **Use TypeScript**: Define parameter and return types

```typescript
/**
 * Custom IPC handler with validation
 */
ipcMain.handle('custom-operation', async (_event, options: CustomOptions) => {
  // Validate input
  if (!options || typeof options.id !== 'string') {
    console.error('Invalid options provided to custom-operation');
    return null;
  }

  try {
    // Perform operation
    const result = await performOperation(options);
    
    // Validate output
    if (!isValidResult(result)) {
      console.error('Invalid result from custom-operation');
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('Error in custom-operation:', error);
    return null;
  }
});
```

### Async Operations

For long-running operations, consider:

```typescript
// Main process
ipcMain.handle('long-operation', async (_event, id: string) => {
  try {
    // Report progress via webContents
    const webContents = BrowserWindow.getAllWindows()[0]?.webContents;
    
    const result = await longOperation(id, (progress) => {
      webContents?.send('operation-progress', { id, progress });
    });
    
    return result;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
});

// Preload - listen for progress
ipcRenderer.on('operation-progress', (_event, data) => {
  window.dispatchEvent(new CustomEvent('operation-progress', { detail: data }));
});
```

---

## State Management Patterns

### Context + Hook Pattern

Deca Dash uses the Context + Hook pattern for state management:

```typescript
// 1. Create context
const MyContext = createContext<MyState | null>(null);

// 2. Create provider
export function MyProvider({ children }: { children: ReactNode }) {
  const state = useMyLogic();  // Custom hook with logic
  return (
    <MyContext.Provider value={state}>
      {children}
    </MyContext.Provider>
  );
}

// 3. Create consumer hook
export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}

// 4. Create optional consumer hook
export function useMyContextOptional() {
  return useContext(MyContext);
}
```

### Polling Pattern

For real-time data, use the polling pattern:

```typescript
function usePolledData(interval: number = 2000) {
  const [data, setData] = useState<Data | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    const result = await window.electronAPI?.getData();
    setData(result);
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();
    
    // Start polling
    intervalRef.current = window.setInterval(fetchData, interval);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval]);

  return { data, refresh: fetchData };
}
```

---

## Testing Extensions

### Test Structure

```
src/features/dashboard/components/__tests__/
├── DiskSection.test.tsx
```

### Basic Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiskSection } from '../DiskSection';
import { StatsProvider } from '../../context/StatsContext';
import { setupElectronMock, clearElectronMock } from '@/test/mocks/electron';

describe('DiskSection', () => {
  beforeEach(() => {
    setupElectronMock();
  });

  afterEach(() => {
    clearElectronMock();
  });

  it('renders disk section heading', () => {
    render(
      <StatsProvider>
        <DiskSection />
      </StatsProvider>
    );
    
    expect(screen.getByText('Disk Usage')).toBeInTheDocument();
  });

  it('shows unavailable message in web mode', () => {
    clearElectronMock();  // Remove Electron mock
    
    render(
      <StatsProvider>
        <DiskSection />
      </StatsProvider>
    );
    
    expect(screen.getByText(/only available in the Electron app/)).toBeInTheDocument();
  });
});
```

### Update Test Mocks

Add mock data in `src/test/mocks/electron.ts`:

```typescript
export const mockDiskStats: IDiskStats[] = [
  {
    fs: '/dev/sda1',
    mount: 'C:',
    size: 500 * 1024 * 1024 * 1024,
    used: 250 * 1024 * 1024 * 1024,
    available: 250 * 1024 * 1024 * 1024,
    usedPercent: 50,
  },
];

export const mockElectronAPI: ElectronAPI = {
  // ... existing
  getDiskStats: async () => mockDiskStats,
};
```
