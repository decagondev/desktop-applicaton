/**
 * Chat API type declarations
 * Defines the interface exposed by Electron preload for chat operations
 */

import type {
  IRagQueryOptions,
  IRagQueryResult,
  ISourceReference,
  MessageRole,
} from '@features/chat';

/**
 * Message input for API
 */
interface IChatMessageInput {
  role: MessageRole;
  content: string;
}

/**
 * Chat API response
 */
interface IChatResponse {
  response: string;
  sources: ISourceReference[];
}

/**
 * Chat API exposed via Electron preload
 */
interface IChatAPI {
  /** Query with RAG context */
  queryWithRag: (
    query: string,
    history: IChatMessageInput[],
    options?: IRagQueryOptions
  ) => Promise<IChatResponse | null>;
  
  /** Direct chat completion (no RAG) */
  chatCompletion: (
    messages: IChatMessageInput[],
    options?: { model?: string; temperature?: number; maxTokens?: number }
  ) => Promise<{ content: string } | null>;
}

declare global {
  interface Window {
    chatAPI?: IChatAPI;
  }
}

export type { IChatAPI, IChatMessageInput, IChatResponse };
