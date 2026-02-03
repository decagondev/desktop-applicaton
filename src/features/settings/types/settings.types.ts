/**
 * Settings feature type definitions
 * Defines interfaces for API keys, feature flags, and user preferences
 */

/**
 * AI Provider names
 */
export type AIProvider =
  | 'groq'
  | 'openai'
  | 'anthropic'
  | 'ollama'
  | 'together'
  | 'openrouter'
  | 'mistral'
  | 'moonshot'
  | 'perplexity'
  | 'deepseek';

/**
 * API key names for external services
 */
export type ApiKeyName =
  | 'groq'
  | 'openai'
  | 'anthropic'
  | 'together'
  | 'openrouter'
  | 'mistral'
  | 'moonshot'
  | 'perplexity'
  | 'deepseek'
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
  /** Together AI API key */
  together?: string;
  /** OpenRouter API key */
  openrouter?: string;
  /** Mistral AI API key */
  mistral?: string;
  /** Moonshot/Kimi API key */
  moonshot?: string;
  /** Perplexity API key */
  perplexity?: string;
  /** DeepSeek API key */
  deepseek?: string;
  /** Tavily API key for web search */
  tavily?: string;
  /** GitHub personal access token */
  github?: string;
}

/**
 * Ollama configuration
 */
export interface IOllamaConfig {
  /** Ollama server URL (default: http://localhost:11434) */
  baseUrl: string;
  /** Whether Ollama is enabled */
  enabled: boolean;
}

/**
 * Default Ollama configuration
 */
export const DEFAULT_OLLAMA_CONFIG: IOllamaConfig = {
  baseUrl: 'http://localhost:11434',
  enabled: false,
};

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
  /** Selected AI provider for chat */
  aiProvider: AIProvider;
  /** Selected model for the provider */
  aiModel: string;
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
  /** Ollama configuration */
  ollama: IOllamaConfig;
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
  aiProvider: 'groq',
  aiModel: 'llama-3.3-70b-versatile',
};

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: ISettings = {
  apiKeys: {},
  features: DEFAULT_FEATURE_FLAGS,
  preferences: DEFAULT_PREFERENCES,
  ollama: DEFAULT_OLLAMA_CONFIG,
};

/**
 * API key display names
 */
export const API_KEY_LABELS: Record<ApiKeyName, string> = {
  groq: 'Groq',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  together: 'Together AI',
  openrouter: 'OpenRouter',
  mistral: 'Mistral AI',
  moonshot: 'Moonshot (Kimi)',
  perplexity: 'Perplexity',
  deepseek: 'DeepSeek',
  tavily: 'Tavily',
  github: 'GitHub',
};

/**
 * API key descriptions
 */
export const API_KEY_DESCRIPTIONS: Record<ApiKeyName, string> = {
  groq: 'Fast inference for Llama and Mixtral models',
  openai: 'GPT models, embeddings, and Whisper transcription',
  anthropic: 'Claude AI models (Claude 3, Claude 3.5)',
  together: 'Open source models (Llama, Mistral, Qwen)',
  openrouter: 'Unified API for 100+ models',
  mistral: 'Mistral AI models (Mistral, Mixtral)',
  moonshot: 'Kimi AI models (moonshot-v1, kimi-2.5)',
  perplexity: 'Search-augmented AI responses',
  deepseek: 'DeepSeek models (DeepSeek-V3, Coder)',
  tavily: 'Web search integration',
  github: 'Repository cloning and API access',
};

/**
 * AI Provider display names
 */
export const AI_PROVIDER_LABELS: Record<AIProvider, string> = {
  groq: 'Groq',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  ollama: 'Ollama (Local)',
  together: 'Together AI',
  openrouter: 'OpenRouter',
  mistral: 'Mistral AI',
  moonshot: 'Moonshot (Kimi)',
  perplexity: 'Perplexity',
  deepseek: 'DeepSeek',
};

/**
 * AI Provider descriptions
 */
export const AI_PROVIDER_DESCRIPTIONS: Record<AIProvider, string> = {
  groq: 'Ultra-fast inference, free tier available',
  openai: 'GPT-4, GPT-4o, GPT-3.5 models',
  anthropic: 'Claude 3.5 Sonnet, Claude 3 Opus',
  ollama: 'Run models locally (Llama, Mistral, etc.)',
  together: 'Open source models at competitive prices',
  openrouter: 'Access 100+ models via single API',
  mistral: 'Efficient European AI models',
  moonshot: 'Kimi 2.5 - advanced reasoning',
  perplexity: 'AI with real-time web search',
  deepseek: 'Powerful reasoning and coding',
};

/**
 * Available models per provider
 */
export const PROVIDER_MODELS: Record<AIProvider, { id: string; name: string; description?: string }[]> = {
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Best overall performance' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Fast and efficient' },
    { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision', description: 'Multimodal' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'MoE architecture' },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google open model' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable, multimodal' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '128K context' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cheap' },
    { id: 'o1-preview', name: 'o1 Preview', description: 'Advanced reasoning' },
    { id: 'o1-mini', name: 'o1 Mini', description: 'Fast reasoning' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Best balance' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and cheap' },
  ],
  ollama: [
    { id: 'llama3.2', name: 'Llama 3.2', description: 'Latest Llama' },
    { id: 'llama3.1', name: 'Llama 3.1', description: 'Stable Llama' },
    { id: 'mistral', name: 'Mistral 7B', description: 'Efficient' },
    { id: 'mixtral', name: 'Mixtral 8x7B', description: 'MoE' },
    { id: 'codellama', name: 'Code Llama', description: 'Code focused' },
    { id: 'deepseek-coder-v2', name: 'DeepSeek Coder V2', description: 'Coding' },
    { id: 'qwen2.5', name: 'Qwen 2.5', description: 'Alibaba model' },
    { id: 'phi3', name: 'Phi-3', description: 'Microsoft small model' },
    { id: 'gemma2', name: 'Gemma 2', description: 'Google open model' },
  ],
  together: [
    { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Turbo', description: 'Fast Llama' },
    { id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', name: 'Llama 3.1 405B', description: 'Largest Llama' },
    { id: 'mistralai/Mixtral-8x22B-Instruct-v0.1', name: 'Mixtral 8x22B', description: 'Large MoE' },
    { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B', description: 'Alibaba' },
    { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', description: 'Reasoning' },
  ],
  openrouter: [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Via OpenRouter' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Via OpenRouter' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Google' },
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', description: 'Meta' },
    { id: 'mistralai/mistral-large-2411', name: 'Mistral Large', description: 'Mistral' },
  ],
  mistral: [
    { id: 'mistral-large-latest', name: 'Mistral Large', description: 'Most capable' },
    { id: 'mistral-medium-latest', name: 'Mistral Medium', description: 'Balanced' },
    { id: 'mistral-small-latest', name: 'Mistral Small', description: 'Fast' },
    { id: 'codestral-latest', name: 'Codestral', description: 'Code focused' },
    { id: 'open-mixtral-8x22b', name: 'Mixtral 8x22B', description: 'Open MoE' },
  ],
  moonshot: [
    { id: 'kimi-2.5', name: 'Kimi 2.5', description: 'Latest Kimi' },
    { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', description: 'Long context' },
    { id: 'moonshot-v1-32k', name: 'Moonshot V1 32K', description: 'Standard' },
    { id: 'moonshot-v1-8k', name: 'Moonshot V1 8K', description: 'Fast' },
  ],
  perplexity: [
    { id: 'llama-3.1-sonar-large-128k-online', name: 'Sonar Large Online', description: 'Web search' },
    { id: 'llama-3.1-sonar-small-128k-online', name: 'Sonar Small Online', description: 'Fast search' },
    { id: 'llama-3.1-sonar-huge-128k-online', name: 'Sonar Huge Online', description: 'Best quality' },
  ],
  deepseek: [
    { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'General chat' },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', description: 'Advanced reasoning' },
    { id: 'deepseek-coder', name: 'DeepSeek Coder', description: 'Code generation' },
  ],
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
