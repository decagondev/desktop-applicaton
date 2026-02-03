/**
 * Embedding Service
 * Generates vector embeddings for text content
 * Abstracts the embedding provider (OpenAI, local, etc.)
 */

import { EMBEDDING_DIMENSIONS } from '../types/vector-store.types';

/**
 * Options for embedding generation
 */
export interface IEmbeddingOptions {
  /** Model to use for embeddings */
  model?: string;
  /** Maximum tokens per request */
  maxTokens?: number;
}

/**
 * Embedding service interface for dependency inversion
 */
export interface IEmbeddingService {
  /** Generate embedding for a single text */
  generateEmbedding(text: string, options?: IEmbeddingOptions): Promise<number[]>;
  /** Generate embeddings for multiple texts */
  generateBatchEmbeddings(texts: string[], options?: IEmbeddingOptions): Promise<number[][]>;
  /** Check if the service is available */
  isAvailable(): Promise<boolean>;
}

/**
 * Default embedding options
 */
const DEFAULT_OPTIONS: Required<IEmbeddingOptions> = {
  model: 'text-embedding-3-small',
  maxTokens: 8191,
};

/**
 * Embedding service implementation using Electron IPC
 * Calls the main process which handles API communication
 */
export class EmbeddingService implements IEmbeddingService {
  /**
   * Generate embedding for a single text
   * @param text - Text to embed
   * @param options - Embedding options
   * @returns Vector embedding
   */
  async generateEmbedding(
    text: string,
    options: IEmbeddingOptions = {}
  ): Promise<number[]> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Truncate text if too long
    const truncatedText = this.truncateText(text, mergedOptions.maxTokens);

    // Call Electron IPC to generate embedding
    const result = await window.vectorStoreAPI?.generateEmbedding(
      truncatedText,
      mergedOptions.model
    );

    if (!result || !result.embedding) {
      throw new Error('Failed to generate embedding');
    }

    return result.embedding;
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param texts - Array of texts to embed
   * @param options - Embedding options
   * @returns Array of vector embeddings
   */
  async generateBatchEmbeddings(
    texts: string[],
    options: IEmbeddingOptions = {}
  ): Promise<number[][]> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // Truncate texts if too long
    const truncatedTexts = texts.map(text =>
      this.truncateText(text, mergedOptions.maxTokens)
    );

    // Call Electron IPC for batch embedding
    const result = await window.vectorStoreAPI?.generateBatchEmbeddings(
      truncatedTexts,
      mergedOptions.model
    );

    if (!result || !result.embeddings) {
      throw new Error('Failed to generate batch embeddings');
    }

    return result.embeddings;
  }

  /**
   * Check if embedding service is available
   * @returns True if service is ready
   */
  async isAvailable(): Promise<boolean> {
    try {
      const result = await window.vectorStoreAPI?.isEmbeddingAvailable();
      return result?.available ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Truncate text to fit within token limit
   * Rough estimation: 1 token ≈ 4 characters
   * @param text - Text to truncate
   * @param maxTokens - Maximum tokens allowed
   * @returns Truncated text
   */
  private truncateText(text: string, maxTokens: number): string {
    const maxChars = maxTokens * 4;
    if (text.length <= maxChars) {
      return text;
    }
    return text.slice(0, maxChars);
  }
}

/**
 * Mock embedding service for testing and offline mode
 * Generates random embeddings with consistent dimensions
 */
export class MockEmbeddingService implements IEmbeddingService {
  private dimensions: number;

  constructor(dimensions: number = EMBEDDING_DIMENSIONS) {
    this.dimensions = dimensions;
  }

  /**
   * Generate a deterministic mock embedding based on text hash
   */
  async generateEmbedding(text: string): Promise<number[]> {
    return this.hashToEmbedding(text);
  }

  /**
   * Generate mock embeddings for multiple texts
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map(text => this.hashToEmbedding(text));
  }

  /**
   * Mock service is always available
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }

  /**
   * Generate deterministic embedding from text hash
   * Same text will always produce the same embedding
   */
  private hashToEmbedding(text: string): number[] {
    const embedding: number[] = new Array(this.dimensions);
    let hash = 0;

    // Simple string hash
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Generate embedding from hash
    const random = this.seededRandom(hash);
    for (let i = 0; i < this.dimensions; i++) {
      embedding[i] = random() * 2 - 1; // Range [-1, 1]
    }

    // Normalize to unit vector
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    return embedding.map(val => val / magnitude);
  }

  /**
   * Seeded random number generator for deterministic embeddings
   */
  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
  }
}
