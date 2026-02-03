/**
 * Electron preload script
 * Runs in isolated context with access to both DOM and Node.js APIs
 * Exposes safe APIs to the renderer process via context bridge
 * 
 * Security: Only expose minimal, safe APIs through contextBridge
 * All exposed methods should be type-safe and validated
 */

import { contextBridge, ipcRenderer } from 'electron'

/**
 * Memory stats interface
 */
interface IMemoryStats {
  total: number;
  used: number;
  free: number;
  usedPercent: number;
}

/**
 * Network stats interface
 */
interface INetworkStats {
  rxBytes: number;
  txBytes: number;
  rxSec: number;
  txSec: number;
}

/**
 * System info interface
 */
interface ISystemInfo {
  cpuModel: string;
  cpuCores: number;
  osName: string;
  osVersion: string;
  hostname: string;
}

/**
 * Process info interface
 */
interface IProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  memoryPercent: number;
}

/**
 * Electron API interface
 * Define all methods exposed to the renderer process
 * This should match the ElectronAPI type in src/shared/types/electron.d.ts
 */
interface ElectronAPI {
  platform: NodeJS.Platform;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  isPackaged: boolean;
  getMemoryStats: () => Promise<IMemoryStats | null>;
  getNetworkStats: () => Promise<INetworkStats | null>;
  getSystemInfo: () => Promise<ISystemInfo | null>;
  getTopProcesses: (count?: number) => Promise<IProcessInfo[] | null>;
  toggleKioskMode: () => Promise<boolean>;
  getKioskMode: () => Promise<boolean>;
}

/**
 * Create the API object to expose
 */
const electronAPI: ElectronAPI = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  isPackaged: !process.env.NODE_ENV?.includes('development'),
  getMemoryStats: () => ipcRenderer.invoke('get-memory-stats'),
  getNetworkStats: () => ipcRenderer.invoke('get-network-stats'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getTopProcesses: (count?: number) => ipcRenderer.invoke('get-top-processes', count),
  toggleKioskMode: () => ipcRenderer.invoke('toggle-kiosk-mode'),
  getKioskMode: () => ipcRenderer.invoke('get-kiosk-mode'),
}

/**
 * Expose protected methods to the renderer process
 * Uses contextBridge for secure communication
 */
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

/**
 * Vector Store API
 * Exposes vector database operations to the renderer
 */
const vectorStoreAPI = {
  addEntry: (entry: unknown) => ipcRenderer.invoke('vector-add', entry),
  search: (queryEmbedding: number[], options?: unknown) => 
    ipcRenderer.invoke('vector-search', queryEmbedding, options),
  getEntry: (id: string) => ipcRenderer.invoke('vector-get', id),
  deleteEntry: (id: string) => ipcRenderer.invoke('vector-delete', id),
  getStats: () => ipcRenderer.invoke('vector-stats'),
  sync: () => ipcRenderer.invoke('vector-sync'),
  generateEmbedding: (text: string, model?: string) => 
    ipcRenderer.invoke('vector-generate-embedding', text, model),
  generateBatchEmbeddings: (texts: string[], model?: string) => 
    ipcRenderer.invoke('vector-generate-batch-embeddings', texts, model),
  isEmbeddingAvailable: () => ipcRenderer.invoke('vector-embedding-available'),
}

contextBridge.exposeInMainWorld('vectorStoreAPI', vectorStoreAPI)

/**
 * Settings API
 * Exposes settings operations to the renderer
 */
const settingsAPI = {
  getSettings: () => ipcRenderer.invoke('settings-get'),
  saveSettings: (settings: unknown) => ipcRenderer.invoke('settings-save', settings),
  setApiKey: (key: string, value: string) => 
    ipcRenderer.invoke('settings-set-api-key', key, value),
  removeApiKey: (key: string) => ipcRenderer.invoke('settings-remove-api-key', key),
  hasApiKey: (key: string) => ipcRenderer.invoke('settings-has-api-key', key),
  getApiKey: (key: string) => ipcRenderer.invoke('settings-get-api-key', key),
}

contextBridge.exposeInMainWorld('settingsAPI', settingsAPI)

/**
 * Chat API
 * Exposes AI chat operations to the renderer
 */
const chatAPI = {
  queryWithRag: (query: string, history: unknown[], options?: unknown) =>
    ipcRenderer.invoke('chat-query-with-rag', query, history, options),
  chatCompletion: (messages: unknown[], options?: unknown) =>
    ipcRenderer.invoke('chat-completion', messages, options),
}

contextBridge.exposeInMainWorld('chatAPI', chatAPI)

