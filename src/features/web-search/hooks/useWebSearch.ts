/**
 * useWebSearch Hook
 * Handles web search and URL ingestion operations
 */

import { useState, useCallback } from 'react';
import type {
  ITavilySearchResult,
  ITavilySearchResponse,
  IWebSearchOptions,
  IUrlIngestionInput,
  IUrlIngestionResult,
} from '../types/web-search.types';
import { DEFAULT_SEARCH_OPTIONS } from '../types/web-search.types';

/**
 * Options for useWebSearch hook
 */
export interface UseWebSearchOptions {
  /** Default search options */
  defaultSearchOptions?: Partial<IWebSearchOptions>;
  /** Callback on search complete */
  onSearchComplete?: (response: ITavilySearchResponse) => void;
  /** Callback on ingestion complete */
  onIngestionComplete?: (result: IUrlIngestionResult) => void;
}

/**
 * Return type for useWebSearch hook
 */
export interface UseWebSearchReturn {
  /** Whether search is in progress */
  isSearching: boolean;
  /** Whether ingestion is in progress */
  isIngesting: boolean;
  /** Current search query */
  query: string;
  /** Search results */
  results: ITavilySearchResult[];
  /** AI-generated answer */
  answer: string | null;
  /** Error message */
  error: string | null;
  /** Perform web search */
  search: (query: string, options?: IWebSearchOptions) => Promise<ITavilySearchResponse | null>;
  /** Ingest a URL */
  ingestUrl: (input: IUrlIngestionInput) => Promise<IUrlIngestionResult>;
  /** Ingest search result */
  ingestResult: (result: ITavilySearchResult) => Promise<IUrlIngestionResult>;
  /** Clear results */
  clearResults: () => void;
  /** Clear error */
  clearError: () => void;
}

/**
 * Hook for web search and URL ingestion
 * 
 * @param options - Configuration options
 * @returns Web search state and operations
 */
export function useWebSearch(
  options: UseWebSearchOptions = {}
): UseWebSearchReturn {
  const { defaultSearchOptions, onSearchComplete, onIngestionComplete } = options;

  const [isSearching, setIsSearching] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ITavilySearchResult[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Perform web search via Tavily
   */
  const search = useCallback(async (
    searchQuery: string,
    searchOptions: IWebSearchOptions = {}
  ): Promise<ITavilySearchResponse | null> => {
    if (!searchQuery.trim()) {
      setError('Search query is required');
      return null;
    }

    setIsSearching(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const mergedOptions = {
        ...DEFAULT_SEARCH_OPTIONS,
        ...defaultSearchOptions,
        ...searchOptions,
      };

      const response = await window.webSearchAPI?.search(searchQuery, mergedOptions);

      if (!response) {
        throw new Error('Search failed - no response');
      }

      setResults(response.results);
      setAnswer(response.answer ?? null);
      onSearchComplete?.(response);

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      return null;
    } finally {
      setIsSearching(false);
    }
  }, [defaultSearchOptions, onSearchComplete]);

  /**
   * Ingest a URL
   */
  const ingestUrl = useCallback(async (
    input: IUrlIngestionInput
  ): Promise<IUrlIngestionResult> => {
    setIsIngesting(true);
    setError(null);

    try {
      // Validate URL
      try {
        new URL(input.url);
      } catch {
        throw new Error('Invalid URL');
      }

      // Fetch and ingest via main process
      const result = await window.webSearchAPI?.ingestUrl(input);

      if (!result) {
        throw new Error('Ingestion failed - no response');
      }

      onIngestionComplete?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ingestion failed';
      setError(message);

      return {
        success: false,
        url: input.url,
        title: '',
        chunkCount: 0,
        entryIds: [],
        error: message,
      };
    } finally {
      setIsIngesting(false);
    }
  }, [onIngestionComplete]);

  /**
   * Ingest a search result
   */
  const ingestResult = useCallback(async (
    result: ITavilySearchResult
  ): Promise<IUrlIngestionResult> => {
    return ingestUrl({
      url: result.url,
      title: result.title,
    });
  }, [ingestUrl]);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setQuery('');
    setResults([]);
    setAnswer(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isSearching,
    isIngesting,
    query,
    results,
    answer,
    error,
    search,
    ingestUrl,
    ingestResult,
    clearResults,
    clearError,
  };
}

