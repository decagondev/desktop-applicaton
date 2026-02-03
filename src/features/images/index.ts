/**
 * Images Feature
 * 
 * Provides multimodal image processing and vectorization for the Second Brain app.
 * 
 * @packageDocumentation
 */

// Components
export { ImageUploader } from './components/ImageUploader';
export { ImageGallery } from './components/ImageGallery';

// Hooks
export { useImages } from './hooks/useImages';
export type {
  UseImagesOptions,
  UseImagesReturn,
} from './hooks/useImages';

// Types
export type {
  SupportedImageFormat,
  ImageProcessingMode,
  IProcessedImage,
  IImageInput,
  IImageProcessingOptions,
  IImageProcessingProgress,
  IImageProcessingResult,
  IImagesState,
  IImagesContext,
} from './types/images.types';

export {
  SUPPORTED_IMAGE_FORMATS,
  MAX_IMAGE_SIZE,
  DEFAULT_PROCESSING_OPTIONS,
  isSupportedImage,
} from './types/images.types';
