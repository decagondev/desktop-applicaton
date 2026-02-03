/**
 * Image Gallery Component
 * Displays processed images with details
 */

import { memo, useState } from 'react';
import type { IProcessedImage } from '../types/images.types';

/**
 * Props for ImageGallery component
 */
interface IImageGalleryProps {
  /** Images to display */
  images: IProcessedImage[];
  /** Callback when image is deleted */
  onDelete?: (id: string) => void;
  /** Callback when image is vectorized */
  onVectorize?: (id: string) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Single image card
 */
function ImageCard({
  image,
  onDelete,
  onVectorize,
  onSelect,
}: {
  image: IProcessedImage;
  onDelete?: () => void;
  onVectorize?: () => void;
  onSelect: () => void;
}): React.ReactElement {
  return (
    <div className="group relative bg-slate-800 rounded-lg overflow-hidden">
      {/* Image */}
      <button
        onClick={onSelect}
        className="w-full aspect-square"
      >
        <img
          src={`data:${image.mimeType};base64,${image.base64Data}`}
          alt={image.filename}
          className="w-full h-full object-cover"
        />
      </button>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-sm text-white truncate">{image.filename}</p>
          <div className="flex items-center gap-2 mt-1">
            {image.isVectorized ? (
              <span className="px-1.5 py-0.5 text-xs bg-green-600 text-white rounded">
                In KB
              </span>
            ) : onVectorize && (
              <button
                onClick={(e) => { e.stopPropagation(); onVectorize(); }}
                className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Vectorize
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {image.description && (
          <span className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center" title="Has AI description">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </span>
        )}
        {image.ocrText && (
          <span className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center" title="Has OCR text">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Image detail modal
 */
function ImageDetailModal({
  image,
  onClose,
}: {
  image: IProcessedImage;
  onClose: () => void;
}): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="max-w-4xl max-h-[90vh] bg-slate-900 rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex">
          {/* Image */}
          <div className="flex-shrink-0 max-w-[50%]">
            <img
              src={`data:${image.mimeType};base64,${image.base64Data}`}
              alt={image.filename}
              className="max-h-[80vh] object-contain"
            />
          </div>

          {/* Details */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-slate-200">{image.filename}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Dimensions</dt>
                <dd className="text-slate-300">{image.width} × {image.height}px</dd>
              </div>
              <div>
                <dt className="text-slate-500">Size</dt>
                <dd className="text-slate-300">{(image.size / 1024).toFixed(1)} KB</dd>
              </div>
              <div>
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-300">{image.createdAt.toLocaleString()}</dd>
              </div>
              {image.tags.length > 0 && (
                <div>
                  <dt className="text-slate-500">Tags</dt>
                  <dd className="flex flex-wrap gap-1 mt-1">
                    {image.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {image.description && (
                <div>
                  <dt className="text-slate-500">AI Description</dt>
                  <dd className="text-slate-300 mt-1">{image.description}</dd>
                </div>
              )}
              {image.ocrText && (
                <div>
                  <dt className="text-slate-500">OCR Text</dt>
                  <dd className="text-slate-300 mt-1 whitespace-pre-wrap font-mono text-xs bg-slate-800 p-2 rounded">
                    {image.ocrText}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Image gallery component
 */
function ImageGalleryComponent({
  images,
  onDelete,
  onVectorize,
  className = '',
}: IImageGalleryProps): React.ReactElement {
  const [selectedImage, setSelectedImage] = useState<IProcessedImage | null>(null);

  if (images.length === 0) {
    return (
      <div className={`text-center py-8 text-slate-500 ${className}`}>
        <svg className="mx-auto w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>No images yet</p>
        <p className="text-sm">Upload images to add them to your knowledge base</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
        {images.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            onDelete={onDelete ? () => onDelete(image.id) : undefined}
            onVectorize={onVectorize ? () => onVectorize(image.id) : undefined}
            onSelect={() => setSelectedImage(image)}
          />
        ))}
      </div>

      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}

export const ImageGallery = memo(ImageGalleryComponent);
