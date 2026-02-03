/**
 * Chat Feature
 * 
 * Provides AI-powered chat interface with RAG for the Second Brain app.
 * 
 * @packageDocumentation
 */

// Components
export { ChatWindow } from './components/ChatWindow';
export { MessageList } from './components/MessageList';
export { MessageInput } from './components/MessageInput';

// Hooks
export { useChat } from './hooks/useChat';
export type {
  UseChatOptions,
  UseChatReturn,
} from './hooks/useChat';

// Types
export type {
  MessageRole,
  ISourceReference,
  IChatMessage,
  IConversation,
  IRagQueryOptions,
  IRagQueryResult,
  IChatState,
  IChatContext,
  AIProvider,
  IChatCompletionOptions,
} from './types/chat.types';

export {
  DEFAULT_RAG_OPTIONS,
  DEFAULT_CHAT_OPTIONS,
  PROVIDER_ENDPOINTS,
} from './types/chat.types';
