/**
 * Vector Store type definitions
 * Defines interfaces for vector entries, search, and storage operations
 */

/**
 * Source types for vector entries
 */
export type VectorSourceType =
  | 'document'
  | 'web'
  | 'github'
  | 'github-code'
  | 'github-issue'
  | 'github-pr'
  | 'github-diff'
  | 'note'
  | 'voice'
  | 'image';

/**
 * Metadata associated with a vector entry
 */
export interface IVectorMetadata {
  /** Original filename or title */
  title: string;
  /** Source URL or file path */
  sourcePath: string;
  /** MIME type of original content */
  mimeType?: string;
  /** LLM-generated classification/tags */
  classification?: string[];
  /** User-defined tags */
  tags?: string[];
  /** Language of content */
  language?: string;
  /** For GitHub: repository URL */
  repoUrl?: string;
  /** For GitHub: repository name (owner/repo) */
  repository?: string;
  /** For GitHub: commit hash */
  commitHash?: string;
  /** For GitHub: file path in repo */
  filePath?: string;
  /** For GitHub: file extension */
  fileExtension?: string;
  /** For chunked content: chunk index */
  chunkIndex?: number;
  /** For chunked content: total chunks */
  totalChunks?: number;
  /** Word count */
  wordCount?: number;
  /** Character count */
  charCount?: number;
  /** For images: width in pixels */
  width?: number;
  /** For images: height in pixels */
  height?: number;
  /** For images: whether AI description exists */
  hasDescription?: boolean;
  /** For images: whether OCR text exists */
  hasOcr?: boolean;
  /** For voice: duration in seconds */
  duration?: number;
  /** For voice: audio format */
  format?: string;
}

/**
 * A single entry in the vector database
 */
export interface IVectorEntry {
  /** Unique identifier (UUID) */
  id: string;
  /** Source type of the content */
  sourceType: VectorSourceType;
  /** Original content text */
  content: string;
  /** Vector embedding (float array) */
  embedding: number[];
  /** Associated metadata */
  metadata: IVectorMetadata;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Input for creating a new vector entry (without auto-generated fields)
 */
export interface IVectorEntryInput {
  /** Source type of the content */
  sourceType: VectorSourceType;
  /** Original content text */
  content: string;
  /** Vector embedding (float array) */
  embedding: number[];
  /** Associated metadata */
  metadata: IVectorMetadata;
}

/**
 * Options for vector similarity search
 */
export interface IVectorSearchOptions {
  /** Maximum results to return (default: 10) */
  limit?: number;
  /** Minimum similarity threshold 0-1 (default: 0) */
  threshold?: number;
  /** Filter by source types */
  sourceTypes?: VectorSourceType[];
  /** Filter by tags */
  tags?: string[];
}

/**
 * A single search result with relevance score
 */
export interface IVectorSearchResult {
  /** The matching vector entry */
  entry: IVectorEntry;
  /** Cosine similarity score (0-1, higher is more similar) */
  score: number;
  /** Distance metric (lower is more similar) */
  distance: number;
}

/**
 * Vector store statistics
 */
export interface IVectorStoreStats {
  /** Total number of entries */
  totalEntries: number;
  /** Entries by source type */
  entriesByType: Record<VectorSourceType, number>;
  /** Last sync timestamp */
  lastSyncAt: Date | null;
  /** Whether store is synced with SQLite */
  isSynced: boolean;
}

/**
 * Vector store interface for dependency inversion
 */
export interface IVectorStore {
  /** Add a new entry to the store */
  add(entry: IVectorEntryInput): Promise<IVectorEntry>;
  /** Search for similar entries */
  search(queryEmbedding: number[], options?: IVectorSearchOptions): Promise<IVectorSearchResult[]>;
  /** Get entry by ID */
  get(id: string): Promise<IVectorEntry | null>;
  /** Delete entry by ID */
  delete(id: string): Promise<boolean>;
  /** Update entry */
  update(id: string, entry: Partial<IVectorEntryInput>): Promise<IVectorEntry | null>;
  /** Get all entries */
  getAll(): Promise<IVectorEntry[]>;
  /** Get store statistics */
  getStats(): Promise<IVectorStoreStats>;
  /** Sync to persistent storage */
  sync(): Promise<void>;
  /** Clear all entries */
  clear(): Promise<void>;
}

/**
 * Context state for vector store
 */
export interface IVectorStoreState {
  /** Current entries count */
  entryCount: number;
  /** Whether the store is loading */
  isLoading: boolean;
  /** Whether the store is syncing */
  isSyncing: boolean;
  /** Error message if any */
  error: string | null;
  /** Store statistics */
  stats: IVectorStoreStats | null;
}

/**
 * Context interface for vector store
 */
export interface IVectorStoreContext extends IVectorStoreState {
  /** Add a new entry */
  addEntry: (entry: IVectorEntryInput) => Promise<IVectorEntry>;
  /** Search for entries */
  searchEntries: (queryEmbedding: number[], options?: IVectorSearchOptions) => Promise<IVectorSearchResult[]>;
  /** Delete an entry */
  deleteEntry: (id: string) => Promise<boolean>;
  /** Sync to storage */
  syncStore: () => Promise<void>;
  /** Refresh statistics */
  refreshStats: () => Promise<void>;
}

/**
 * Default search options
 */
export const DEFAULT_SEARCH_OPTIONS: Required<IVectorSearchOptions> = {
  limit: 10,
  threshold: 0,
  sourceTypes: [],
  tags: [],
};

/**
 * Embedding dimensions (OpenAI text-embedding-3-small)
 */
export const EMBEDDING_DIMENSIONS = 1536;
