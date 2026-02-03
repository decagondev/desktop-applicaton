/**
 * Settings feature type definitions
 * Defines interfaces for API keys, feature flags, and user preferences
 */

/**
 * API key names for external services
 */
export type ApiKeyName =
  | 'groq'
  | 'openai'
  | 'anthropic'
  | 'tavily'
  | 'github';

/**
 * API keys configuration
 * Values are stored securely using Electron's safeStorage
 */
export interface IApiKeys {
  /** Groq API key for LLM chat */
  groq?: string;
  /** OpenAI API key for embeddings and transcription */
  openai?: string;
  /** Anthropic API key for Claude models */
  anthropic?: string;
  /** Tavily API key for web search */
  tavily?: string;
  /** GitHub personal access token */
  github?: string;
}

/**
 * Feature toggle names
 */
export type FeatureFlagName =
  | 'multimodal'
  | 'dashboard'
  | 'webSearch'
  | 'github'
  | 'voiceNotes';

/**
 * Feature flags configuration
 */
export interface IFeatureFlags {
  /** Enable multimodal support (images) */
  multimodal: boolean;
  /** Show system dashboard */
  dashboard: boolean;
  /** Enable web search via Tavily */
  webSearch: boolean;
  /** Enable GitHub integration */
  github: boolean;
  /** Enable voice notes with transcription */
  voiceNotes: boolean;
}

/**
 * Theme options
 */
export type ThemeOption = 'light' | 'dark' | 'system';

/**
 * Embedding model options
 */
export type EmbeddingModel = 'groq' | 'openai' | 'local';

/**
 * User preferences
 */
export interface IUserPreferences {
  /** UI theme */
  theme: ThemeOption;
  /** Embedding model to use */
  embeddingModel: EmbeddingModel;
  /** Maximum chat history messages to keep */
  maxHistoryLength: number;
  /** Auto-sync interval in ms (0 to disable) */
  autoSyncInterval: number;
}

/**
 * Complete settings state
 */
export interface ISettings {
  /** API keys (stored securely) */
  apiKeys: IApiKeys;
  /** Feature toggles */
  features: IFeatureFlags;
  /** User preferences */
  preferences: IUserPreferences;
}

/**
 * Settings context state
 */
export interface ISettingsState {
  /** Current settings */
  settings: ISettings;
  /** Whether settings are loading */
  isLoading: boolean;
  /** Whether settings are being saved */
  isSaving: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether settings have been loaded */
  isInitialized: boolean;
}

/**
 * Settings context interface
 */
export interface ISettingsContext extends ISettingsState {
  /** Update a single API key */
  updateApiKey: (key: ApiKeyName, value: string) => Promise<void>;
  /** Remove an API key */
  removeApiKey: (key: ApiKeyName) => Promise<void>;
  /** Toggle a feature */
  toggleFeature: (feature: FeatureFlagName, enabled: boolean) => Promise<void>;
  /** Update user preferences */
  updatePreferences: (preferences: Partial<IUserPreferences>) => Promise<void>;
  /** Check if an API key is configured */
  hasApiKey: (key: ApiKeyName) => boolean;
  /** Reset settings to defaults */
  resetToDefaults: () => Promise<void>;
}

/**
 * Default feature flags
 */
export const DEFAULT_FEATURE_FLAGS: IFeatureFlags = {
  multimodal: false,
  dashboard: true,
  webSearch: false,
  github: false,
  voiceNotes: false,
};

/**
 * Default user preferences
 */
export const DEFAULT_PREFERENCES: IUserPreferences = {
  theme: 'system',
  embeddingModel: 'openai',
  maxHistoryLength: 100,
  autoSyncInterval: 300000, // 5 minutes
};

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: ISettings = {
  apiKeys: {},
  features: DEFAULT_FEATURE_FLAGS,
  preferences: DEFAULT_PREFERENCES,
};

/**
 * API key display names
 */
export const API_KEY_LABELS: Record<ApiKeyName, string> = {
  groq: 'Groq',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  tavily: 'Tavily',
  github: 'GitHub',
};

/**
 * API key descriptions
 */
export const API_KEY_DESCRIPTIONS: Record<ApiKeyName, string> = {
  groq: 'For AI chat completions (llama models)',
  openai: 'For embeddings and voice transcription',
  anthropic: 'For Claude AI models',
  tavily: 'For web search integration',
  github: 'For repository cloning and API access',
};

/**
 * Feature flag labels
 */
export const FEATURE_FLAG_LABELS: Record<FeatureFlagName, string> = {
  multimodal: 'Multimodal Support',
  dashboard: 'System Dashboard',
  webSearch: 'Web Search',
  github: 'GitHub Integration',
  voiceNotes: 'Voice Notes',
};

/**
 * Feature flag descriptions
 */
export const FEATURE_FLAG_DESCRIPTIONS: Record<FeatureFlagName, string> = {
  multimodal: 'Enable image vectorization and analysis',
  dashboard: 'Show system monitoring dashboard',
  webSearch: 'Enable web search via Tavily API',
  github: 'Enable GitHub repository integration',
  voiceNotes: 'Enable voice note recording and transcription',
};
