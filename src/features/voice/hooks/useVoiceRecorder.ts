/**
 * useVoiceRecorder Hook
 * Handles voice recording using Web Audio API
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  RecordingState,
  IRecordingOptions,
  IVoiceNote,
} from '../types/voice.types';
import { DEFAULT_RECORDING_OPTIONS, MAX_RECORDING_DURATION } from '../types/voice.types';

/**
 * Return type for useVoiceRecorder hook
 */
export interface UseVoiceRecorderReturn {
  /** Current recording state */
  recordingState: RecordingState;
  /** Recording duration in seconds */
  duration: number;
  /** Audio level (0-1) for visualization */
  audioLevel: number;
  /** Error message */
  error: string | null;
  /** Start recording */
  startRecording: (options?: IRecordingOptions) => Promise<boolean>;
  /** Stop recording */
  stopRecording: () => Promise<IVoiceNote | null>;
  /** Pause recording */
  pauseRecording: () => void;
  /** Resume recording */
  resumeRecording: () => void;
  /** Cancel recording */
  cancelRecording: () => void;
  /** Check if microphone is available */
  isMicrophoneAvailable: () => Promise<boolean>;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Hook for voice recording
 * 
 * @returns Voice recorder state and controls
 */
export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const optionsRef = useRef<Required<IRecordingOptions>>(DEFAULT_RECORDING_OPTIONS);

  /**
   * Clean up resources
   */
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    audioChunksRef.current = [];
    setAudioLevel(0);
  }, []);

  /**
   * Update audio level for visualization
   */
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  /**
   * Check microphone availability
   */
  const isMicrophoneAvailable = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Start recording
   */
  const startRecording = useCallback(async (
    options: IRecordingOptions = {}
  ): Promise<boolean> => {
    if (recordingState !== 'idle') {
      return false;
    }

    setError(null);
    optionsRef.current = { ...DEFAULT_RECORDING_OPTIONS, ...options };

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: optionsRef.current.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      // Set up audio analyzer for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: optionsRef.current.format,
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second

      // Start timer
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000) - pausedDurationRef.current;
        setDuration(elapsed);

        // Stop if max duration reached
        if (elapsed >= MAX_RECORDING_DURATION) {
          stopRecording();
        }
      }, 100);

      // Start audio level updates
      updateAudioLevel();

      setRecordingState('recording');
      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      cleanup();
      return false;
    }
  }, [recordingState, cleanup, updateAudioLevel]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(async (): Promise<IVoiceNote | null> => {
    if (recordingState !== 'recording' && recordingState !== 'paused') {
      return null;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) {
        cleanup();
        setRecordingState('idle');
        setDuration(0);
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: optionsRef.current.format,
        });

        const audioUrl = URL.createObjectURL(audioBlob);

        const voiceNote: IVoiceNote = {
          id: generateId(),
          title: `Voice Note ${new Date().toLocaleString()}`,
          audioUrl,
          audioBlob,
          format: optionsRef.current.format,
          duration,
          size: audioBlob.size,
          transcription: null,
          isVectorized: false,
          vectorEntryIds: [],
          tags: [],
          createdAt: new Date(),
        };

        cleanup();
        setRecordingState('idle');
        setDuration(0);
        resolve(voiceNote);
      };

      mediaRecorder.stop();
    });
  }, [recordingState, duration, cleanup]);

  /**
   * Pause recording
   */
  const pauseRecording = useCallback(() => {
    if (recordingState !== 'recording' || !mediaRecorderRef.current) {
      return;
    }

    mediaRecorderRef.current.pause();
    pausedDurationRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setRecordingState('paused');
  }, [recordingState]);

  /**
   * Resume recording
   */
  const resumeRecording = useCallback(() => {
    if (recordingState !== 'paused' || !mediaRecorderRef.current) {
      return;
    }

    mediaRecorderRef.current.resume();
    startTimeRef.current = Date.now() - (pausedDurationRef.current * 1000);
    
    updateAudioLevel();
    
    setRecordingState('recording');
  }, [recordingState, updateAudioLevel]);

  /**
   * Cancel recording
   */
  const cancelRecording = useCallback(() => {
    cleanup();
    setRecordingState('idle');
    setDuration(0);
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    recordingState,
    duration,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    isMicrophoneAvailable,
  };
}

