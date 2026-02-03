/**
 * Vector Store IPC Handlers
 * Handles all vector store operations from renderer process
 */

import { ipcMain } from 'electron';
import type {
  IVectorEntry,
  IVectorEntryInput,
  IVectorSearchOptions,
  IVectorSearchResult,
  IVectorStoreStats,
} from '../../src/features/vector-store/types/vector-store.types';

/**
 * In-memory vector store instance
 * TODO: Replace with actual VectorStoreService when integrating with main process
 */
class SimpleVectorStore {
  private entries: Map<string, IVectorEntry> = new Map();
  private lastSyncAt: Date | null = null;

  async add(input: IVectorEntryInput): Promise<IVectorEntry> {
    const now = new Date();
    const entry: IVectorEntry = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.entries.set(entry.id, entry);
    return entry;
  }

  async search(
    queryEmbedding: number[],
    options: IVectorSearchOptions = {}
  ): Promise<IVectorSearchResult[]> {
    const { limit = 10, threshold = 0, sourceTypes = [], tags = [] } = options;
    const results: IVectorSearchResult[] = [];

    for (const entry of this.entries.values()) {
      if (sourceTypes.length > 0 && !sourceTypes.includes(entry.sourceType)) {
        continue;
      }

      if (tags.length > 0) {
        const entryTags = entry.metadata.tags ?? [];
        if (!tags.some(tag => entryTags.includes(tag))) {
          continue;
        }
      }

      const score = this.cosineSimilarity(queryEmbedding, entry.embedding);
      if (score >= threshold) {
        results.push({ entry, score, distance: 1 - score });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async get(id: string): Promise<IVectorEntry | null> {
    return this.entries.get(id) ?? null;
  }

  async delete(id: string): Promise<boolean> {
    return this.entries.delete(id);
  }

  async getStats(): Promise<IVectorStoreStats> {
    const entriesByType: Record<string, number> = {};
    for (const entry of this.entries.values()) {
      entriesByType[entry.sourceType] = (entriesByType[entry.sourceType] ?? 0) + 1;
    }

    return {
      totalEntries: this.entries.size,
      entriesByType: entriesByType as IVectorStoreStats['entriesByType'],
      lastSyncAt: this.lastSyncAt,
      isSynced: true,
    };
  }

  async sync(): Promise<void> {
    this.lastSyncAt = new Date();
    // TODO: Implement SQLite backup
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dot / magnitude;
  }
}

const vectorStore = new SimpleVectorStore();

/**
 * Register all vector store IPC handlers
 */
export function registerVectorStoreHandlers(): void {
  /**
   * Add entry to vector store
   */
  ipcMain.handle('vector-add', async (_event, entry: IVectorEntryInput) => {
    try {
      return await vectorStore.add(entry);
    } catch (error) {
      console.error('Error in vector-add:', error);
      return null;
    }
  });

  /**
   * Search vector store
   */
  ipcMain.handle(
    'vector-search',
    async (_event, queryEmbedding: number[], options?: IVectorSearchOptions) => {
      try {
        return await vectorStore.search(queryEmbedding, options);
      } catch (error) {
        console.error('Error in vector-search:', error);
        return [];
      }
    }
  );

  /**
   * Get entry by ID
   */
  ipcMain.handle('vector-get', async (_event, id: string) => {
    try {
      return await vectorStore.get(id);
    } catch (error) {
      console.error('Error in vector-get:', error);
      return null;
    }
  });

  /**
   * Delete entry by ID
   */
  ipcMain.handle('vector-delete', async (_event, id: string) => {
    try {
      return await vectorStore.delete(id);
    } catch (error) {
      console.error('Error in vector-delete:', error);
      return false;
    }
  });

  /**
   * Get store statistics
   */
  ipcMain.handle('vector-stats', async () => {
    try {
      return await vectorStore.getStats();
    } catch (error) {
      console.error('Error in vector-stats:', error);
      return null;
    }
  });

  /**
   * Sync store to persistent storage
   */
  ipcMain.handle('vector-sync', async () => {
    try {
      await vectorStore.sync();
    } catch (error) {
      console.error('Error in vector-sync:', error);
    }
  });

  /**
   * Generate embedding for text
   * TODO: Implement actual embedding generation via API
   */
  ipcMain.handle('vector-generate-embedding', async (_event, text: string, _model?: string) => {
    try {
      // Mock embedding generation (deterministic based on text hash)
      const embedding = generateMockEmbedding(text);
      return { embedding };
    } catch (error) {
      console.error('Error in vector-generate-embedding:', error);
      return null;
    }
  });

  /**
   * Generate batch embeddings
   */
  ipcMain.handle('vector-generate-batch-embeddings', async (_event, texts: string[], _model?: string) => {
    try {
      const embeddings = texts.map(text => generateMockEmbedding(text));
      return { embeddings };
    } catch (error) {
      console.error('Error in vector-generate-batch-embeddings:', error);
      return null;
    }
  });

  /**
   * Check if embedding service is available
   */
  ipcMain.handle('vector-embedding-available', async () => {
    return { available: true };
  });
}

/**
 * Generate mock embedding from text (for development)
 * TODO: Replace with actual API call
 */
function generateMockEmbedding(text: string, dimensions = 1536): number[] {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }

  const embedding: number[] = new Array(dimensions);
  let seed = hash;
  
  for (let i = 0; i < dimensions; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    embedding[i] = (seed / 0x7fffffff) * 2 - 1;
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}
