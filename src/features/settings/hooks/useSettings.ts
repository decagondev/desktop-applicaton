/**
 * useSettings Hook
 * Standalone hook for settings operations (without context)
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  ISettings,
  ApiKeyName,
  FeatureFlagName,
  IUserPreferences,
} from '../types/settings.types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_PREFERENCES,
} from '../types/settings.types';

/**
 * Options for the useSettings hook
 */
export interface UseSettingsOptions {
  /** Load settings on mount */
  loadOnMount?: boolean;
}

/**
 * Return type for useSettings hook
 */
export interface UseSettingsReturn {
  /** Current settings */
  settings: ISettings;
  /** Whether settings are loading */
  isLoading: boolean;
  /** Whether settings are being saved */
  isSaving: boolean;
  /** Error message if any */
  error: string | null;
  /** Update an API key */
  updateApiKey: (key: ApiKeyName, value: string) => Promise<boolean>;
  /** Remove an API key */
  removeApiKey: (key: ApiKeyName) => Promise<boolean>;
  /** Toggle a feature */
  toggleFeature: (feature: FeatureFlagName, enabled: boolean) => Promise<boolean>;
  /** Update preferences */
  updatePreferences: (preferences: Partial<IUserPreferences>) => Promise<boolean>;
  /** Check if API key exists */
  hasApiKey: (key: ApiKeyName) => boolean;
  /** Reload settings from storage */
  reload: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Standalone hook for settings management
 * Use this when not using SettingsProvider
 * 
 * @param options - Configuration options
 * @returns Settings state and operations
 */
export function useSettingsHook(
  options: UseSettingsOptions = {}
): UseSettingsReturn {
  const { loadOnMount = true } = options;

  const [settings, setSettings] = useState<ISettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load settings from storage
   */
  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.settingsAPI?.getSettings();
      if (result) {
        setSettings({
          apiKeys: result.apiKeys ?? {},
          features: { ...DEFAULT_FEATURE_FLAGS, ...result.features },
          preferences: { ...DEFAULT_PREFERENCES, ...result.preferences },
          ollama: result.ollama ?? DEFAULT_SETTINGS.ollama,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an API key
   */
  const updateApiKey = useCallback(async (
    key: ApiKeyName,
    value: string
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      await window.settingsAPI?.setApiKey(key, value);

      setSettings(prev => ({
        ...prev,
        apiKeys: {
          ...prev.apiKeys,
          [key]: value ? '••••••••' : undefined,
        },
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save API key';
      setError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Remove an API key
   */
  const removeApiKey = useCallback(async (key: ApiKeyName): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      await window.settingsAPI?.removeApiKey(key);

      setSettings(prev => {
        const newApiKeys = { ...prev.apiKeys };
        delete newApiKeys[key];
        return { ...prev, apiKeys: newApiKeys };
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove API key';
      setError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Toggle a feature
   */
  const toggleFeature = useCallback(async (
    feature: FeatureFlagName,
    enabled: boolean
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const newFeatures = {
        ...settings.features,
        [feature]: enabled,
      };

      await window.settingsAPI?.saveSettings({
        features: newFeatures,
        preferences: settings.preferences,
      });

      setSettings(prev => ({
        ...prev,
        features: newFeatures,
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save setting';
      setError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  /**
   * Update preferences
   */
  const updatePreferences = useCallback(async (
    preferences: Partial<IUserPreferences>
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const newPreferences = {
        ...settings.preferences,
        ...preferences,
      };

      await window.settingsAPI?.saveSettings({
        features: settings.features,
        preferences: newPreferences,
      });

      setSettings(prev => ({
        ...prev,
        preferences: newPreferences,
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save preferences';
      setError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  /**
   * Check if an API key is configured
   */
  const hasApiKey = useCallback((key: ApiKeyName): boolean => {
    return Boolean(settings.apiKeys[key]);
  }, [settings.apiKeys]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load settings on mount
  useEffect(() => {
    if (loadOnMount) {
      reload();
    }
  }, [loadOnMount, reload]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    updateApiKey,
    removeApiKey,
    toggleFeature,
    updatePreferences,
    hasApiKey,
    reload,
    clearError,
  };
}

