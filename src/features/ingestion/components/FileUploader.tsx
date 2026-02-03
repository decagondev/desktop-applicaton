/**
 * File Uploader Component
 * Drag and drop file upload interface
 */

import { memo, useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react';
import { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE } from '../types/ingestion.types';

/**
 * Props for FileUploader component
 */
interface IFileUploaderProps {
  /** Callback when files are selected */
  onFilesSelected: (files: File[]) => void;
  /** Whether upload is disabled */
  disabled?: boolean;
  /** Allow multiple files */
  multiple?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * File upload dropzone component
 */
function FileUploaderComponent({
  onFilesSelected,
  disabled = false,
  multiple = true,
  className = '',
}: IFileUploaderProps): React.ReactElement {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Filter valid files
   */
  const filterValidFiles = useCallback((files: FileList | null): File[] => {
    if (!files) return [];

    return Array.from(files).filter(file => {
      const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
      return ext && SUPPORTED_EXTENSIONS.includes(ext) && file.size <= MAX_FILE_SIZE;
    });
  }, []);

  /**
   * Handle drag enter
   */
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * Handle drop
   */
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = filterValidFiles(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesSelected(multiple ? files : [files[0]]);
    }
  }, [disabled, multiple, filterValidFiles, onFilesSelected]);

  /**
   * Handle file input change
   */
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = filterValidFiles(e.target.files);
    if (files.length > 0) {
      onFilesSelected(multiple ? files : [files[0]]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [multiple, filterValidFiles, onFilesSelected]);

  /**
   * Open file dialog
   */
  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  /**
   * Handle keyboard activation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const acceptTypes = SUPPORTED_EXTENSIONS.join(',');

  return (
    <div
      className={`
        relative p-8 border-2 border-dashed rounded-lg
        transition-colors cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 hover:border-slate-500'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p className="mt-4 text-sm text-slate-300">
          {isDragging ? (
            'Drop files here'
          ) : (
            <>
              <span className="font-semibold text-blue-400">Click to upload</span>
              {' or drag and drop'}
            </>
          )}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          {SUPPORTED_EXTENSIONS.map(ext => ext.replace('.', '').toUpperCase()).join(', ')}
          {' '}up to {MAX_FILE_SIZE / 1024 / 1024}MB
        </p>
      </div>
    </div>
  );
}

export const FileUploader = memo(FileUploaderComponent);
