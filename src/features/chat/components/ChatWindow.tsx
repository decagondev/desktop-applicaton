/**
 * Chat Window Component
 * Main chat interface combining message list and input
 */

import { memo, useCallback } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { IChatMessage, ISourceReference, IRagQueryOptions } from '../types/chat.types';

/**
 * Props for ChatWindow component
 */
interface IChatWindowProps {
  /** Messages to display */
  messages: IChatMessage[];
  /** Whether response is being generated */
  isGenerating: boolean;
  /** Error message */
  error: string | null;
  /** Callback when message is sent */
  onSendMessage: (content: string, options?: IRagQueryOptions) => void;
  /** Callback when source is clicked */
  onSourceClick?: (source: ISourceReference) => void;
  /** Callback to start new conversation */
  onNewConversation?: () => void;
  /** Callback to clear error */
  onClearError?: () => void;
  /** Conversation title */
  title?: string;
  /** Optional CSS class */
  className?: string;
}

/**
 * Main chat window component
 */
function ChatWindowComponent({
  messages,
  isGenerating,
  error,
  onSendMessage,
  onSourceClick,
  onNewConversation,
  onClearError,
  title = 'Chat',
  className = '',
}: IChatWindowProps): React.ReactElement {
  const handleSend = useCallback((content: string) => {
    onSendMessage(content);
  }, [onSendMessage]);

  return (
    <div className={`flex flex-col h-full bg-slate-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
        {onNewConversation && (
          <button
            onClick={onNewConversation}
            className="
              px-3 py-1.5 text-sm
              bg-slate-800 text-slate-300 rounded-lg
              hover:bg-slate-700 transition-colors
            "
          >
            New Chat
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between px-4 py-2 bg-red-900/30 border-b border-red-900">
          <p className="text-sm text-red-400">{error}</p>
          {onClearError && (
            <button
              onClick={onClearError}
              className="text-red-400 hover:text-red-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Message list */}
      <MessageList
        messages={messages}
        isGenerating={isGenerating}
        onSourceClick={onSourceClick}
        className="flex-1"
      />

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        disabled={isGenerating}
        placeholder="Ask a question about your knowledge base..."
      />
    </div>
  );
}

export const ChatWindow = memo(ChatWindowComponent);
