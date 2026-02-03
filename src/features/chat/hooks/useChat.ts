/**
 * useChat Hook
 * Handles chat operations including RAG queries
 */

import { useState, useCallback, useRef } from 'react';
import type {
  IChatMessage,
  IConversation,
  IRagQueryOptions,
  ISourceReference,
  MessageRole,
} from '../types/chat.types';
import { DEFAULT_RAG_OPTIONS } from '../types/chat.types';

/**
 * Options for useChat hook
 */
export interface UseChatOptions {
  /** Initial conversation */
  initialConversation?: IConversation;
  /** Default RAG options */
  defaultRagOptions?: Partial<IRagQueryOptions>;
  /** Callback when message is sent */
  onMessageSent?: (message: IChatMessage) => void;
  /** Callback when response is received */
  onResponseReceived?: (message: IChatMessage) => void;
}

/**
 * Return type for useChat hook
 */
export interface UseChatReturn {
  /** Current messages */
  messages: IChatMessage[];
  /** Current conversation */
  conversation: IConversation | null;
  /** Whether response is being generated */
  isGenerating: boolean;
  /** Error message */
  error: string | null;
  /** Send a message */
  sendMessage: (content: string, options?: IRagQueryOptions) => Promise<IChatMessage | null>;
  /** Start new conversation */
  newConversation: () => void;
  /** Clear error */
  clearError: () => void;
  /** Abort current request */
  abort: () => void;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a message object
 */
function createMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
  sources?: ISourceReference[]
): IChatMessage {
  return {
    id: generateId(),
    conversationId,
    role,
    content,
    sources,
    timestamp: new Date(),
  };
}

/**
 * Hook for chat functionality with RAG
 * 
 * @param options - Configuration options
 * @returns Chat state and operations
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { initialConversation, defaultRagOptions, onMessageSent, onResponseReceived } = options;

  const [conversation, setConversation] = useState<IConversation | null>(
    initialConversation ?? null
  );
  const [messages, setMessages] = useState<IChatMessage[]>(
    initialConversation?.messages ?? []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Start a new conversation
   */
  const newConversation = useCallback(() => {
    const newConvo: IConversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversation(newConvo);
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Send a message and get RAG response
   */
  const sendMessage = useCallback(async (
    content: string,
    ragOptions: IRagQueryOptions = {}
  ): Promise<IChatMessage | null> => {
    if (!content.trim()) {
      return null;
    }

    // Initialize conversation if needed
    let currentConvo = conversation;
    if (!currentConvo) {
      currentConvo = {
        id: generateId(),
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversation(currentConvo);
    }

    // Create user message
    const userMessage = createMessage(currentConvo.id, 'user', content);
    setMessages(prev => [...prev, userMessage]);
    onMessageSent?.(userMessage);

    setIsGenerating(true);
    setError(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const mergedOptions = {
        ...DEFAULT_RAG_OPTIONS,
        ...defaultRagOptions,
        ...ragOptions,
      };

      // Call RAG API via IPC
      const result = await window.chatAPI?.queryWithRag(
        content,
        messages.map(m => ({ role: m.role, content: m.content })),
        mergedOptions
      );

      if (!result) {
        throw new Error('Failed to get response');
      }

      // Create assistant message
      const assistantMessage = createMessage(
        currentConvo.id,
        'assistant',
        result.response,
        result.sources
      );

      setMessages(prev => [...prev, assistantMessage]);
      onResponseReceived?.(assistantMessage);

      // Update conversation
      setConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, userMessage, assistantMessage],
        updatedAt: new Date(),
      } : null);

      return assistantMessage;

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted
        return null;
      }

      const message = err instanceof Error ? err.message : 'Failed to get response';
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [conversation, messages, defaultRagOptions, onMessageSent, onResponseReceived]);

  /**
   * Abort current request
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    conversation,
    isGenerating,
    error,
    sendMessage,
    newConversation,
    clearError,
    abort,
  };
}

