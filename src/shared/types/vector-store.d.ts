/**
 * Vector Store API type declarations
 * Defines the interface exposed by Electron preload for vector operations
 */

import type {
  IVectorEntry,
  IVectorEntryInput,
  IVectorSearchOptions,
  IVectorSearchResult,
  IVectorStoreStats,
} from '@features/vector-store';

/**
 * Embedding generation result
 */
interface IEmbeddingResult {
  embedding: number[];
}

/**
 * Batch embedding result
 */
interface IBatchEmbeddingResult {
  embeddings: number[][];
}

/**
 * Availability check result
 */
interface IAvailabilityResult {
  available: boolean;
}

/**
 * Vector Store API exposed via Electron preload
 */
interface IVectorStoreAPI {
  /** Add a new entry to the vector store */
  addEntry: (entry: IVectorEntryInput) => Promise<IVectorEntry | null>;
  /** Search for similar entries */
  search: (queryEmbedding: number[], options?: IVectorSearchOptions) => Promise<IVectorSearchResult[]>;
  /** Get entry by ID */
  getEntry: (id: string) => Promise<IVectorEntry | null>;
  /** Delete entry by ID */
  deleteEntry: (id: string) => Promise<boolean>;
  /** Get store statistics */
  getStats: () => Promise<IVectorStoreStats | null>;
  /** Sync store to persistent storage */
  sync: () => Promise<void>;
  /** Generate embedding for text */
  generateEmbedding: (text: string, model?: string) => Promise<IEmbeddingResult | null>;
  /** Generate embeddings for multiple texts */
  generateBatchEmbeddings: (texts: string[], model?: string) => Promise<IBatchEmbeddingResult | null>;
  /** Check if embedding service is available */
  isEmbeddingAvailable: () => Promise<IAvailabilityResult>;
}

declare global {
  interface Window {
    vectorStoreAPI?: IVectorStoreAPI;
  }
}

export type {
  IVectorStoreAPI,
  IEmbeddingResult,
  IBatchEmbeddingResult,
  IAvailabilityResult,
};
