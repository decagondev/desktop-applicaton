/**
 * Settings Feature
 * 
 * Provides settings management for the Second Brain app.
 * Includes API key storage, feature toggles, and user preferences.
 * 
 * @packageDocumentation
 */

// Components
export { SettingsPage } from './components/SettingsPage';
export { ApiKeyForm } from './components/ApiKeyForm';
export { FeatureToggles } from './components/FeatureToggles';

// Context
export {
  SettingsProvider,
  useSettings,
  useSettingsOptional,
  SettingsContext,
} from './context/SettingsContext';

// Hooks
export { useSettingsHook } from './hooks/useSettings';
export type {
  UseSettingsOptions,
  UseSettingsReturn,
} from './hooks/useSettings';

// Types
export type {
  AIProvider,
  ApiKeyName,
  IApiKeys,
  IOllamaConfig,
  FeatureFlagName,
  IFeatureFlags,
  ThemeOption,
  EmbeddingModel,
  IUserPreferences,
  ISettings,
  ISettingsState,
  ISettingsContext,
} from './types/settings.types';

export {
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_PREFERENCES,
  DEFAULT_SETTINGS,
  DEFAULT_OLLAMA_CONFIG,
  API_KEY_LABELS,
  API_KEY_DESCRIPTIONS,
  AI_PROVIDER_LABELS,
  AI_PROVIDER_DESCRIPTIONS,
  PROVIDER_MODELS,
  FEATURE_FLAG_LABELS,
  FEATURE_FLAG_DESCRIPTIONS,
} from './types/settings.types';
