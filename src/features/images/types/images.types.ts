/**
 * Images feature type definitions
 * Defines interfaces for multimodal image processing and vectorization
 */

/**
 * Supported image formats
 */
export type SupportedImageFormat = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/**
 * Image processing mode
 */
export type ImageProcessingMode = 'description' | 'ocr' | 'both';

/**
 * Processed image data
 */
export interface IProcessedImage {
  /** Unique identifier */
  id: string;
  /** Original filename */
  filename: string;
  /** MIME type */
  mimeType: SupportedImageFormat;
  /** Image width */
  width: number;
  /** Image height */
  height: number;
  /** File size in bytes */
  size: number;
  /** Base64 encoded image data */
  base64Data: string;
  /** Thumbnail base64 (smaller size) */
  thumbnailBase64?: string;
  /** AI-generated description */
  description: string | null;
  /** OCR extracted text */
  ocrText: string | null;
  /** Combined content for vectorization */
  vectorContent: string;
  /** Whether image has been vectorized */
  isVectorized: boolean;
  /** Vector entry IDs */
  vectorEntryIds: string[];
  /** User-provided tags */
  tags: string[];
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Image input for processing
 */
export interface IImageInput {
  /** File object */
  file: File;
  /** Processing mode */
  mode?: ImageProcessingMode;
  /** User-provided tags */
  tags?: string[];
}

/**
 * Image processing options
 */
export interface IImageProcessingOptions {
  /** Processing mode */
  mode: ImageProcessingMode;
  /** Generate thumbnail */
  generateThumbnail: boolean;
  /** Thumbnail max dimension */
  thumbnailSize: number;
  /** Auto-vectorize after processing */
  autoVectorize: boolean;
}

/**
 * Default processing options
 */
export const DEFAULT_PROCESSING_OPTIONS: IImageProcessingOptions = {
  mode: 'both',
  generateThumbnail: true,
  thumbnailSize: 200,
  autoVectorize: true,
};

/**
 * Processing progress
 */
export interface IImageProcessingProgress {
  /** Current stage */
  stage: 'reading' | 'resizing' | 'describing' | 'ocr' | 'vectorizing' | 'complete';
  /** Progress percentage */
  percent: number;
  /** Current image being processed */
  currentImage?: string;
  /** Total images */
  totalImages: number;
  /** Processed images */
  processedImages: number;
}

/**
 * Processing result
 */
export interface IImageProcessingResult {
  /** Whether processing was successful */
  success: boolean;
  /** Processed image */
  image: IProcessedImage | null;
  /** Error message */
  error?: string;
}

/**
 * Images state
 */
export interface IImagesState {
  /** All processed images */
  images: IProcessedImage[];
  /** Whether processing is in progress */
  isProcessing: boolean;
  /** Processing progress */
  progress: IImageProcessingProgress | null;
  /** Error message */
  error: string | null;
}

/**
 * Images context interface
 */
export interface IImagesContext extends IImagesState {
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
 * Supported image formats list
 */
export const SUPPORTED_IMAGE_FORMATS: SupportedImageFormat[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

/**
 * Maximum image size (10MB)
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Check if file is supported image
 */
export function isSupportedImage(file: File): boolean {
  return SUPPORTED_IMAGE_FORMATS.includes(file.type as SupportedImageFormat);
}
