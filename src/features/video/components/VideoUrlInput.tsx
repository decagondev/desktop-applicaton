/**
 * Video URL Input Component
 * 
 * Input field for adding video URLs from YouTube, Vimeo, Loom, etc.
 * 
 * @packageDocumentation
 */

import { memo, useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { parseVideoUrl, type IVideoProcessingProgress } from '../types/video.types';

/**
 * Props for VideoUrlInput component
 */
interface IVideoUrlInputProps {
  /** Callback when URL is submitted */
  onSubmit: (url: string) => void;
  /** Whether processing is in progress */
  isProcessing: boolean;
  /** Current processing progress */
  progress: IVideoProcessingProgress | null;
}

/**
 * Platform icons/labels
 */
const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  loom: 'Loom',
  dailymotion: 'Dailymotion',
  twitch: 'Twitch',
};

/**
 * Video URL input component
 */
function VideoUrlInputComponent({
  onSubmit,
  isProcessing,
  progress,
}: IVideoUrlInputProps): React.ReactElement {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  /**
   * Handle URL change
   */
  const handleUrlChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setUrlError(null);
    
    if (newUrl.trim()) {
      const parsed = parseVideoUrl(newUrl);
      if (parsed) {
        setDetectedPlatform(PLATFORM_LABELS[parsed.platform] || parsed.platform);
      } else {
        setDetectedPlatform(null);
      }
    } else {
      setDetectedPlatform(null);
    }
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setUrlError('Please enter a video URL');
      return;
    }
    
    const parsed = parseVideoUrl(trimmedUrl);
    if (!parsed) {
      setUrlError('Unsupported video URL. Supported: YouTube, Vimeo, Loom, Dailymotion, Twitch');
      return;
    }
    
    onSubmit(trimmedUrl);
    setUrl('');
    setDetectedPlatform(null);
  }, [url, onSubmit]);

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-lg font-medium text-slate-200 mb-4">Add Video</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="video-url" className="block text-sm text-slate-400 mb-2">
            Video URL
          </label>
          <div className="relative">
            <input
              id="video-url"
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isProcessing}
              className={`
                w-full px-4 py-3 bg-slate-900 border rounded-lg
                text-slate-200 placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${urlError ? 'border-red-500' : 'border-slate-700'}
              `}
            />
            {detectedPlatform && !urlError && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 bg-blue-600 text-white rounded">
                {detectedPlatform}
              </span>
            )}
          </div>
          {urlError && (
            <p className="mt-1 text-sm text-red-400">{urlError}</p>
          )}
        </div>

        <div className="text-xs text-slate-500">
          <p className="mb-1">Supported platforms:</p>
          <div className="flex flex-wrap gap-2">
            {Object.values(PLATFORM_LABELS).map(platform => (
              <span
                key={platform}
                className="px-2 py-0.5 bg-slate-700 rounded text-slate-400"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !url.trim()}
          className={`
            w-full py-3 rounded-lg font-medium
            transition-colors
            ${isProcessing || !url.trim()
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'}
          `}
        >
          {isProcessing ? 'Processing...' : 'Add Video'}
        </button>
      </form>

      {progress && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{progress.message}</span>
            <span className="text-slate-500">{progress.progress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const VideoUrlInput = memo(VideoUrlInputComponent);
