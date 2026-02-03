/**
 * Video Feature
 * 
 * Provides video transcript extraction and vectorization for the Second Brain app.
 * Supports YouTube, Vimeo, Loom, and other video platforms.
 * 
 * @packageDocumentation
 */

// Components
export { VideoUrlInput } from './components/VideoUrlInput';
export { VideoList } from './components/VideoList';

// Hooks
export { useVideos } from './hooks/useVideos';
export type {
  UseVideosOptions,
  UseVideosReturn,
} from './hooks/useVideos';

// Types
export type {
  VideoPlatform,
  ITranscriptSegment,
  IVideoTranscript,
  IVideoMetadata,
  IProcessedVideo,
  VideoProcessingStatus,
  IVideoProcessingProgress,
  IVideoProcessingOptions,
  IVideoState,
  IVideoContext,
} from './types/video.types';

export {
  DEFAULT_VIDEO_OPTIONS,
  PLATFORM_PATTERNS,
  parseVideoUrl,
  formatDuration,
} from './types/video.types';
