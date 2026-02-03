/**
 * useFileIngestion Hook
 * Handles file upload and ingestion workflow
 */

import { useState, useCallback, useRef } from 'react';
import type {
  IUploadProgress,
  IUploadResult,
  IChunkConfig,
  UploadStage,
} from '../types/ingestion.types';
import {
  DEFAULT_CHUNK_CONFIG,
  MAX_FILE_SIZE,
  SUPPORTED_EXTENSIONS,
} from '../types/ingestion.types';
import { ParserFactory } from '../parsers/ParserFactory';

/**
 * Options for useFileIngestion hook
 */
export interface UseFileIngestionOptions {
  /** Custom chunk configuration */
  chunkConfig?: Partial<IChunkConfig>;
  /** Callback on progress update */
  onProgress?: (progress: IUploadProgress) => void;
  /** Callback on file complete */
  onComplete?: (result: IUploadResult) => void;
}

/**
 * Return type for useFileIngestion hook
 */
export interface UseFileIngestionReturn {
  /** Whether upload is in progress */
  isUploading: boolean;
  /** Current progress */
  progress: IUploadProgress | null;
  /** Upload results */
  results: IUploadResult[];
  /** Error message */
  error: string | null;
  /** Upload files */
  uploadFiles: (files: File[]) => Promise<IUploadResult[]>;
  /** Cancel upload */
  cancel: () => void;
  /** Clear results */
  clearResults: () => void;
  /** Clear error */
  clearError: () => void;
}

/**
 * Hook for file ingestion workflow
 * 
 * @param options - Configuration options
 * @returns Ingestion state and operations
 * 
 * @example
 * ```tsx
 * const { uploadFiles, isUploading, progress, results } = useFileIngestion({
 *   onProgress: (p) => console.log(p.stage, p.progress),
 *   onComplete: (r) => console.log('Done:', r.fileName),
 * });
 * 
 * await uploadFiles(fileList);
 * ```
 */
export function useFileIngestion(
  options: UseFileIngestionOptions = {}
): UseFileIngestionReturn {
  const { chunkConfig, onProgress, onComplete } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<IUploadProgress | null>(null);
  const [results, setResults] = useState<IUploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const cancelRef = useRef(false);
  // Merge default chunk config with provided config
  const _mergedConfig = { ...DEFAULT_CHUNK_CONFIG, ...chunkConfig };
  void _mergedConfig; // Used for future chunk configuration

  /**
   * Update progress state
   */
  const updateProgress = useCallback((
    fileName: string,
    stage: UploadStage,
    progressValue: number,
    message: string
  ) => {
    const newProgress: IUploadProgress = {
      fileName,
      stage,
      progress: progressValue,
      message,
    };
    setProgress(newProgress);
    onProgress?.(newProgress);
  }, [onProgress]);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${file.name} (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`;
    }

    // Check file type
    if (!ParserFactory.isSupported(file.name)) {
      return `Unsupported file type: ${file.name}. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`;
    }

    return null;
  }, []);

  /**
   * Process a single file
   */
  const processFile = useCallback(async (file: File): Promise<IUploadResult> => {
    const fileName = file.name;

    try {
      // Stage 1: Reading
      updateProgress(fileName, 'reading', 10, 'Reading file...');
      
      if (cancelRef.current) {
        throw new Error('Upload cancelled');
      }

      const content = await file.arrayBuffer();

      // Stage 2: Parsing
      updateProgress(fileName, 'parsing', 30, 'Parsing document...');
      
      if (cancelRef.current) {
        throw new Error('Upload cancelled');
      }

      const parser = ParserFactory.getParserForFile(fileName);
      if (!parser) {
        throw new Error(`No parser available for ${fileName}`);
      }

      const parsed = await parser.parse(content, fileName);

      // Stage 3: Chunking
      updateProgress(fileName, 'chunking', 50, `Creating ${parsed.chunks.length} chunks...`);
      
      if (cancelRef.current) {
        throw new Error('Upload cancelled');
      }

      // Stage 4: Embedding
      updateProgress(fileName, 'embedding', 60, 'Generating embeddings...');
      
      const entryIds: string[] = [];

      for (let i = 0; i < parsed.chunks.length; i++) {
        if (cancelRef.current) {
          throw new Error('Upload cancelled');
        }

        const chunk = parsed.chunks[i];
        const progressPercent = 60 + (i / parsed.chunks.length) * 30;
        updateProgress(
          fileName, 
          'embedding', 
          progressPercent, 
          `Processing chunk ${i + 1}/${parsed.chunks.length}...`
        );

        // Generate embedding
        const embeddingResult = await window.vectorStoreAPI?.generateEmbedding(chunk.content);
        if (!embeddingResult?.embedding) {
          console.warn(`Failed to generate embedding for chunk ${i}`);
          continue;
        }

        // Store in vector store
        const entry = await window.vectorStoreAPI?.addEntry({
          sourceType: 'document',
          content: chunk.content,
          embedding: embeddingResult.embedding,
          metadata: {
            title: parsed.title,
            sourcePath: fileName,
            mimeType: parsed.metadata.mimeType,
            language: parsed.metadata.language,
            wordCount: chunk.wordCount,
            charCount: chunk.content.length,
            chunkIndex: chunk.index,
            totalChunks: parsed.chunks.length,
          },
        });

        if (entry?.id) {
          entryIds.push(entry.id);
        }
      }

      // Stage 5: Complete
      updateProgress(fileName, 'complete', 100, 'Upload complete');

      const result: IUploadResult = {
        success: true,
        fileName,
        chunkCount: parsed.chunks.length,
        entryIds,
      };

      onComplete?.(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      updateProgress(fileName, 'error', 0, errorMessage);

      return {
        success: false,
        fileName,
        chunkCount: 0,
        entryIds: [],
        error: errorMessage,
      };
    }
  }, [updateProgress, onComplete]);

  /**
   * Upload multiple files
   */
  const uploadFiles = useCallback(async (files: File[]): Promise<IUploadResult[]> => {
    setIsUploading(true);
    setError(null);
    cancelRef.current = false;

    const uploadResults: IUploadResult[] = [];

    try {
      // Validate all files first
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return [];
        }
      }

      // Process files sequentially
      for (const file of files) {
        if (cancelRef.current) {
          break;
        }

        const result = await processFile(file);
        uploadResults.push(result);
        setResults(prev => [...prev, result]);
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
    } finally {
      setIsUploading(false);
      setProgress(null);
    }

    return uploadResults;
  }, [validateFile, processFile]);

  /**
   * Cancel upload
   */
  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  /**
   * Clear results
   */
  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isUploading,
    progress,
    results,
    error,
    uploadFiles,
    cancel,
    clearResults,
    clearError,
  };
}

