/**
 * Electron API type definitions
 * Must match the API exposed in electron/preload.ts
 */

export interface ElectronVersions {
  node: string;
  chrome: string;
  electron: string;
}

/**
 * Memory statistics from the system
 */
export interface IMemoryStats {
  /** Total memory in bytes */
  total: number;
  /** Used memory in bytes */
  used: number;
  /** Free memory in bytes */
  free: number;
  /** Used memory percentage (0-100) */
  usedPercent: number;
}

/**
 * Network statistics from the system
 */
export interface INetworkStats {
  /** Total bytes received (download) */
  rxBytes: number;
  /** Total bytes transmitted (upload) */
  txBytes: number;
  /** Current receive speed in bytes/second */
  rxSec: number;
  /** Current transmit speed in bytes/second */
  txSec: number;
}

/**
 * System information
 */
export interface ISystemInfo {
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

/**
 * Process information for top processes widget
 */
export interface IProcessInfo {
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

export interface ElectronAPI {
  /** Current platform (win32, darwin, linux) */
  platform: string;
  /** Version information for Node, Chrome, and Electron */
  versions: ElectronVersions;
  /** Whether the app is packaged for production */
  isPackaged: boolean;
  /** Get current memory statistics */
  getMemoryStats: () => Promise<IMemoryStats | null>;
  /** Get current network statistics */
  getNetworkStats: () => Promise<INetworkStats | null>;
  /** Get system information */
  getSystemInfo: () => Promise<ISystemInfo | null>;
  /** Get top processes by resource usage */
  getTopProcesses: (count?: number) => Promise<IProcessInfo[] | null>;
  /** Toggle kiosk/fullscreen mode */
  toggleKioskMode: () => Promise<boolean>;
  /** Get current kiosk mode state */
  getKioskMode: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

