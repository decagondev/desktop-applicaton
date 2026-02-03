/**
 * Voice Notes List Component
 * Displays recorded voice notes with playback and transcription
 */

import { memo, useState, useRef } from 'react';
import type { IVoiceNote } from '../types/voice.types';

/**
 * Props for VoiceNotesList component
 */
interface IVoiceNotesListProps {
  /** Voice notes to display */
  notes: IVoiceNote[];
  /** Whether transcription is in progress */
  isTranscribing: boolean;
  /** Callback to transcribe a note */
  onTranscribe?: (id: string) => void;
  /** Callback to vectorize a note */
  onVectorize?: (id: string) => void;
  /** Callback to delete a note */
  onDelete?: (id: string) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Format duration as MM:SS
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Single voice note item
 */
function VoiceNoteItem({
  note,
  isTranscribing,
  onTranscribe,
  onVectorize,
  onDelete,
}: {
  note: IVoiceNote;
  isTranscribing: boolean;
  onTranscribe?: () => void;
  onVectorize?: () => void;
  onDelete?: () => void;
}): React.ReactElement {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4">
      <audio
        ref={audioRef}
        src={note.audioUrl}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-200 truncate">{note.title}</h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>{formatDuration(note.duration)}</span>
            <span>•</span>
            <span>{note.createdAt.toLocaleString()}</span>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1">
          {note.transcription && (
            <span className="px-1.5 py-0.5 text-xs bg-purple-900 text-purple-300 rounded">
              Transcribed
            </span>
          )}
          {note.isVectorized && (
            <span className="px-1.5 py-0.5 text-xs bg-green-900 text-green-300 rounded">
              In KB
            </span>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={togglePlay}
          className="
            w-10 h-10 rounded-full
            bg-blue-600 text-white
            hover:bg-blue-700
            flex items-center justify-center
          "
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Actions */}
        <div className="flex-1 flex items-center gap-2">
          {!note.transcription && onTranscribe && (
            <button
              onClick={onTranscribe}
              disabled={isTranscribing}
              className="
                px-2 py-1 text-xs
                bg-purple-600 text-white rounded
                hover:bg-purple-700
                disabled:opacity-50
              "
            >
              {isTranscribing ? 'Transcribing...' : 'Transcribe'}
            </button>
          )}
          {note.transcription && !note.isVectorized && onVectorize && (
            <button
              onClick={onVectorize}
              className="
                px-2 py-1 text-xs
                bg-green-600 text-white rounded
                hover:bg-green-700
              "
            >
              Vectorize
            </button>
          )}
          {note.transcription && (
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="
                px-2 py-1 text-xs
                bg-slate-700 text-slate-300 rounded
                hover:bg-slate-600
              "
            >
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </button>
          )}
        </div>

        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 text-slate-500 hover:text-red-400"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Transcript */}
      {showTranscript && note.transcription && (
        <div className="mt-3 p-3 bg-slate-900 rounded text-sm text-slate-300">
          {note.transcription}
        </div>
      )}
    </div>
  );
}

/**
 * Voice notes list component
 */
function VoiceNotesListComponent({
  notes,
  isTranscribing,
  onTranscribe,
  onVectorize,
  onDelete,
  className = '',
}: IVoiceNotesListProps): React.ReactElement {
  if (notes.length === 0) {
    return (
      <div className={`text-center py-8 text-slate-500 ${className}`}>
        <svg className="mx-auto w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <p>No voice notes yet</p>
        <p className="text-sm">Record a voice note to get started</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {notes.map(note => (
        <VoiceNoteItem
          key={note.id}
          note={note}
          isTranscribing={isTranscribing}
          onTranscribe={onTranscribe ? () => onTranscribe(note.id) : undefined}
          onVectorize={onVectorize ? () => onVectorize(note.id) : undefined}
          onDelete={onDelete ? () => onDelete(note.id) : undefined}
        />
      ))}
    </div>
  );
}

export const VoiceNotesList = memo(VoiceNotesListComponent);
