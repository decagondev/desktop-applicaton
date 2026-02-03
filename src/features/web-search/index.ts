/**
 * Web Search Feature
 * 
 * Provides web search via Tavily and URL ingestion for the Second Brain app.
 * 
 * @packageDocumentation
 */

// Components
export { SearchBar } from './components/SearchBar';
export { SearchResults } from './components/SearchResults';

// Hooks
export { useWebSearch } from './hooks/useWebSearch';
export type {
  UseWebSearchOptions,
  UseWebSearchReturn,
} from './hooks/useWebSearch';

// Types
export type {
  ITavilySearchResult,
  ITavilySearchResponse,
  SearchDepth,
  IWebSearchOptions,
  IUrlIngestionInput,
  IUrlIngestionResult,
  IWebSearchState,
  IWebSearchContext,
} from './types/web-search.types';

export { DEFAULT_SEARCH_OPTIONS } from './types/web-search.types';
