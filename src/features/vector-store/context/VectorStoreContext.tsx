/**
 * Vector Store Context
 * Provides vector store state and operations to the component tree
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  IVectorStoreContext,
  IVectorEntry,
  IVectorEntryInput,
  IVectorSearchOptions,
  IVectorSearchResult,
  IVectorStoreStats,
} from '../types/vector-store.types';

const VectorStoreContext = createContext<IVectorStoreContext | null>(null);

/**
 * Props for VectorStoreProvider
 */
interface IVectorStoreProviderProps {
  /** Child components */
  children: ReactNode;
  /** Auto-sync interval in ms (default: 300000 = 5 minutes) */
  autoSyncInterval?: number;
}

/**
 * Provider component for vector store context
 * Manages vector store state and provides operations to children
 * 
 * @example
 * ```tsx
 * <VectorStoreProvider autoSyncInterval={60000}>
 *   <App />
 * </VectorStoreProvider>
 * ```
 */
export function VectorStoreProvider({
  children,
  autoSyncInterval = 300000,
}: IVectorStoreProviderProps): React.ReactElement {
  const [entryCount, setEntryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
  ): Promise<IVectorEntry> => {
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
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [refreshStats]);

  /**
   * Search for similar entries
   */
  const searchEntries = useCallback(async (
    queryEmbedding: number[],
    options: IVectorSearchOptions = {}
  ): Promise<IVectorSearchResult[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await window.vectorStoreAPI?.search(queryEmbedding, options);
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

  // Initial load
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await refreshStats();
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [refreshStats]);

  // Auto-sync interval
  useEffect(() => {
    if (autoSyncInterval > 0) {
      const interval = setInterval(syncStore, autoSyncInterval);
      return () => clearInterval(interval);
    }
  }, [autoSyncInterval, syncStore]);

  // Sync before app closes
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Trigger sync - note: async operations may not complete
      window.vectorStoreAPI?.sync();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const value: IVectorStoreContext = {
    entryCount,
    isLoading,
    isSyncing,
    error,
    stats,
    addEntry,
    searchEntries,
    deleteEntry,
    syncStore,
    refreshStats,
  };

  return (
    <VectorStoreContext.Provider value={value}>
      {children}
    </VectorStoreContext.Provider>
  );
}

/**
 * Hook to access vector store context
 * @throws Error if used outside VectorStoreProvider
 */
export function useVectorStoreContext(): IVectorStoreContext {
  const context = useContext(VectorStoreContext);
  if (!context) {
    throw new Error('useVectorStoreContext must be used within VectorStoreProvider');
  }
  return context;
}

/**
 * Hook to optionally access vector store context
 * Returns null if not within provider (useful for conditional rendering)
 */
export function useVectorStoreOptional(): IVectorStoreContext | null {
  return useContext(VectorStoreContext);
}

export { VectorStoreContext };
