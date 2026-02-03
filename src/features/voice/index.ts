/**
 * Voice Feature
 * 
 * Provides voice recording and transcription for the Second Brain app.
 * 
 * @packageDocumentation
 */

// Components
export { VoiceRecorder } from './components/VoiceRecorder';
export { VoiceNotesList } from './components/VoiceNotesList';

// Hooks
export { useVoiceRecorder } from './hooks/useVoiceRecorder';
export type { UseVoiceRecorderReturn } from './hooks/useVoiceRecorder';

export { useVoiceNotes } from './hooks/useVoiceNotes';
export type {
  UseVoiceNotesOptions,
  UseVoiceNotesReturn,
} from './hooks/useVoiceNotes';

// Types
export type {
  RecordingState,
  AudioFormat,
  IVoiceNote,
  IRecordingOptions,
  ITranscriptionOptions,
  ITranscriptionResult,
  ITranscriptionSegment,
  IVoiceState,
  IVoiceContext,
} from './types/voice.types';

export {
  DEFAULT_RECORDING_OPTIONS,
  MAX_RECORDING_DURATION,
  SUPPORTED_AUDIO_FORMATS,
} from './types/voice.types';
