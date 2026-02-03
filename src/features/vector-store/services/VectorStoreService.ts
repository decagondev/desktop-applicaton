/**
 * In-memory Vector Store Service
 * Implements IVectorStore interface with cosine similarity search
 */

import type {
  IVectorStore,
  IVectorEntry,
  IVectorEntryInput,
  IVectorSearchOptions,
  IVectorSearchResult,
  IVectorStoreStats,
  VectorSourceType,
  DEFAULT_SEARCH_OPTIONS,
} from '../types/vector-store.types';

/**
 * Calculate cosine similarity between two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns Cosine similarity (0-1)
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * In-memory implementation of IVectorStore
 * Uses cosine similarity for vector search
 */
export class VectorStoreService implements IVectorStore {
  private entries: Map<string, IVectorEntry> = new Map();
  private lastSyncAt: Date | null = null;
  private isDirty = false;

  /**
   * Add a new entry to the vector store
   * @param input - Entry data without auto-generated fields
   * @returns The created entry with generated ID and timestamps
   */
  async add(input: IVectorEntryInput): Promise<IVectorEntry> {
    const now = new Date();
    const entry: IVectorEntry = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    this.entries.set(entry.id, entry);
    this.isDirty = true;

    return entry;
  }

  /**
   * Search for similar entries using cosine similarity
   * @param queryEmbedding - Query vector embedding
   * @param options - Search options
   * @returns Array of search results sorted by similarity
   */
  async search(
    queryEmbedding: number[],
    options: IVectorSearchOptions = {}
  ): Promise<IVectorSearchResult[]> {
    const {
      limit = 10,
      threshold = 0,
      sourceTypes = [],
      tags = [],
    } = options;

    const results: IVectorSearchResult[] = [];

    for (const entry of this.entries.values()) {
      // Apply source type filter
      if (sourceTypes.length > 0 && !sourceTypes.includes(entry.sourceType)) {
        continue;
      }

      // Apply tag filter
      if (tags.length > 0) {
        const entryTags = entry.metadata.tags ?? [];
        const hasMatchingTag = tags.some(tag => entryTags.includes(tag));
        if (!hasMatchingTag) {
          continue;
        }
      }

      // Calculate similarity
      const score = cosineSimilarity(queryEmbedding, entry.embedding);
      const distance = 1 - score;

      // Apply threshold filter
      if (score >= threshold) {
        results.push({ entry, score, distance });
      }
    }

    // Sort by score descending and limit
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get a single entry by ID
   * @param id - Entry ID
   * @returns Entry or null if not found
   */
  async get(id: string): Promise<IVectorEntry | null> {
    return this.entries.get(id) ?? null;
  }

  /**
   * Delete an entry by ID
   * @param id - Entry ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const deleted = this.entries.delete(id);
    if (deleted) {
      this.isDirty = true;
    }
    return deleted;
  }

  /**
   * Update an existing entry
   * @param id - Entry ID
   * @param updates - Partial entry data to update
   * @returns Updated entry or null if not found
   */
  async update(
    id: string,
    updates: Partial<IVectorEntryInput>
  ): Promise<IVectorEntry | null> {
    const existing = this.entries.get(id);
    if (!existing) {
      return null;
    }

    const updated: IVectorEntry = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      metadata: {
        ...existing.metadata,
        ...(updates.metadata ?? {}),
      },
    };

    this.entries.set(id, updated);
    this.isDirty = true;

    return updated;
  }

  /**
   * Get all entries in the store
   * @returns Array of all entries
   */
  async getAll(): Promise<IVectorEntry[]> {
    return Array.from(this.entries.values());
  }

  /**
   * Get store statistics
   * @returns Statistics about the store
   */
  async getStats(): Promise<IVectorStoreStats> {
    const entriesByType: Record<VectorSourceType, number> = {
      document: 0,
      web: 0,
      'github-code': 0,
      'github-issue': 0,
      'github-pr': 0,
      'github-diff': 0,
      note: 0,
      voice: 0,
      image: 0,
    };

    for (const entry of this.entries.values()) {
      entriesByType[entry.sourceType]++;
    }

    return {
      totalEntries: this.entries.size,
      entriesByType,
      lastSyncAt: this.lastSyncAt,
      isSynced: !this.isDirty,
    };
  }

  /**
   * Mark the store as synced (called after SQLite backup)
   */
  async sync(): Promise<void> {
    this.lastSyncAt = new Date();
    this.isDirty = false;
  }

  /**
   * Clear all entries from the store
   */
  async clear(): Promise<void> {
    this.entries.clear();
    this.isDirty = true;
  }

  /**
   * Load entries from an array (used for restoring from SQLite)
   * @param entries - Array of entries to load
   */
  loadEntries(entries: IVectorEntry[]): void {
    this.entries.clear();
    for (const entry of entries) {
      this.entries.set(entry.id, entry);
    }
    this.isDirty = false;
  }

  /**
   * Get all entries as an array (used for SQLite backup)
   * @returns Array of all entries
   */
  getEntriesArray(): IVectorEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Check if store has unsaved changes
   * @returns True if there are unsaved changes
   */
  hasPendingChanges(): boolean {
    return this.isDirty;
  }
}

/**
 * Export cosine similarity for testing
 */
export { cosineSimilarity };
