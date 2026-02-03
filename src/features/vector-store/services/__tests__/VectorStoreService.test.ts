/**
 * Tests for VectorStoreService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VectorStoreService, cosineSimilarity } from '../VectorStoreService';
import type { IVectorEntryInput, VectorSourceType } from '../../types/vector-store.types';

describe('VectorStoreService', () => {
  let store: VectorStoreService;

  beforeEach(() => {
    store = new VectorStoreService();
  });

  describe('cosineSimilarity', () => {
    it('returns 1 for identical vectors', () => {
      const vector = [1, 0, 0];
      expect(cosineSimilarity(vector, vector)).toBe(1);
    });

    it('returns 0 for orthogonal vectors', () => {
      const a = [1, 0, 0];
      const b = [0, 1, 0];
      expect(cosineSimilarity(a, b)).toBe(0);
    });

    it('returns -1 for opposite vectors', () => {
      const a = [1, 0, 0];
      const b = [-1, 0, 0];
      expect(cosineSimilarity(a, b)).toBe(-1);
    });

    it('throws for vectors of different lengths', () => {
      const a = [1, 0];
      const b = [1, 0, 0];
      expect(() => cosineSimilarity(a, b)).toThrow('Vectors must have the same length');
    });

    it('returns 0 for zero vectors', () => {
      const zero = [0, 0, 0];
      const normal = [1, 0, 0];
      expect(cosineSimilarity(zero, normal)).toBe(0);
    });
  });

  describe('add', () => {
    it('adds an entry with generated ID and timestamps', async () => {
      const input: IVectorEntryInput = {
        sourceType: 'document',
        content: 'Test content',
        embedding: [0.1, 0.2, 0.3],
        metadata: {
          title: 'Test',
          sourcePath: '/test.txt',
        },
      };

      const entry = await store.add(input);

      expect(entry.id).toBeDefined();
      expect(entry.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      expect(entry.sourceType).toBe('document');
      expect(entry.content).toBe('Test content');
      expect(entry.embedding).toEqual([0.1, 0.2, 0.3]);
      expect(entry.metadata.title).toBe('Test');
      expect(entry.createdAt).toBeInstanceOf(Date);
      expect(entry.updatedAt).toBeInstanceOf(Date);
    });

    it('increments entry count', async () => {
      const input: IVectorEntryInput = {
        sourceType: 'note',
        content: 'Note content',
        embedding: [0.5, 0.5],
        metadata: { title: 'Note', sourcePath: '/note.md' },
      };

      await store.add(input);
      await store.add(input);

      const stats = await store.getStats();
      expect(stats.totalEntries).toBe(2);
    });
  });

  describe('get', () => {
    it('retrieves entry by ID', async () => {
      const input: IVectorEntryInput = {
        sourceType: 'document',
        content: 'Test',
        embedding: [1, 0],
        metadata: { title: 'Test', sourcePath: '/test' },
      };

      const added = await store.add(input);
      const retrieved = await store.get(added.id);

      expect(retrieved).toEqual(added);
    });

    it('returns null for non-existent ID', async () => {
      const result = await store.get('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('deletes existing entry', async () => {
      const input: IVectorEntryInput = {
        sourceType: 'document',
        content: 'Test',
        embedding: [1, 0],
        metadata: { title: 'Test', sourcePath: '/test' },
      };

      const entry = await store.add(input);
      const deleted = await store.delete(entry.id);

      expect(deleted).toBe(true);
      expect(await store.get(entry.id)).toBeNull();
    });

    it('returns false for non-existent ID', async () => {
      const deleted = await store.delete('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('update', () => {
    it('updates entry content', async () => {
      const input: IVectorEntryInput = {
        sourceType: 'document',
        content: 'Original',
        embedding: [1, 0],
        metadata: { title: 'Test', sourcePath: '/test' },
      };

      const entry = await store.add(input);
      
      // Small delay to ensure updatedAt is different
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updated = await store.update(entry.id, { content: 'Updated' });

      expect(updated?.content).toBe('Updated');
      expect(updated?.id).toBe(entry.id);
      expect(updated?.createdAt).toEqual(entry.createdAt);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(entry.updatedAt.getTime());
    });

    it('updates entry metadata', async () => {
      const input: IVectorEntryInput = {
        sourceType: 'document',
        content: 'Test',
        embedding: [1, 0],
        metadata: { title: 'Original', sourcePath: '/test' },
      };

      const entry = await store.add(input);
      const updated = await store.update(entry.id, {
        metadata: { title: 'Updated', sourcePath: '/test', tags: ['new'] },
      });

      expect(updated?.metadata.title).toBe('Updated');
      expect(updated?.metadata.tags).toEqual(['new']);
    });

    it('returns null for non-existent ID', async () => {
      const result = await store.update('non-existent', { content: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      // Add test entries with different embeddings
      await store.add({
        sourceType: 'document',
        content: 'Document about cats',
        embedding: [1, 0, 0], // Unit vector in x direction
        metadata: { title: 'Cats', sourcePath: '/cats.txt', tags: ['animals'] },
      });

      await store.add({
        sourceType: 'document',
        content: 'Document about dogs',
        embedding: [0, 1, 0], // Unit vector in y direction
        metadata: { title: 'Dogs', sourcePath: '/dogs.txt', tags: ['animals'] },
      });

      await store.add({
        sourceType: 'note',
        content: 'Programming notes',
        embedding: [0, 0, 1], // Unit vector in z direction
        metadata: { title: 'Code', sourcePath: '/code.md', tags: ['tech'] },
      });
    });

    it('returns results sorted by similarity', async () => {
      const queryEmbedding = [0.9, 0.1, 0]; // Close to first entry

      const results = await store.search(queryEmbedding);

      expect(results.length).toBe(3);
      expect(results[0].entry.metadata.title).toBe('Cats');
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });

    it('respects limit option', async () => {
      const results = await store.search([1, 0, 0], { limit: 2 });
      expect(results.length).toBe(2);
    });

    it('filters by source type', async () => {
      const results = await store.search([1, 0, 0], {
        sourceTypes: ['note'],
      });

      expect(results.length).toBe(1);
      expect(results[0].entry.sourceType).toBe('note');
    });

    it('filters by tags', async () => {
      const results = await store.search([1, 0, 0], {
        tags: ['tech'],
      });

      expect(results.length).toBe(1);
      expect(results[0].entry.metadata.tags).toContain('tech');
    });

    it('applies threshold filter', async () => {
      const results = await store.search([1, 0, 0], {
        threshold: 0.9,
      });

      expect(results.length).toBe(1);
      expect(results[0].score).toBeGreaterThanOrEqual(0.9);
    });
  });

  describe('getAll', () => {
    it('returns all entries', async () => {
      await store.add({
        sourceType: 'document',
        content: 'Test 1',
        embedding: [1, 0],
        metadata: { title: 'Test 1', sourcePath: '/1' },
      });

      await store.add({
        sourceType: 'note',
        content: 'Test 2',
        embedding: [0, 1],
        metadata: { title: 'Test 2', sourcePath: '/2' },
      });

      const entries = await store.getAll();
      expect(entries.length).toBe(2);
    });
  });

  describe('getStats', () => {
    it('returns correct statistics', async () => {
      await store.add({
        sourceType: 'document',
        content: 'Doc',
        embedding: [1],
        metadata: { title: 'Doc', sourcePath: '/doc' },
      });

      await store.add({
        sourceType: 'note',
        content: 'Note',
        embedding: [1],
        metadata: { title: 'Note', sourcePath: '/note' },
      });

      const stats = await store.getStats();

      expect(stats.totalEntries).toBe(2);
      expect(stats.entriesByType.document).toBe(1);
      expect(stats.entriesByType.note).toBe(1);
      expect(stats.entriesByType.web).toBe(0);
      expect(stats.isSynced).toBe(false);
    });
  });

  describe('sync', () => {
    it('marks store as synced', async () => {
      await store.add({
        sourceType: 'document',
        content: 'Test',
        embedding: [1],
        metadata: { title: 'Test', sourcePath: '/test' },
      });

      let stats = await store.getStats();
      expect(stats.isSynced).toBe(false);

      await store.sync();

      stats = await store.getStats();
      expect(stats.isSynced).toBe(true);
      expect(stats.lastSyncAt).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('removes all entries', async () => {
      await store.add({
        sourceType: 'document',
        content: 'Test',
        embedding: [1],
        metadata: { title: 'Test', sourcePath: '/test' },
      });

      await store.clear();

      const stats = await store.getStats();
      expect(stats.totalEntries).toBe(0);
    });
  });

  describe('loadEntries', () => {
    it('loads entries from array', () => {
      const entries = [
        {
          id: 'test-1',
          sourceType: 'document' as VectorSourceType,
          content: 'Test 1',
          embedding: [1, 0],
          metadata: { title: 'Test 1', sourcePath: '/1' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'test-2',
          sourceType: 'note' as VectorSourceType,
          content: 'Test 2',
          embedding: [0, 1],
          metadata: { title: 'Test 2', sourcePath: '/2' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      store.loadEntries(entries);

      expect(store.getEntriesArray().length).toBe(2);
      expect(store.hasPendingChanges()).toBe(false);
    });
  });
});
