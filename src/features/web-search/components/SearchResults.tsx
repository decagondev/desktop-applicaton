/**
 * Search Results Component
 * Displays web search results with ingestion options
 */

import { memo, useCallback } from 'react';
import type { ITavilySearchResult } from '../types/web-search.types';

/**
 * Props for SearchResults component
 */
interface ISearchResultsProps {
  /** Search results */
  results: ITavilySearchResult[];
  /** AI-generated answer */
  answer?: string | null;
  /** Callback when ingest is clicked */
  onIngest?: (result: ITavilySearchResult) => void;
  /** Whether ingestion is in progress */
  isIngesting?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Single search result card
 */
interface IResultCardProps {
  result: ITavilySearchResult;
  onIngest?: (result: ITavilySearchResult) => void;
  isIngesting?: boolean;
}

function ResultCard({
  result,
  onIngest,
  isIngesting = false,
}: IResultCardProps): React.ReactElement {
  const handleIngest = useCallback(() => {
    onIngest?.(result);
  }, [result, onIngest]);

  // Extract domain from URL
  const domain = (() => {
    try {
      return new URL(result.url).hostname;
    } catch {
      return result.url;
    }
  })();

  return (
    <div className="p-4 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline font-medium line-clamp-1"
          >
            {result.title}
          </a>
          <p className="mt-1 text-xs text-slate-500">{domain}</p>
          <p className="mt-2 text-sm text-slate-300 line-clamp-3">
            {result.content}
          </p>
          {result.publishedDate && (
            <p className="mt-2 text-xs text-slate-500">
              {result.publishedDate}
            </p>
          )}
        </div>
        {onIngest && (
          <button
            onClick={handleIngest}
            disabled={isIngesting}
            className="
              flex-shrink-0 px-3 py-1.5 text-sm
              bg-slate-700 text-slate-300 rounded
              hover:bg-slate-600
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isIngesting ? 'Adding...' : 'Add to KB'}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Search results display
 */
function SearchResultsComponent({
  results,
  answer,
  onIngest,
  isIngesting = false,
  className = '',
}: ISearchResultsProps): React.ReactElement {
  if (results.length === 0 && !answer) {
    return <></>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Answer */}
      {answer && (
        <div className="p-4 bg-blue-900/30 border border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-sm font-medium text-blue-400">AI Answer</span>
          </div>
          <p className="text-sm text-slate-200">{answer}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </h3>
          {results.map((result, index) => (
            <ResultCard
              key={`${result.url}-${index}`}
              result={result}
              onIngest={onIngest}
              isIngesting={isIngesting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const SearchResults = memo(SearchResultsComponent);
