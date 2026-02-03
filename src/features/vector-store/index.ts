/**
 * Vector Store Feature
 * 
 * Provides in-memory vector storage with SQLite backup for the Second Brain app.
 * Supports similarity search, metadata filtering, and automatic persistence.
 * 
 * @packageDocumentation
 */

// Services
export { VectorStoreService, cosineSimilarity } from './services/VectorStoreService';
export { EmbeddingService, MockEmbeddingService } from './services/EmbeddingService';
export type { IEmbeddingService, IEmbeddingOptions } from './services/EmbeddingService';

// Hooks
export { useVectorStore } from './hooks/useVectorStore';
export type {
  UseVectorStoreOptions,
  UseVectorStoreReturn,
} from './hooks/useVectorStore';

// Context
export {
  VectorStoreProvider,
  useVectorStoreContext,
  useVectorStoreOptional,
  VectorStoreContext,
} from './context/VectorStoreContext';

// Types
export type {
  VectorSourceType,
  IVectorMetadata,
  IVectorEntry,
  IVectorEntryInput,
  IVectorSearchOptions,
  IVectorSearchResult,
  IVectorStoreStats,
  IVectorStore,
  IVectorStoreState,
  IVectorStoreContext,
} from './types/vector-store.types';

export {
  DEFAULT_SEARCH_OPTIONS,
  EMBEDDING_DIMENSIONS,
} from './types/vector-store.types';
