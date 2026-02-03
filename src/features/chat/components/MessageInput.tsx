/**
 * Message Input Component
 * Text input for sending chat messages
 */

import { memo, useState, useCallback, useRef, type FormEvent, type KeyboardEvent } from 'react';

/**
 * Props for MessageInput component
 */
interface IMessageInputProps {
  /** Callback when message is sent */
  onSend: (content: string) => void;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Optional CSS class */
  className?: string;
}

/**
 * Chat message input component
 */
function MessageInputComponent({
  onSend,
  disabled = false,
  placeholder = 'Ask a question...',
  className = '',
}: IMessageInputProps): React.ReactElement {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (content.trim() && !disabled) {
      onSend(content.trim());
      setContent('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [content, disabled, onSend]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  /**
   * Auto-resize textarea
   */
  const handleInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 p-4 bg-slate-900 ${className}`}>
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="
            w-full px-4 py-3 pr-12
            bg-slate-800 border border-slate-700 rounded-lg
            text-slate-200 placeholder-slate-500
            focus:outline-none focus:border-blue-500
            disabled:opacity-50
            resize-none overflow-y-auto
            max-h-[200px]
          "
        />
        <div className="absolute right-2 bottom-2 text-xs text-slate-500">
          ⏎ to send
        </div>
      </div>
      <button
        type="submit"
        disabled={!content.trim() || disabled}
        className="
          self-end px-4 py-3 h-12
          bg-blue-600 text-white rounded-lg
          hover:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}

export const MessageInput = memo(MessageInputComponent);
