/**
 * Chat feature type definitions
 * Defines interfaces for chat messages, RAG, and conversation management
 */

import type { IVectorSearchResult, VectorSourceType } from '@features/vector-store';

/**
 * Message role
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Source reference for RAG responses
 */
export interface ISourceReference {
  /** Vector entry ID */
  entryId: string;
  /** Relevance score (0-1) */
  score: number;
  /** Content snippet */
  snippet: string;
  /** Source title */
  title: string;
  /** Source type */
  sourceType: VectorSourceType;
  /** Source path/URL */
  sourcePath: string;
}

/**
 * A single chat message
 */
export interface IChatMessage {
  /** Unique identifier */
  id: string;
  /** Conversation ID */
  conversationId: string;
  /** Message role */
  role: MessageRole;
  /** Message content */
  content: string;
  /** Source references (for assistant messages) */
  sources?: ISourceReference[];
  /** Whether message is being streamed */
  isStreaming?: boolean;
  /** Timestamp */
  timestamp: Date;
}

/**
 * Chat conversation
 */
export interface IConversation {
  /** Unique identifier */
  id: string;
  /** Conversation title */
  title: string;
  /** Messages in conversation */
  messages: IChatMessage[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * RAG query options
 */
export interface IRagQueryOptions {
  /** Number of context documents to retrieve */
  contextLimit?: number;
  /** Minimum similarity threshold */
  similarityThreshold?: number;
  /** Source types to include */
  sourceTypes?: VectorSourceType[];
  /** Include source references in response */
  includeSources?: boolean;
  /** System prompt override */
  systemPrompt?: string;
}

/**
 * Default RAG options
 */
export const DEFAULT_RAG_OPTIONS: Required<IRagQueryOptions> = {
  contextLimit: 5,
  similarityThreshold: 0.3,
  sourceTypes: [],
  includeSources: true,
  systemPrompt: `You are a helpful assistant with access to a knowledge base. 
Answer questions based on the provided context. If the context doesn't contain 
relevant information, say so and provide a general answer if possible.
Always cite your sources when using information from the context.`,
};

/**
 * RAG query result
 */
export interface IRagQueryResult {
  /** Generated response */
  response: string;
  /** Source references used */
  sources: ISourceReference[];
  /** Retrieved context documents */
  context: IVectorSearchResult[];
  /** Query embedding */
  queryEmbedding: number[];
}

/**
 * Chat state
 */
export interface IChatState {
  /** Current conversation */
  conversation: IConversation | null;
  /** All conversations */
  conversations: IConversation[];
  /** Whether a response is being generated */
  isGenerating: boolean;
  /** Whether messages are loading */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Chat context interface
 */
export interface IChatContext extends IChatState {
  /** Send a message */
  sendMessage: (content: string, options?: IRagQueryOptions) => Promise<IChatMessage | null>;
  /** Start a new conversation */
  newConversation: () => void;
  /** Load a conversation by ID */
  loadConversation: (id: string) => Promise<void>;
  /** Delete a conversation */
  deleteConversation: (id: string) => Promise<void>;
  /** Update conversation title */
  updateConversationTitle: (id: string, title: string) => Promise<void>;
  /** Clear current error */
  clearError: () => void;
}

/**
 * AI Provider type (imported from settings for convenience)
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
 * Chat completion options
 */
export interface IChatCompletionOptions {
  /** AI provider to use */
  provider?: AIProvider;
  /** Model to use */
  model?: string;
  /** Temperature (0-1) */
  temperature?: number;
  /** Maximum tokens */
  maxTokens?: number;
  /** System prompt */
  systemPrompt?: string;
}

/**
 * Default chat completion options
 */
export const DEFAULT_CHAT_OPTIONS: Required<IChatCompletionOptions> = {
  provider: 'groq',
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: 'You are a helpful assistant.',
};

/**
 * Provider API endpoint configuration
 */
export const PROVIDER_ENDPOINTS: Record<AIProvider, string> = {
  groq: 'https://api.groq.com/openai/v1',
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  ollama: 'http://localhost:11434/api',
  together: 'https://api.together.xyz/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  mistral: 'https://api.mistral.ai/v1',
  moonshot: 'https://api.moonshot.cn/v1',
  perplexity: 'https://api.perplexity.ai',
  deepseek: 'https://api.deepseek.com/v1',
};
