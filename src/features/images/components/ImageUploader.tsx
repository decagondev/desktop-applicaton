/**
 * Image Uploader Component
 * Drag-and-drop image upload with preview
 */

import { memo, useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react';
import type { IImageInput, IImageProcessingProgress } from '../types/images.types';
import { SUPPORTED_IMAGE_FORMATS, MAX_IMAGE_SIZE, isSupportedImage } from '../types/images.types';

/**
 * Props for ImageUploader component
 */
interface IImageUploaderProps {
  /** Callback when images are selected */
  onUpload: (inputs: IImageInput[]) => void;
  /** Whether upload is in progress */
  isProcessing: boolean;
  /** Processing progress */
  progress: IImageProcessingProgress | null;
  /** Optional CSS class */
  className?: string;
}

/**
 * Progress display component
 */
function ProgressDisplay({
  progress,
}: {
  progress: IImageProcessingProgress;
}): React.ReactElement {
  const stageLabels: Record<IImageProcessingProgress['stage'], string> = {
    reading: 'Reading image...',
    resizing: 'Resizing...',
    describing: 'Generating description...',
    ocr: 'Extracting text...',
    vectorizing: 'Adding to knowledge base...',
    complete: 'Complete!',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{stageLabels[progress.stage]}</span>
        <span className="text-slate-400">{progress.percent}%</span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      {progress.currentImage && (
        <p className="text-xs text-slate-500 truncate">{progress.currentImage}</p>
      )}
      <p className="text-xs text-slate-400">
        {progress.processedImages} / {progress.totalImages} images processed
      </p>
    </div>
  );
}

/**
 * Image uploader component
 */
function ImageUploaderComponent({
  onUpload,
  isProcessing,
  progress,
  className = '',
}: IImageUploaderProps): React.ReactElement {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate and process files
   */
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    setValidationError(null);
    const inputs: IImageInput[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!isSupportedImage(file)) {
        errors.push(`${file.name}: Unsupported format`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: Too large (max 10MB)`);
        continue;
      }

      inputs.push({ file, mode: 'both' });
    }

    if (errors.length > 0) {
      setValidationError(errors.join(', '));
    }

    if (inputs.length > 0) {
      onUpload(inputs);
    }
  }, [onUpload]);

  /**
   * Handle drag events
   */
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleFiles]);

  /**
   * Trigger file input click
   */
  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  if (isProcessing && progress) {
    return (
      <div className={`bg-slate-800 rounded-lg p-6 ${className}`}>
        <ProgressDisplay progress={progress} />
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 cursor-pointer
          transition-colors text-center
          ${isDragOver 
            ? 'border-green-500 bg-green-500/10' 
            : 'border-slate-700 hover:border-slate-600 bg-slate-800'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={SUPPORTED_IMAGE_FORMATS.join(',')}
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        
        <svg className="mx-auto w-12 h-12 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        <p className="text-slate-300 font-medium">
          Drop images here or click to browse
        </p>
        <p className="text-sm text-slate-500 mt-1">
          JPEG, PNG, GIF, WebP up to 10MB
        </p>
      </div>

      {validationError && (
        <p className="mt-2 text-sm text-red-400">{validationError}</p>
      )}
    </div>
  );
}

export const ImageUploader = memo(ImageUploaderComponent);
