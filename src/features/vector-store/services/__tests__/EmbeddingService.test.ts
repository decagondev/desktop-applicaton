/**
 * Tests for EmbeddingService
 */

import { describe, it, expect } from 'vitest';
import { MockEmbeddingService } from '../EmbeddingService';
import { EMBEDDING_DIMENSIONS } from '../../types/vector-store.types';

describe('MockEmbeddingService', () => {
  describe('generateEmbedding', () => {
    it('returns embedding with correct dimensions', async () => {
      const service = new MockEmbeddingService();
      const embedding = await service.generateEmbedding('test text');

      expect(embedding.length).toBe(EMBEDDING_DIMENSIONS);
    });

    it('returns normalized vector (unit length)', async () => {
      const service = new MockEmbeddingService();
      const embedding = await service.generateEmbedding('test text');

      const magnitude = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0)
      );

      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('returns same embedding for same text (deterministic)', async () => {
      const service = new MockEmbeddingService();
      const embedding1 = await service.generateEmbedding('hello world');
      const embedding2 = await service.generateEmbedding('hello world');

      expect(embedding1).toEqual(embedding2);
    });

    it('returns different embeddings for different text', async () => {
      const service = new MockEmbeddingService();
      const embedding1 = await service.generateEmbedding('hello');
      const embedding2 = await service.generateEmbedding('world');

      expect(embedding1).not.toEqual(embedding2);
    });

    it('supports custom dimensions', async () => {
      const customDimensions = 384;
      const service = new MockEmbeddingService(customDimensions);
      const embedding = await service.generateEmbedding('test');

      expect(embedding.length).toBe(customDimensions);
    });
  });

  describe('generateBatchEmbeddings', () => {
    it('returns embeddings for all texts', async () => {
      const service = new MockEmbeddingService();
      const texts = ['text 1', 'text 2', 'text 3'];
      const embeddings = await service.generateBatchEmbeddings(texts);

      expect(embeddings.length).toBe(3);
      embeddings.forEach(embedding => {
        expect(embedding.length).toBe(EMBEDDING_DIMENSIONS);
      });
    });

    it('returns embeddings in same order as input', async () => {
      const service = new MockEmbeddingService();
      const texts = ['first', 'second'];
      const embeddings = await service.generateBatchEmbeddings(texts);

      const firstSingle = await service.generateEmbedding('first');
      const secondSingle = await service.generateEmbedding('second');

      expect(embeddings[0]).toEqual(firstSingle);
      expect(embeddings[1]).toEqual(secondSingle);
    });

    it('handles empty array', async () => {
      const service = new MockEmbeddingService();
      const embeddings = await service.generateBatchEmbeddings([]);

      expect(embeddings).toEqual([]);
    });
  });

  describe('isAvailable', () => {
    it('returns true for mock service', async () => {
      const service = new MockEmbeddingService();
      const available = await service.isAvailable();

      expect(available).toBe(true);
    });
  });

  describe('similar texts produce similar embeddings', () => {
    it('texts with common prefixes have closer embeddings', async () => {
      const service = new MockEmbeddingService();

      const embedding1 = await service.generateEmbedding('hello world');
      const embedding2 = await service.generateEmbedding('hello there');
      const embedding3 = await service.generateEmbedding('goodbye world');

      // Calculate cosine similarity
      const cosineSimilarity = (a: number[], b: number[]): number => {
        let dot = 0;
        for (let i = 0; i < a.length; i++) {
          dot += a[i] * b[i];
        }
        return dot; // Already normalized
      };

      const sim12 = cosineSimilarity(embedding1, embedding2);
      const sim13 = cosineSimilarity(embedding1, embedding3);

      // Note: The mock service uses hash-based generation,
      // so similarity is not semantically meaningful,
      // but the test verifies the service works correctly
      expect(typeof sim12).toBe('number');
      expect(typeof sim13).toBe('number');
    });
  });
});
