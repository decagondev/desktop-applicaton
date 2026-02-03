/**
 * Settings Context
 * Provides settings state and operations to the component tree
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  ISettingsContext,
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

const SettingsContext = createContext<ISettingsContext | null>(null);

/**
 * Props for SettingsProvider
 */
interface ISettingsProviderProps {
  /** Child components */
  children: ReactNode;
}

/**
 * Provider component for settings context
 * Manages settings state and provides operations to children
 * 
 * @example
 * ```tsx
 * <SettingsProvider>
 *   <App />
 * </SettingsProvider>
 * ```
 */
export function SettingsProvider({
  children,
}: ISettingsProviderProps): React.ReactElement {
  const [settings, setSettings] = useState<ISettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Load settings from storage
   */
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await window.settingsAPI?.getSettings();
      if (result) {
        setSettings({
          apiKeys: result.apiKeys ?? {},
          features: { ...DEFAULT_FEATURE_FLAGS, ...result.features },
          preferences: { ...DEFAULT_PREFERENCES, ...result.preferences },
          ollama: result.ollama ?? DEFAULT_SETTINGS.ollama,
        });
      }
      setIsInitialized(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Save settings to storage
   */
  const saveSettings = useCallback(async (newSettings: ISettings) => {
    try {
      setIsSaving(true);
      setError(null);

      await window.settingsAPI?.saveSettings({
        features: newSettings.features,
        preferences: newSettings.preferences,
      });

      setSettings(newSettings);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Update a single API key (stored securely)
   */
  const updateApiKey = useCallback(async (key: ApiKeyName, value: string) => {
    try {
      setIsSaving(true);
      setError(null);

      await window.settingsAPI?.setApiKey(key, value);

      setSettings(prev => ({
        ...prev,
        apiKeys: {
          ...prev.apiKeys,
          [key]: value ? '••••••••' : undefined, // Mask the value
        },
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save API key';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Remove an API key
   */
  const removeApiKey = useCallback(async (key: ApiKeyName) => {
    try {
      setIsSaving(true);
      setError(null);

      await window.settingsAPI?.removeApiKey(key);

      setSettings(prev => {
        const newApiKeys = { ...prev.apiKeys };
        delete newApiKeys[key];
        return { ...prev, apiKeys: newApiKeys };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove API key';
      setError(message);
      throw new Error(message);
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
  ) => {
    const newSettings = {
      ...settings,
      features: {
        ...settings.features,
        [feature]: enabled,
      },
    };

    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(async (
    preferences: Partial<IUserPreferences>
  ) => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        ...preferences,
      },
    };

    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  /**
   * Check if an API key is configured
   */
  const hasApiKey = useCallback((key: ApiKeyName): boolean => {
    return Boolean(settings.apiKeys[key]);
  }, [settings.apiKeys]);

  /**
   * Reset settings to defaults
   */
  const resetToDefaults = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Remove all API keys
      const keyNames: ApiKeyName[] = ['groq', 'openai', 'anthropic', 'tavily', 'github'];
      for (const key of keyNames) {
        await window.settingsAPI?.removeApiKey(key);
      }

      // Save default settings
      await window.settingsAPI?.saveSettings({
        features: DEFAULT_FEATURE_FLAGS,
        preferences: DEFAULT_PREFERENCES,
      });

      setSettings(DEFAULT_SETTINGS);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset settings';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value: ISettingsContext = {
    settings,
    isLoading,
    isSaving,
    error,
    isInitialized,
    updateApiKey,
    removeApiKey,
    toggleFeature,
    updatePreferences,
    hasApiKey,
    resetToDefaults,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access settings context
 * @throws Error if used outside SettingsProvider
 */
export function useSettings(): ISettingsContext {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

/**
 * Hook to optionally access settings context
 * Returns null if not within provider
 */
export function useSettingsOptional(): ISettingsContext | null {
  return useContext(SettingsContext);
}

export { SettingsContext };
