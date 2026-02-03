/**
 * Message List Component
 * Displays chat messages with source references
 */

import { memo, useRef, useEffect } from 'react';
import type { IChatMessage, ISourceReference } from '../types/chat.types';

/**
 * Props for MessageList component
 */
interface IMessageListProps {
  /** Messages to display */
  messages: IChatMessage[];
  /** Whether a response is being generated */
  isGenerating?: boolean;
  /** Callback when source is clicked */
  onSourceClick?: (source: ISourceReference) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Source reference badge
 */
function SourceBadge({
  source,
  index,
  onClick,
}: {
  source: ISourceReference;
  index: number;
  onClick?: () => void;
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex items-center gap-1 px-2 py-0.5
        text-xs bg-slate-700 text-slate-300 rounded
        hover:bg-slate-600 transition-colors
      "
    >
      <span className="font-medium">[{index + 1}]</span>
      <span className="truncate max-w-[150px]">{source.title}</span>
    </button>
  );
}

/**
 * Single message component
 */
function Message({
  message,
  onSourceClick,
}: {
  message: IChatMessage;
  onSourceClick?: (source: ISourceReference) => void;
}): React.ReactElement {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="py-2 text-center">
        <span className="text-xs text-slate-500">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser ? 'bg-blue-600' : 'bg-slate-700'}
      `}>
        {isUser ? (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div className={`
          inline-block max-w-[85%] p-3 rounded-lg
          ${isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-800 text-slate-200'}
        `}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.sources.map((source, index) => (
              <SourceBadge
                key={source.entryId}
                source={source}
                index={index}
                onClick={() => onSourceClick?.(source)}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="mt-1 text-xs text-slate-500">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

/**
 * Typing indicator
 */
function TypingIndicator(): React.ReactElement {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
        <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="flex items-center gap-1 px-4 py-3 bg-slate-800 rounded-lg">
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

/**
 * Message list component
 */
function MessageListComponent({
  messages,
  isGenerating = false,
  onSourceClick,
  className = '',
}: IMessageListProps): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  if (messages.length === 0 && !isGenerating) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-slate-500">
          <svg className="mx-auto w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>Start a conversation</p>
          <p className="text-sm">Ask questions about your knowledge base</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}
    >
      {messages.map(message => (
        <Message
          key={message.id}
          message={message}
          onSourceClick={onSourceClick}
        />
      ))}
      {isGenerating && <TypingIndicator />}
    </div>
  );
}

export const MessageList = memo(MessageListComponent);
