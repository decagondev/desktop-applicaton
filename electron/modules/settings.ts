/**
 * Settings IPC Handlers
 * Handles all settings operations from renderer process
 * Uses Electron's safeStorage for secure API key storage
 */

import { ipcMain, safeStorage, app } from 'electron';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * AI Provider type
 */
type AIProvider = 'groq' | 'openai' | 'anthropic' | 'ollama' | 'together' | 'openrouter' | 'mistral' | 'moonshot' | 'perplexity' | 'deepseek';

/**
 * API key names
 */
type ApiKeyName = 'groq' | 'openai' | 'anthropic' | 'together' | 'openrouter' | 'mistral' | 'moonshot' | 'perplexity' | 'deepseek' | 'tavily' | 'github';

/**
 * Feature flags
 */
interface IFeatureFlags {
  multimodal: boolean;
  dashboard: boolean;
  webSearch: boolean;
  github: boolean;
  voiceNotes: boolean;
}

/**
 * Ollama configuration
 */
interface IOllamaConfig {
  baseUrl: string;
  enabled: boolean;
}

/**
 * User preferences
 */
interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  embeddingModel: 'groq' | 'openai' | 'local';
  maxHistoryLength: number;
  autoSyncInterval: number;
  aiProvider: AIProvider;
  aiModel: string;
}

/**
 * Settings storage format
 */
interface ISettingsStorage {
  features: IFeatureFlags;
  preferences: IUserPreferences;
  ollama?: IOllamaConfig;
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: ISettingsStorage = {
  features: {
    multimodal: false,
    dashboard: true,
    webSearch: false,
    github: false,
    voiceNotes: false,
  },
  preferences: {
    theme: 'system',
    embeddingModel: 'openai',
    maxHistoryLength: 100,
    autoSyncInterval: 300000,
    aiProvider: 'groq',
    aiModel: 'llama-3.3-70b-versatile',
  },
  ollama: {
    baseUrl: 'http://localhost:11434',
    enabled: false,
  },
};

/**
 * Get user data directory
 */
function getUserDataPath(): string {
  return app.getPath('userData');
}

/**
 * Get settings file path
 */
function getSettingsPath(): string {
  return join(getUserDataPath(), 'settings.json');
}

/**
 * Get API keys directory
 */
function getApiKeysPath(): string {
  const dir = join(getUserDataPath(), 'secure');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Load settings from disk
 */
function loadSettings(): ISettingsStorage {
  try {
    const settingsPath = getSettingsPath();
    if (existsSync(settingsPath)) {
      const content = readFileSync(settingsPath, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        features: { ...DEFAULT_SETTINGS.features, ...parsed.features },
        preferences: { ...DEFAULT_SETTINGS.preferences, ...parsed.preferences },
        ollama: { ...DEFAULT_SETTINGS.ollama, ...parsed.ollama },
      };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Get settings (alias for loadSettings, for external module use)
 */
function getSettings(): ISettingsStorage {
  return loadSettings();
}

/**
 * Save settings to disk
 */
function saveSettings(settings: ISettingsStorage): void {
  try {
    const settingsPath = getSettingsPath();
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Get encrypted API key
 */
function getApiKey(keyName: ApiKeyName): string | null {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn('Secure storage not available');
      return null;
    }

    const keyPath = join(getApiKeysPath(), `${keyName}.enc`);
    if (!existsSync(keyPath)) {
      return null;
    }

    const encrypted = readFileSync(keyPath);
    return safeStorage.decryptString(encrypted);
  } catch (error) {
    console.error(`Error reading API key ${keyName}:`, error);
    return null;
  }
}

/**
 * Store encrypted API key
 */
function setApiKey(keyName: ApiKeyName, value: string): void {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('Secure storage not available');
    }

    const keyPath = join(getApiKeysPath(), `${keyName}.enc`);
    const encrypted = safeStorage.encryptString(value);
    writeFileSync(keyPath, encrypted);
  } catch (error) {
    console.error(`Error storing API key ${keyName}:`, error);
    throw error;
  }
}

/**
 * Remove API key
 */
function removeApiKey(keyName: ApiKeyName): void {
  try {
    const keyPath = join(getApiKeysPath(), `${keyName}.enc`);
    if (existsSync(keyPath)) {
      const { unlinkSync } = require('fs');
      unlinkSync(keyPath);
    }
  } catch (error) {
    console.error(`Error removing API key ${keyName}:`, error);
    throw error;
  }
}

/**
 * Check if API key exists
 */
function hasApiKey(keyName: ApiKeyName): boolean {
  const keyPath = join(getApiKeysPath(), `${keyName}.enc`);
  return existsSync(keyPath);
}

/**
 * Get all API key statuses (masked)
 */
function getApiKeyStatuses(): Record<ApiKeyName, string | undefined> {
  const keys: ApiKeyName[] = ['groq', 'openai', 'anthropic', 'tavily', 'github'];
  const result: Record<string, string | undefined> = {};

  for (const key of keys) {
    if (hasApiKey(key)) {
      result[key] = '••••••••';
    }
  }

  return result as Record<ApiKeyName, string | undefined>;
}

/**
 * Register all settings IPC handlers
 */
export function registerSettingsHandlers(): void {
  /**
   * Get all settings
   */
  ipcMain.handle('settings-get', async () => {
    try {
      const settings = loadSettings();
      const apiKeys = getApiKeyStatuses();

      return {
        apiKeys,
        features: settings.features,
        preferences: settings.preferences,
      };
    } catch (error) {
      console.error('Error in settings-get:', error);
      return null;
    }
  });

  /**
   * Save settings (excluding API keys)
   */
  ipcMain.handle('settings-save', async (_event, settings: ISettingsStorage) => {
    try {
      saveSettings(settings);
    } catch (error) {
      console.error('Error in settings-save:', error);
      throw error;
    }
  });

  /**
   * Set an API key
   */
  ipcMain.handle('settings-set-api-key', async (_event, key: ApiKeyName, value: string) => {
    try {
      setApiKey(key, value);
    } catch (error) {
      console.error('Error in settings-set-api-key:', error);
      throw error;
    }
  });

  /**
   * Remove an API key
   */
  ipcMain.handle('settings-remove-api-key', async (_event, key: ApiKeyName) => {
    try {
      removeApiKey(key);
    } catch (error) {
      console.error('Error in settings-remove-api-key:', error);
      throw error;
    }
  });

  /**
   * Check if API key exists
   */
  ipcMain.handle('settings-has-api-key', async (_event, key: ApiKeyName) => {
    return hasApiKey(key);
  });

  /**
   * Get API key value (for internal use only - not exposed to renderer)
   * This is used by other modules that need the actual API key
   */
  ipcMain.handle('settings-get-api-key', async (_event, key: ApiKeyName) => {
    return getApiKey(key);
  });
}

/**
 * Export for use by other modules
 */
export { getApiKey, hasApiKey, loadSettings, getSettings };
