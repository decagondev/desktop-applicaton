# API Reference

This document provides a complete reference for the Deca Dash API, including IPC handlers, TypeScript interfaces, and the exposed Electron API.

## Table of Contents

- [Electron API](#electron-api)
- [IPC Handlers](#ipc-handlers)
- [TypeScript Interfaces](#typescript-interfaces)
- [React Hooks](#react-hooks)
- [React Contexts](#react-contexts)

---

## Electron API

The Electron API is exposed to the renderer process via the preload script using `contextBridge`. Access it via `window.electronAPI`.

### API Shape

```typescript
interface ElectronAPI {
  platform: string;
  versions: ElectronVersions;
  isPackaged: boolean;
  getMemoryStats: () => Promise<IMemoryStats | null>;
  getNetworkStats: () => Promise<INetworkStats | null>;
  getSystemInfo: () => Promise<ISystemInfo | null>;
  getTopProcesses: (count?: number) => Promise<IProcessInfo[] | null>;
  toggleKioskMode: () => Promise<boolean>;
  getKioskMode: () => Promise<boolean>;
}
```

### Properties

#### `platform`
- **Type**: `string`
- **Description**: Current operating system platform
- **Values**: `'win32'` | `'darwin'` | `'linux'`

```typescript
const platform = window.electronAPI?.platform;
if (platform === 'win32') {
  console.log('Running on Windows');
}
```

#### `versions`
- **Type**: `ElectronVersions`
- **Description**: Version information for runtime components

```typescript
interface ElectronVersions {
  node: string;
  chrome: string;
  electron: string;
}

const { node, chrome, electron } = window.electronAPI?.versions ?? {};
console.log(`Electron ${electron}, Chrome ${chrome}, Node ${node}`);
```

#### `isPackaged`
- **Type**: `boolean`
- **Description**: Whether the app is running as a packaged production build

```typescript
if (window.electronAPI?.isPackaged) {
  console.log('Production build');
} else {
  console.log('Development mode');
}
```

### Methods

#### `getMemoryStats()`
Fetches current system memory statistics.

- **Returns**: `Promise<IMemoryStats | null>`
- **Throws**: Never (returns `null` on error)

```typescript
const memory = await window.electronAPI?.getMemoryStats();
if (memory) {
  console.log(`Memory: ${memory.usedPercent.toFixed(1)}% used`);
  console.log(`Total: ${memory.total} bytes`);
  console.log(`Used: ${memory.used} bytes`);
  console.log(`Free: ${memory.free} bytes`);
}
```

#### `getNetworkStats()`
Fetches current network statistics for the primary interface.

- **Returns**: `Promise<INetworkStats | null>`
- **Throws**: Never (returns `null` on error)

```typescript
const network = await window.electronAPI?.getNetworkStats();
if (network) {
  console.log(`Download: ${network.rxSec} bytes/sec`);
  console.log(`Upload: ${network.txSec} bytes/sec`);
  console.log(`Total downloaded: ${network.rxBytes} bytes`);
  console.log(`Total uploaded: ${network.txBytes} bytes`);
}
```

#### `getSystemInfo()`
Fetches static system information (CPU, OS, hostname).

- **Returns**: `Promise<ISystemInfo | null>`
- **Throws**: Never (returns `null` on error)

```typescript
const info = await window.electronAPI?.getSystemInfo();
if (info) {
  console.log(`Host: ${info.hostname}`);
  console.log(`OS: ${info.osName} ${info.osVersion}`);
  console.log(`CPU: ${info.cpuModel} (${info.cpuCores} cores)`);
}
```

#### `getTopProcesses(count?)`
Fetches top processes sorted by CPU usage.

- **Parameters**:
  - `count` (optional): Number of processes to return (default: 10)
- **Returns**: `Promise<IProcessInfo[] | null>`
- **Throws**: Never (returns `null` on error)

```typescript
const processes = await window.electronAPI?.getTopProcesses(5);
if (processes) {
  processes.forEach(proc => {
    console.log(`${proc.name} (PID ${proc.pid}): ${proc.cpu}% CPU, ${proc.memoryPercent}% RAM`);
  });
}
```

#### `toggleKioskMode()`
Toggles fullscreen kiosk mode.

- **Returns**: `Promise<boolean>` - New kiosk mode state
- **Throws**: Never (returns `false` on error)

```typescript
const isNowKiosk = await window.electronAPI?.toggleKioskMode();
console.log(isNowKiosk ? 'Entered kiosk mode' : 'Exited kiosk mode');
```

#### `getKioskMode()`
Gets current kiosk mode state.

- **Returns**: `Promise<boolean>` - Current kiosk mode state
- **Throws**: Never (returns `false` on error)

```typescript
const isKiosk = await window.electronAPI?.getKioskMode();
console.log(isKiosk ? 'In kiosk mode' : 'Normal mode');
```

---

## IPC Handlers

IPC handlers are registered in the main process (`electron/main.ts`) and handle requests from the renderer process.

### Handler Registration Pattern

```typescript
import { ipcMain } from 'electron';

ipcMain.handle('channel-name', async (event, ...args) => {
  try {
    // Perform operation
    return result;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
});
```

### Available Handlers

| Channel | Parameters | Returns | Description |
|---------|------------|---------|-------------|
| `get-memory-stats` | none | `IMemoryStats \| null` | System memory statistics |
| `get-network-stats` | none | `INetworkStats \| null` | Network I/O statistics |
| `get-system-info` | none | `ISystemInfo \| null` | CPU, OS, hostname info |
| `get-top-processes` | `count?: number` | `IProcessInfo[] \| null` | Top processes by CPU |
| `toggle-kiosk-mode` | none | `boolean` | Toggle fullscreen mode |
| `get-kiosk-mode` | none | `boolean` | Get fullscreen state |

### Adding a New Handler

1. **Define the handler in `electron/main.ts`**:

```typescript
ipcMain.handle('my-custom-handler', async (_event, param1: string, param2: number) => {
  try {
    const result = await someAsyncOperation(param1, param2);
    return result;
  } catch (error) {
    console.error('Error in my-custom-handler:', error);
    return null;
  }
});
```

2. **Expose in `electron/preload.ts`**:

```typescript
interface ElectronAPI {
  // ... existing methods
  myCustomMethod: (param1: string, param2: number) => Promise<MyReturnType | null>;
}

const electronAPI: ElectronAPI = {
  // ... existing methods
  myCustomMethod: (param1, param2) => ipcRenderer.invoke('my-custom-handler', param1, param2),
};
```

3. **Update types in `src/shared/types/electron.d.ts`**:

```typescript
export interface ElectronAPI {
  // ... existing methods
  myCustomMethod: (param1: string, param2: number) => Promise<MyReturnType | null>;
}
```

---

## TypeScript Interfaces

### Memory Statistics

```typescript
interface IMemoryStats {
  /** Total memory in bytes */
  total: number;
  /** Used memory in bytes */
  used: number;
  /** Free memory in bytes */
  free: number;
  /** Used memory percentage (0-100) */
  usedPercent: number;
}
```

### Network Statistics

```typescript
interface INetworkStats {
  /** Total bytes received (download) */
  rxBytes: number;
  /** Total bytes transmitted (upload) */
  txBytes: number;
  /** Current receive speed in bytes/second */
  rxSec: number;
  /** Current transmit speed in bytes/second */
  txSec: number;
}
```

### System Information

```typescript
interface ISystemInfo {
  /** CPU model name */
  cpuModel: string;
  /** Number of CPU cores */
  cpuCores: number;
  /** Operating system name */
  osName: string;
  /** Operating system version */
  osVersion: string;
  /** Machine hostname */
  hostname: string;
}
```

### Process Information

```typescript
interface IProcessInfo {
  /** Process ID */
  pid: number;
  /** Process name */
  name: string;
  /** CPU usage percentage */
  cpu: number;
  /** Memory usage in bytes */
  memory: number;
  /** Memory usage percentage */
  memoryPercent: number;
}
```

### Stats History Point

```typescript
interface IStatsHistoryPoint {
  /** Timestamp of the data point */
  timestamp: number;
  /** Memory stats at this point */
  memory: IMemoryStats | null;
  /** Network stats at this point */
  network: INetworkStats | null;
}
```

### Stats State

```typescript
interface IStatsState {
  /** Current memory stats */
  memory: IMemoryStats | null;
  /** Current network stats */
  network: INetworkStats | null;
  /** System information (loaded once) */
  systemInfo: ISystemInfo | null;
  /** Top processes by resource usage */
  processes: IProcessInfo[] | null;
  /** History of stats for charts */
  history: IStatsHistoryPoint[];
  /** Whether stats are currently being fetched */
  isLoading: boolean;
  /** Error message if fetching failed */
  error: string | null;
}
```

---

## React Hooks

### `useSystemStats`

Main hook for fetching and managing system statistics.

```typescript
import { useSystemStats } from '@features/dashboard';

interface IUseSystemStatsOptions {
  /** Polling interval in milliseconds (default: 2000) */
  pollInterval?: number;
  /** Maximum number of history points to keep (default: 60) */
  maxHistoryLength?: number;
  /** Whether to start polling immediately (default: true) */
  autoStart?: boolean;
}

interface UseSystemStatsReturn extends IStatsState {
  /** Refresh stats manually */
  refreshStats: () => Promise<void>;
  /** Clear history */
  clearHistory: () => void;
  /** Whether stats API is available */
  isAvailable: boolean;
}

function useSystemStats(options?: IUseSystemStatsOptions): UseSystemStatsReturn;
```

#### Usage

```typescript
function MyComponent() {
  const {
    memory,
    network,
    processes,
    systemInfo,
    history,
    isLoading,
    error,
    isAvailable,
    refreshStats,
    clearHistory,
  } = useSystemStats({
    pollInterval: 1000,      // Poll every second
    maxHistoryLength: 120,   // Keep 2 minutes of history
    autoStart: true,
  });

  if (!isAvailable) {
    return <div>Stats not available (web mode)</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <p>Memory: {memory?.usedPercent.toFixed(1)}%</p>
      <button onClick={refreshStats} disabled={isLoading}>
        Refresh
      </button>
    </div>
  );
}
```

---

## React Contexts

### `StatsContext`

Provides system statistics to the component tree.

```typescript
import { StatsProvider, useStats, useStatsOptional } from '@features/dashboard';

// Provider
<StatsProvider options={{ pollInterval: 2000 }}>
  <App />
</StatsProvider>

// Consumer (throws if outside provider)
function MyComponent() {
  const { memory, network, processes } = useStats();
  return <div>{memory?.usedPercent}%</div>;
}

// Optional consumer (returns null if outside provider)
function OptionalComponent() {
  const stats = useStatsOptional();
  if (!stats) return null;
  return <div>{stats.memory?.usedPercent}%</div>;
}
```

### `ElectronContext`

Provides Electron API access and platform detection.

```typescript
import { ElectronProvider, useElectronAPI } from '@shared/index';

// Provider
<ElectronProvider>
  <App />
</ElectronProvider>

// Consumer
function MyComponent() {
  const { isElectron, platform, electronAPI } = useElectronAPI();
  
  if (!isElectron) {
    return <div>Running in browser</div>;
  }
  
  return <div>Platform: {platform}</div>;
}
```

---

## Constants

### Stats Defaults

```typescript
const STATS_DEFAULTS = {
  POLL_INTERVAL: 2000,      // 2 seconds
  MAX_HISTORY_LENGTH: 60,   // 60 data points (2 min at default interval)
  CHART_HEIGHT: 200,
  PIE_INNER_RADIUS: 60,
  PIE_OUTER_RADIUS: 80,
} as const;
```

### Chart Colors

```typescript
const CHART_COLORS = {
  memory: {
    used: '#3b82f6',    // blue-500
    free: '#64748b',    // slate-500
  },
  network: {
    download: '#22c55e', // green-500
    upload: '#f59e0b',   // amber-500
  },
  background: '#1e293b', // slate-800
  grid: '#334155',       // slate-700
  text: '#94a3b8',       // slate-400
} as const;
```

---

## Error Handling

All API methods follow a consistent error handling pattern:

1. **Never throw** - Methods return `null` on error
2. **Log errors** - Errors are logged to console in main process
3. **Graceful degradation** - UI shows appropriate fallback states

```typescript
// Main process
ipcMain.handle('get-data', async () => {
  try {
    return await fetchData();
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;  // Never throw
  }
});

// Renderer process
const data = await window.electronAPI?.getData();
if (data === null) {
  // Handle error state
  showErrorMessage('Failed to fetch data');
}
```
