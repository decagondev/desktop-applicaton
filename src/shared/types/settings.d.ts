/**
 * Settings API type declarations
 * Defines the interface exposed by Electron preload for settings operations
 */

import type {
  IApiKeys,
  IFeatureFlags,
  IUserPreferences,
  IOllamaConfig,
  ApiKeyName,
} from '@features/settings';

/**
 * Settings storage format (excludes API keys which are stored separately)
 */
interface ISettingsStorage {
  features: IFeatureFlags;
  preferences: IUserPreferences;
  ollama?: IOllamaConfig;
}

/**
 * Settings read result (includes masked API keys)
 */
interface ISettingsReadResult {
  apiKeys: IApiKeys;
  features: IFeatureFlags;
  preferences: IUserPreferences;
  ollama?: IOllamaConfig;
}

/**
 * Settings API exposed via Electron preload
 */
interface ISettingsAPI {
  /** Get all settings (API keys are masked) */
  getSettings: () => Promise<ISettingsReadResult | null>;
  /** Save settings (excludes API keys) */
  saveSettings: (settings: ISettingsStorage) => Promise<void>;
  /** Set an API key (stored securely) */
  setApiKey: (key: ApiKeyName, value: string) => Promise<void>;
  /** Remove an API key */
  removeApiKey: (key: ApiKeyName) => Promise<void>;
  /** Check if an API key exists */
  hasApiKey: (key: ApiKeyName) => Promise<boolean>;
  /** Get an API key value (for main process use only) */
  getApiKey: (key: ApiKeyName) => Promise<string | null>;
}

declare global {
  interface Window {
    settingsAPI?: ISettingsAPI;
  }
}

export type {
  ISettingsAPI,
  ISettingsStorage,
  ISettingsReadResult,
};
