/**
 * Web Search API type declarations
 * Defines the interface exposed by Electron preload for web search operations
 */

import type {
  ITavilySearchResponse,
  IWebSearchOptions,
  IUrlIngestionInput,
  IUrlIngestionResult,
} from '@features/web-search';

/**
 * Web Search API exposed via Electron preload
 */
interface IWebSearchAPI {
  /** Search the web via Tavily */
  search: (query: string, options?: IWebSearchOptions) => Promise<ITavilySearchResponse | null>;
  /** Ingest a URL into the vector store */
  ingestUrl: (input: IUrlIngestionInput) => Promise<IUrlIngestionResult | null>;
}

declare global {
  interface Window {
    webSearchAPI?: IWebSearchAPI;
  }
}

export type { IWebSearchAPI };
