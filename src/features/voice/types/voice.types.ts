/**
 * Voice feature type definitions
 * Defines interfaces for voice recording and transcription
 */

/**
 * Recording state
 */
export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

/**
 * Audio format
 */
export type AudioFormat = 'audio/webm' | 'audio/mp4' | 'audio/ogg' | 'audio/wav';

/**
 * Voice note
 */
export interface IVoiceNote {
  /** Unique identifier */
  id: string;
  /** Note title */
  title: string;
  /** Audio blob URL */
  audioUrl: string;
  /** Audio blob */
  audioBlob: Blob;
  /** Audio format */
  format: AudioFormat;
  /** Duration in seconds */
  duration: number;
  /** File size in bytes */
  size: number;
  /** Transcribed text */
  transcription: string | null;
  /** Whether note has been vectorized */
  isVectorized: boolean;
  /** Vector entry IDs */
  vectorEntryIds: string[];
  /** User-provided tags */
  tags: string[];
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Recording options
 */
export interface IRecordingOptions {
  /** Audio format */
  format?: AudioFormat;
  /** Sample rate */
  sampleRate?: number;
  /** Auto-transcribe after recording */
  autoTranscribe?: boolean;
  /** Auto-vectorize after transcription */
  autoVectorize?: boolean;
}

/**
 * Default recording options
 */
export const DEFAULT_RECORDING_OPTIONS: Required<IRecordingOptions> = {
  format: 'audio/webm',
  sampleRate: 16000,
  autoTranscribe: true,
  autoVectorize: true,
};

/**
 * Transcription options
 */
export interface ITranscriptionOptions {
  /** Language code (e.g., 'en', 'es') */
  language?: string;
  /** Include timestamps */
  timestamps?: boolean;
}

/**
 * Transcription result
 */
export interface ITranscriptionResult {
  /** Transcribed text */
  text: string;
  /** Language detected */
  language: string;
  /** Duration */
  duration: number;
  /** Segments with timestamps */
  segments?: ITranscriptionSegment[];
}

/**
 * Transcription segment
 */
export interface ITranscriptionSegment {
  /** Segment text */
  text: string;
  /** Start time in seconds */
  start: number;
  /** End time in seconds */
  end: number;
}

/**
 * Voice state
 */
export interface IVoiceState {
  /** All voice notes */
  notes: IVoiceNote[];
  /** Current recording state */
  recordingState: RecordingState;
  /** Current recording duration */
  recordingDuration: number;
  /** Whether transcription is in progress */
  isTranscribing: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Voice context interface
 */
export interface IVoiceContext extends IVoiceState {
  /** Start recording */
  startRecording: (options?: IRecordingOptions) => Promise<boolean>;
  /** Stop recording */
  stopRecording: () => Promise<IVoiceNote | null>;
  /** Pause recording */
  pauseRecording: () => void;
  /** Resume recording */
  resumeRecording: () => void;
  /** Transcribe a voice note */
  transcribeNote: (id: string, options?: ITranscriptionOptions) => Promise<boolean>;
  /** Vectorize a voice note */
  vectorizeNote: (id: string) => Promise<boolean>;
  /** Delete a voice note */
  deleteNote: (id: string) => Promise<boolean>;
  /** Update note title */
  updateNoteTitle: (id: string, title: string) => Promise<boolean>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Maximum recording duration (10 minutes)
 */
export const MAX_RECORDING_DURATION = 10 * 60;

/**
 * Supported audio formats for upload
 */
export const SUPPORTED_AUDIO_FORMATS: AudioFormat[] = [
  'audio/webm',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
];
