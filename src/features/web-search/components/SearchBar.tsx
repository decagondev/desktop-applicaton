/**
 * Search Bar Component
 * Input for web search queries
 */

import { memo, useState, useCallback, type FormEvent, type KeyboardEvent } from 'react';

/**
 * Props for SearchBar component
 */
interface ISearchBarProps {
  /** Callback when search is submitted */
  onSearch: (query: string) => void;
  /** Whether search is in progress */
  isSearching?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Initial value */
  initialValue?: string;
  /** Optional CSS class */
  className?: string;
}

/**
 * Search bar with submit button
 */
function SearchBarComponent({
  onSearch,
  isSearching = false,
  placeholder = 'Search the web...',
  initialValue = '',
  className = '',
}: ISearchBarProps): React.ReactElement {
  const [query, setQuery] = useState(initialValue);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      onSearch(query.trim());
    }
  }, [query, isSearching, onSearch]);

  /**
   * Handle keyboard shortcut
   */
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSearching}
          className="
            w-full px-4 py-3 pr-10
            bg-slate-800 border border-slate-700 rounded-lg
            text-slate-200 placeholder-slate-500
            focus:outline-none focus:border-blue-500
            disabled:opacity-50
          "
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="w-5 h-5 text-slate-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={!query.trim() || isSearching}
        className="
          px-6 py-3 font-medium
          bg-blue-600 text-white rounded-lg
          hover:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        Search
      </button>
    </form>
  );
}

export const SearchBar = memo(SearchBarComponent);
