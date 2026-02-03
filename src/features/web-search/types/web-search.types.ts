/**
 * Web Search feature type definitions
 * Defines interfaces for Tavily search and URL ingestion
 */

/**
 * Tavily search result
 */
export interface ITavilySearchResult {
  /** Result title */
  title: string;
  /** Result URL */
  url: string;
  /** Content snippet */
  content: string;
  /** Relevance score */
  score: number;
  /** Published date (if available) */
  publishedDate?: string;
}

/**
 * Tavily search response
 */
export interface ITavilySearchResponse {
  /** AI-generated answer (if requested) */
  answer?: string;
  /** Search query */
  query: string;
  /** Search results */
  results: ITavilySearchResult[];
  /** Response time in ms */
  responseTime: number;
}

/**
 * Search depth options
 */
export type SearchDepth = 'basic' | 'advanced';

/**
 * Search options
 */
export interface IWebSearchOptions {
  /** Search depth */
  depth?: SearchDepth;
  /** Maximum results to return */
  maxResults?: number;
  /** Include AI-generated answer */
  includeAnswer?: boolean;
  /** Include domains (whitelist) */
  includeDomains?: string[];
  /** Exclude domains (blacklist) */
  excludeDomains?: string[];
}

/**
 * Default search options
 */
export const DEFAULT_SEARCH_OPTIONS: Required<IWebSearchOptions> = {
  depth: 'basic',
  maxResults: 5,
  includeAnswer: true,
  includeDomains: [],
  excludeDomains: [],
};

/**
 * URL ingestion input
 */
export interface IUrlIngestionInput {
  /** URL to ingest */
  url: string;
  /** Custom title (optional) */
  title?: string;
  /** Custom tags (optional) */
  tags?: string[];
}

/**
 * URL ingestion result
 */
export interface IUrlIngestionResult {
  /** Whether ingestion succeeded */
  success: boolean;
  /** Ingested URL */
  url: string;
  /** Page title */
  title: string;
  /** Number of chunks created */
  chunkCount: number;
  /** Vector entry IDs */
  entryIds: string[];
  /** Error message if failed */
  error?: string;
}

/**
 * Web search state
 */
export interface IWebSearchState {
  /** Whether a search is in progress */
  isSearching: boolean;
  /** Whether URL ingestion is in progress */
  isIngesting: boolean;
  /** Current search query */
  query: string;
  /** Search results */
  results: ITavilySearchResult[];
  /** AI-generated answer */
  answer: string | null;
  /** Error message */
  error: string | null;
}

/**
 * Web search context interface
 */
export interface IWebSearchContext extends IWebSearchState {
  /** Perform a web search */
  search: (query: string, options?: IWebSearchOptions) => Promise<ITavilySearchResponse | null>;
  /** Ingest a URL */
  ingestUrl: (input: IUrlIngestionInput) => Promise<IUrlIngestionResult>;
  /** Ingest multiple URLs */
  ingestUrls: (inputs: IUrlIngestionInput[]) => Promise<IUrlIngestionResult[]>;
  /** Clear search results */
  clearResults: () => void;
  /** Clear error */
  clearError: () => void;
}
