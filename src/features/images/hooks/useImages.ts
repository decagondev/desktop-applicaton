/**
 * useImages Hook
 * Handles image processing and vectorization
 */

import { useState, useCallback } from 'react';
import type {
  IProcessedImage,
  IImageInput,
  IImageProcessingOptions,
  IImageProcessingProgress,
  IImageProcessingResult,
} from '../types/images.types';
import {
  DEFAULT_PROCESSING_OPTIONS,
  isSupportedImage,
  MAX_IMAGE_SIZE,
} from '../types/images.types';

/**
 * Options for useImages hook
 */
export interface UseImagesOptions {
  /** Default processing options */
  defaultOptions?: Partial<IImageProcessingOptions>;
  /** Callback when processing completes */
  onProcessingComplete?: (results: IImageProcessingResult[]) => void;
}

/**
 * Return type for useImages hook
 */
export interface UseImagesReturn {
  /** Processed images */
  images: IProcessedImage[];
  /** Processing state */
  isProcessing: boolean;
  /** Processing progress */
  progress: IImageProcessingProgress | null;
  /** Error message */
  error: string | null;
  /** Process images */
  processImages: (
    inputs: IImageInput[],
    options?: Partial<IImageProcessingOptions>
  ) => Promise<IImageProcessingResult[]>;
  /** Delete an image */
  deleteImage: (id: string) => Promise<boolean>;
  /** Vectorize an image */
  vectorizeImage: (id: string) => Promise<boolean>;
  /** Update image tags */
  updateImageTags: (id: string, tags: string[]) => Promise<boolean>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Read file as base64
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions
 */
async function getImageDimensions(base64: string, mimeType: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = `data:${mimeType};base64,${base64}`;
  });
}

/**
 * Hook for image processing
 * 
 * @param options - Configuration options
 * @returns Images state and operations
 */
export function useImages(options: UseImagesOptions = {}): UseImagesReturn {
  const { defaultOptions, onProcessingComplete } = options;

  const [images, setImages] = useState<IProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<IImageProcessingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process images
   */
  const processImages = useCallback(async (
    inputs: IImageInput[],
    processingOptions: Partial<IImageProcessingOptions> = {}
  ): Promise<IImageProcessingResult[]> => {
    if (inputs.length === 0) {
      return [];
    }

    setIsProcessing(true);
    setError(null);

    const mergedOptions = {
      ...DEFAULT_PROCESSING_OPTIONS,
      ...defaultOptions,
      ...processingOptions,
    };

    const results: IImageProcessingResult[] = [];

    try {
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];

        setProgress({
          stage: 'reading',
          percent: Math.floor((i / inputs.length) * 100),
          currentImage: input.file.name,
          totalImages: inputs.length,
          processedImages: i,
        });

        // Validate file
        if (!isSupportedImage(input.file)) {
          results.push({
            success: false,
            image: null,
            error: `Unsupported image format: ${input.file.type}`,
          });
          continue;
        }

        if (input.file.size > MAX_IMAGE_SIZE) {
          results.push({
            success: false,
            image: null,
            error: `Image too large: ${(input.file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`,
          });
          continue;
        }

        try {
          // Read file
          const base64Data = await fileToBase64(input.file);
          const dimensions = await getImageDimensions(base64Data, input.file.type);

          // Stage: Describing
          setProgress(prev => prev ? { ...prev, stage: 'describing', percent: prev.percent + 10 } : null);

          let description: string | null = null;
          let ocrText: string | null = null;

          // Get AI description
          if (mergedOptions.mode === 'description' || mergedOptions.mode === 'both') {
            const descResult = await window.imagesAPI?.describeImage(base64Data, input.file.type);
            description = descResult?.description ?? null;
          }

          // Stage: OCR
          setProgress(prev => prev ? { ...prev, stage: 'ocr', percent: prev.percent + 10 } : null);

          // Get OCR text
          if (mergedOptions.mode === 'ocr' || mergedOptions.mode === 'both') {
            const ocrResult = await window.imagesAPI?.extractText(base64Data, input.file.type);
            ocrText = ocrResult?.text ?? null;
          }

          // Build vector content
          const vectorContent = [
            description,
            ocrText,
            input.tags?.join(' '),
            input.file.name,
          ].filter(Boolean).join('\n\n');

          // Create processed image
          const processedImage: IProcessedImage = {
            id: generateId(),
            filename: input.file.name,
            mimeType: input.file.type as IProcessedImage['mimeType'],
            width: dimensions.width,
            height: dimensions.height,
            size: input.file.size,
            base64Data,
            description,
            ocrText,
            vectorContent,
            isVectorized: false,
            vectorEntryIds: [],
            tags: input.tags ?? [],
            createdAt: new Date(),
          };

          // Stage: Vectorizing
          if (mergedOptions.autoVectorize && vectorContent) {
            setProgress(prev => prev ? { ...prev, stage: 'vectorizing', percent: prev.percent + 10 } : null);

            const embeddingResult = await window.vectorStoreAPI?.generateEmbedding(vectorContent);
            if (embeddingResult?.embedding) {
              const entry = await window.vectorStoreAPI?.addEntry({
                sourceType: 'image',
                content: vectorContent,
                embedding: embeddingResult.embedding,
                metadata: {
                  title: input.file.name,
                  sourcePath: `image://${processedImage.id}`,
                  mimeType: input.file.type,
                  width: dimensions.width,
                  height: dimensions.height,
                  hasDescription: !!description,
                  hasOcr: !!ocrText,
                  wordCount: vectorContent.split(/\s+/).length,
                  charCount: vectorContent.length,
                },
              });

              if (entry?.id) {
                processedImage.isVectorized = true;
                processedImage.vectorEntryIds = [entry.id];
              }
            }
          }

          setImages(prev => [processedImage, ...prev]);
          results.push({ success: true, image: processedImage });

        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to process image';
          results.push({ success: false, image: null, error: message });
        }
      }

      setProgress({
        stage: 'complete',
        percent: 100,
        totalImages: inputs.length,
        processedImages: inputs.length,
      });

      onProcessingComplete?.(results);
      return results;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process images';
      setError(message);
      return results;
    } finally {
      setIsProcessing(false);
    }
  }, [defaultOptions, onProcessingComplete]);

  /**
   * Delete an image
   */
  const deleteImage = useCallback(async (id: string): Promise<boolean> => {
    try {
      setImages(prev => prev.filter(img => img.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete image';
      setError(message);
      return false;
    }
  }, []);

  /**
   * Vectorize an image
   */
  const vectorizeImage = useCallback(async (id: string): Promise<boolean> => {
    try {
      const image = images.find(img => img.id === id);
      if (!image || !image.vectorContent) {
        throw new Error('Image not found or no content to vectorize');
      }

      const embeddingResult = await window.vectorStoreAPI?.generateEmbedding(image.vectorContent);
      if (!embeddingResult?.embedding) {
        throw new Error('Failed to generate embedding');
      }

      const entry = await window.vectorStoreAPI?.addEntry({
        sourceType: 'image',
        content: image.vectorContent,
        embedding: embeddingResult.embedding,
        metadata: {
          title: image.filename,
          sourcePath: `image://${image.id}`,
        },
      });

      if (!entry?.id) {
        throw new Error('Failed to store vector');
      }

      setImages(prev => prev.map(img => {
        if (img.id === id) {
          return {
            ...img,
            isVectorized: true,
            vectorEntryIds: [...img.vectorEntryIds, entry.id],
          };
        }
        return img;
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to vectorize image';
      setError(message);
      return false;
    }
  }, [images]);

  /**
   * Update image tags
   */
  const updateImageTags = useCallback(async (id: string, tags: string[]): Promise<boolean> => {
    try {
      setImages(prev => prev.map(img => {
        if (img.id === id) {
          return { ...img, tags };
        }
        return img;
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update tags';
      setError(message);
      return false;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    images,
    isProcessing,
    progress,
    error,
    processImages,
    deleteImage,
    vectorizeImage,
    updateImageTags,
    clearError,
  };
}

export type { UseImagesOptions, UseImagesReturn };
