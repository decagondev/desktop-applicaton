/**
 * Voice Recorder Component
 * Recording interface with audio visualization
 */

import { memo, useCallback } from 'react';
import type { RecordingState } from '../types/voice.types';

/**
 * Props for VoiceRecorder component
 */
interface IVoiceRecorderProps {
  /** Recording state */
  recordingState: RecordingState;
  /** Recording duration in seconds */
  duration: number;
  /** Audio level (0-1) */
  audioLevel: number;
  /** Callback to start recording */
  onStart: () => void;
  /** Callback to stop recording */
  onStop: () => void;
  /** Callback to pause recording */
  onPause: () => void;
  /** Callback to resume recording */
  onResume: () => void;
  /** Callback to cancel recording */
  onCancel: () => void;
  /** Error message */
  error?: string | null;
  /** Optional CSS class */
  className?: string;
}

/**
 * Format duration as MM:SS
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Audio visualizer bars
 */
function AudioVisualizer({
  level,
  isActive,
}: {
  level: number;
  isActive: boolean;
}): React.ReactElement {
  const bars = 5;
  
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const barLevel = isActive ? Math.min(1, level * (1 + Math.random() * 0.5)) : 0.1;
        const height = Math.max(4, barLevel * 32);
        
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ${
              isActive ? 'bg-red-500' : 'bg-slate-600'
            }`}
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
}

/**
 * Voice recorder component
 */
function VoiceRecorderComponent({
  recordingState,
  duration,
  audioLevel,
  onStart,
  onStop,
  onPause,
  onResume,
  onCancel,
  error,
  className = '',
}: IVoiceRecorderProps): React.ReactElement {
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isIdle = recordingState === 'idle';

  const handleMainButton = useCallback(() => {
    if (isIdle) {
      onStart();
    } else if (isRecording) {
      onStop();
    } else if (isPaused) {
      onStop();
    }
  }, [isIdle, isRecording, isPaused, onStart, onStop]);

  return (
    <div className={`bg-slate-800 rounded-lg p-6 ${className}`}>
      {/* Error */}
      {error && (
        <div className="mb-4 p-2 bg-red-900/30 border border-red-900 rounded text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Visualizer */}
      <div className="flex justify-center mb-4">
        <AudioVisualizer level={audioLevel} isActive={isRecording} />
      </div>

      {/* Duration */}
      <div className="text-center mb-4">
        <span className={`text-3xl font-mono ${isRecording ? 'text-red-400' : 'text-slate-400'}`}>
          {formatDuration(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Cancel button (when recording/paused) */}
        {!isIdle && (
          <button
            onClick={onCancel}
            className="
              w-12 h-12 rounded-full
              bg-slate-700 text-slate-400
              hover:bg-slate-600 hover:text-white
              flex items-center justify-center
              transition-colors
            "
            title="Cancel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Main record/stop button */}
        <button
          onClick={handleMainButton}
          className={`
            w-16 h-16 rounded-full
            flex items-center justify-center
            transition-all
            ${isIdle 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-slate-700 hover:bg-slate-600 text-white'}
          `}
          title={isIdle ? 'Start recording' : 'Stop recording'}
        >
          {isIdle ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="6" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          )}
        </button>

        {/* Pause/Resume button (when recording) */}
        {(isRecording || isPaused) && (
          <button
            onClick={isPaused ? onResume : onPause}
            className="
              w-12 h-12 rounded-full
              bg-slate-700 text-slate-400
              hover:bg-slate-600 hover:text-white
              flex items-center justify-center
              transition-colors
            "
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-slate-500 mt-4">
        {isIdle && 'Click to start recording'}
        {isRecording && 'Recording... Click to stop'}
        {isPaused && 'Paused. Click to stop or resume'}
      </p>
    </div>
  );
}

export const VoiceRecorder = memo(VoiceRecorderComponent);
