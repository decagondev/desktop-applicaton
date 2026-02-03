/**
 * Electron API mocks for testing
 * Allows testing Electron-dependent code without Electron runtime
 */

import type { ElectronAPI, IMemoryStats, INetworkStats, ISystemInfo, IProcessInfo } from '@shared/types/electron.d';

/**
 * Mock memory stats for testing
 */
export const mockMemoryStats: IMemoryStats = {
  total: 16 * 1024 * 1024 * 1024,
  used: 8 * 1024 * 1024 * 1024,
  free: 8 * 1024 * 1024 * 1024,
  usedPercent: 50,
};

/**
 * Mock network stats for testing
 */
export const mockNetworkStats: INetworkStats = {
  rxBytes: 1000000000,
  txBytes: 500000000,
  rxSec: 1024 * 1024,
  txSec: 512 * 1024,
};

/**
 * Mock system info for testing
 */
export const mockSystemInfo: ISystemInfo = {
  cpuModel: 'Intel Core i7-12700K',
  cpuCores: 12,
  osName: 'Windows 11',
  osVersion: '10.0.22000',
  hostname: 'test-machine',
};

/**
 * Mock processes for testing
 */
export const mockProcesses: IProcessInfo[] = [
  { pid: 1234, name: 'chrome.exe', cpu: 15.5, memory: 512 * 1024 * 1024, memoryPercent: 3.2 },
  { pid: 5678, name: 'node.exe', cpu: 8.2, memory: 256 * 1024 * 1024, memoryPercent: 1.6 },
  { pid: 9012, name: 'code.exe', cpu: 5.1, memory: 384 * 1024 * 1024, memoryPercent: 2.4 },
  { pid: 3456, name: 'explorer.exe', cpu: 2.3, memory: 128 * 1024 * 1024, memoryPercent: 0.8 },
  { pid: 7890, name: 'slack.exe', cpu: 1.5, memory: 192 * 1024 * 1024, memoryPercent: 1.2 },
];

/**
 * Mock Electron API object
 */
export const mockElectronAPI: ElectronAPI = {
  platform: 'win32',
  versions: {
    node: '20.0.0',
    chrome: '120.0.0',
    electron: '40.1.0',
  },
  isPackaged: false,
  getMemoryStats: async () => mockMemoryStats,
  getNetworkStats: async () => mockNetworkStats,
  getSystemInfo: async () => mockSystemInfo,
  getTopProcesses: async () => mockProcesses,
  toggleKioskMode: async () => false,
  getKioskMode: async () => false,
};

/**
 * Setup mock Electron environment
 * Call this in test setup to simulate Electron environment
 * 
 * @param platform - Platform to simulate (default: 'win32')
 * @param statsEnabled - Whether to enable stats API mocks (default: true)
 */
export function setupElectronMock(platform: string = 'win32', statsEnabled: boolean = true): void {
  const mockAPI: ElectronAPI = {
    platform,
    versions: {
      node: '20.0.0',
      chrome: '120.0.0',
      electron: '40.1.0',
    },
    isPackaged: false,
    getMemoryStats: statsEnabled ? async () => mockMemoryStats : async () => null,
    getNetworkStats: statsEnabled ? async () => mockNetworkStats : async () => null,
    getSystemInfo: statsEnabled ? async () => mockSystemInfo : async () => null,
    getTopProcesses: statsEnabled ? async () => mockProcesses : async () => null,
    toggleKioskMode: async () => false,
    getKioskMode: async () => false,
  };
  
  Object.defineProperty(window, 'electronAPI', {
    value: mockAPI,
    writable: true,
    configurable: true,
  });
}

/**
 * Clear Electron mock
 * Call this in test cleanup
 */
export function clearElectronMock(): void {
  Object.defineProperty(window, 'electronAPI', {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

/**
 * Create a custom mock for testing
 */
export function createElectronMock(overrides: Partial<ElectronAPI> = {}): ElectronAPI {
  return {
    ...mockElectronAPI,
    ...overrides,
  };
}

/**
 * Create mock memory stats with custom values
 */
export function createMockMemoryStats(overrides: Partial<IMemoryStats> = {}): IMemoryStats {
  return {
    ...mockMemoryStats,
    ...overrides,
  };
}

/**
 * Create mock network stats with custom values
 */
export function createMockNetworkStats(overrides: Partial<INetworkStats> = {}): INetworkStats {
  return {
    ...mockNetworkStats,
    ...overrides,
  };
}

/**
 * Create mock process info with custom values
 */
export function createMockProcessInfo(overrides: Partial<IProcessInfo> = {}): IProcessInfo {
  return {
    pid: 1234,
    name: 'test-process.exe',
    cpu: 5.0,
    memory: 256 * 1024 * 1024,
    memoryPercent: 1.6,
    ...overrides,
  };
}
