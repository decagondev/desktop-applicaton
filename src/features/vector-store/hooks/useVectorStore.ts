/**
 * useVectorStore Hook
 * Provides access to vector store operations with React state management
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  IVectorEntry,
  IVectorEntryInput,
  IVectorSearchOptions,
  IVectorSearchResult,
  IVectorStoreStats,
} from '../types/vector-store.types';

/**
 * Options for the useVectorStore hook
 */
export interface UseVectorStoreOptions {
  /** Auto-sync interval in ms (0 to disable) */
  autoSyncInterval?: number;
  /** Whether to load stats on mount */
  loadStatsOnMount?: boolean;
}

/**
 * Return type for useVectorStore hook
 */
export interface UseVectorStoreReturn {
  /** Number of entries in the store */
  entryCount: number;
  /** Whether operations are in progress */
  isLoading: boolean;
  /** Whether sync is in progress */
  isSyncing: boolean;
  /** Error message if any */
  error: string | null;
  /** Store statistics */
  stats: IVectorStoreStats | null;
  /** Add a new entry */
  addEntry: (entry: IVectorEntryInput) => Promise<IVectorEntry | null>;
  /** Search for entries */
  search: (queryEmbedding: number[], options?: IVectorSearchOptions) => Promise<IVectorSearchResult[]>;
  /** Get entry by ID */
  getEntry: (id: string) => Promise<IVectorEntry | null>;
  /** Delete entry by ID */
  deleteEntry: (id: string) => Promise<boolean>;
  /** Sync store to persistent storage */
  syncStore: () => Promise<void>;
  /** Refresh statistics */
  refreshStats: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Hook for interacting with the vector store
 * 
 * @param options - Configuration options
 * @returns Vector store state and operations
 * 
 * @example
 * ```tsx
 * const { addEntry, search, isLoading, error } = useVectorStore();
 * 
 * // Add an entry
 * await addEntry({
 *   sourceType: 'document',
 *   content: 'Hello world',
 *   embedding: [...],
 *   metadata: { title: 'Test', sourcePath: '/test.txt' }
 * });
 * 
 * // Search
 * const results = await search(queryEmbedding, { limit: 5 });
 * ```
 */
export function useVectorStore(
  options: UseVectorStoreOptions = {}
): UseVectorStoreReturn {
  const { autoSyncInterval = 0, loadStatsOnMount = true } = options;

  const [entryCount, setEntryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<IVectorStoreStats | null>(null);

  /**
   * Refresh statistics from the store
   */
  const refreshStats = useCallback(async () => {
    try {
      const result = await window.vectorStoreAPI?.getStats();
      if (result) {
        setStats(result);
        setEntryCount(result.totalEntries);
      }
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  }, []);

  /**
   * Add a new entry to the store
   */
  const addEntry = useCallback(async (
    entry: IVectorEntryInput
  ): Promise<IVectorEntry | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.vectorStoreAPI?.addEntry(entry);
      if (!result) {
        throw new Error('Failed to add entry');
      }

      await refreshStats();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add entry';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  /**
   * Search for similar entries
   */
  const search = useCallback(async (
    queryEmbedding: number[],
    searchOptions: IVectorSearchOptions = {}
  ): Promise<IVectorSearchResult[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await window.vectorStoreAPI?.search(queryEmbedding, searchOptions);
      return results ?? [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get entry by ID
   */
  const getEntry = useCallback(async (id: string): Promise<IVectorEntry | null> => {
    try {
      const result = await window.vectorStoreAPI?.getEntry(id);
      return result ?? null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get entry';
      setError(message);
      return null;
    }
  }, []);

  /**
   * Delete entry by ID
   */
  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.vectorStoreAPI?.deleteEntry(id);
      if (result) {
        await refreshStats();
      }
      return result ?? false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  /**
   * Sync store to persistent storage
   */
  const syncStore = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      await window.vectorStoreAPI?.sync();
      await refreshStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
    } finally {
      setIsSyncing(false);
    }
  }, [refreshStats]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load stats on mount
  useEffect(() => {
    if (loadStatsOnMount) {
      refreshStats();
    }
  }, [loadStatsOnMount, refreshStats]);

  // Auto-sync interval
  useEffect(() => {
    if (autoSyncInterval > 0) {
      const interval = setInterval(syncStore, autoSyncInterval);
      return () => clearInterval(interval);
    }
  }, [autoSyncInterval, syncStore]);

  return {
    entryCount,
    isLoading,
    isSyncing,
    error,
    stats,
    addEntry,
    search,
    getEntry,
    deleteEntry,
    syncStore,
    refreshStats,
    clearError,
  };
}

export type { UseVectorStoreOptions, UseVectorStoreReturn };
