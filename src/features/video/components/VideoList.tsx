/**
 * Video List Component
 * 
 * Displays list of processed videos with their transcripts.
 * 
 * @packageDocumentation
 */

import { memo, useState, useCallback } from 'react';
import { type IProcessedVideo, formatDuration } from '../types/video.types';

/**
 * Props for VideoList component
 */
interface IVideoListProps {
  /** List of videos */
  videos: IProcessedVideo[];
  /** Callback to vectorize a video */
  onVectorize: (videoId: string) => void;
  /** Callback to delete a video */
  onDelete: (videoId: string) => void;
}

/**
 * Platform colors for badges
 */
const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'bg-red-600',
  vimeo: 'bg-cyan-600',
  loom: 'bg-purple-600',
  dailymotion: 'bg-blue-600',
  twitch: 'bg-violet-600',
  unknown: 'bg-slate-600',
};

/**
 * Single video card component
 */
interface IVideoCardProps {
  video: IProcessedVideo;
  onVectorize: (videoId: string) => void;
  onDelete: (videoId: string) => void;
}

function VideoCard({ video, onVectorize, onDelete }: IVideoCardProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleDelete = useCallback(() => {
    if (showDeleteConfirm) {
      onDelete(video.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  }, [showDeleteConfirm, onDelete, video.id]);

  const handleVectorize = useCallback(() => {
    onVectorize(video.id);
  }, [onVectorize, video.id]);

  const platformColor = PLATFORM_COLORS[video.metadata.platform] || PLATFORM_COLORS.unknown;

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden">
      <div className="flex gap-4 p-4">
        {video.metadata.thumbnailUrl ? (
          <img
            src={video.metadata.thumbnailUrl}
            alt={video.metadata.title}
            className="w-32 h-20 object-cover rounded"
          />
        ) : (
          <div className="w-32 h-20 bg-slate-700 rounded flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="text-slate-200 font-medium truncate flex-1">
              {video.metadata.title}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded ${platformColor} text-white capitalize`}>
              {video.metadata.platform}
            </span>
          </div>
          
          <p className="text-sm text-slate-400 mb-2">
            {video.metadata.author}
            {video.metadata.duration > 0 && (
              <span className="ml-2">• {formatDuration(video.metadata.duration)}</span>
            )}
          </p>

          <div className="flex items-center gap-2">
            {video.isVectorized ? (
              <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-400 rounded">
                Vectorized
              </span>
            ) : (
              <button
                onClick={handleVectorize}
                className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Vectorize
              </button>
            )}
            
            {video.transcript && (
              <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded">
                Transcript
              </span>
            )}
            
            <a
              href={video.metadata.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Open →
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleToggleExpand}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            onClick={handleDelete}
            className={`
              p-2 rounded transition-colors
              ${showDeleteConfirm
                ? 'bg-red-600 text-white'
                : 'text-slate-400 hover:text-red-400 hover:bg-slate-700'}
            `}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-700 p-4">
          {video.metadata.description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-300 mb-1">Description</h4>
              <p className="text-sm text-slate-400 whitespace-pre-wrap">
                {video.metadata.description}
              </p>
            </div>
          )}
          
          {video.transcript && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-1">
                Transcript
                {video.transcript.isAutoGenerated && (
                  <span className="ml-2 text-xs text-slate-500">(auto-generated)</span>
                )}
              </h4>
              <div className="max-h-64 overflow-y-auto bg-slate-900 rounded p-3">
                <p className="text-sm text-slate-400 whitespace-pre-wrap">
                  {video.transcript.fullText}
                </p>
              </div>
            </div>
          )}
          
          {video.metadata.tags.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-1">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {video.metadata.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Video list component
 */
function VideoListComponent({
  videos,
  onVectorize,
  onDelete,
}: IVideoListProps): React.ReactElement {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-slate-600 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p className="text-slate-400 mb-2">No videos yet</p>
        <p className="text-sm text-slate-500">
          Add a YouTube, Vimeo, or Loom video URL to get started
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-slate-200 mb-4">
        Videos ({videos.length})
      </h2>
      <div className="space-y-3">
        {videos.map(video => (
          <VideoCard
            key={video.id}
            video={video}
            onVectorize={onVectorize}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export const VideoList = memo(VideoListComponent);
