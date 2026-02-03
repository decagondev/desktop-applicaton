/**
 * useVoiceNotes Hook
 * Manages voice notes with transcription and vectorization
 */

import { useState, useCallback } from 'react';
import type {
  IVoiceNote,
  ITranscriptionOptions,
} from '../types/voice.types';

/**
 * Options for useVoiceNotes hook
 */
export interface UseVoiceNotesOptions {
  /** Callback when note is transcribed */
  onTranscribed?: (note: IVoiceNote) => void;
  /** Callback when note is vectorized */
  onVectorized?: (note: IVoiceNote) => void;
}

/**
 * Return type for useVoiceNotes hook
 */
export interface UseVoiceNotesReturn {
  /** All voice notes */
  notes: IVoiceNote[];
  /** Whether transcription is in progress */
  isTranscribing: boolean;
  /** Error message */
  error: string | null;
  /** Add a voice note */
  addNote: (note: IVoiceNote) => void;
  /** Transcribe a voice note */
  transcribeNote: (id: string, options?: ITranscriptionOptions) => Promise<boolean>;
  /** Vectorize a voice note */
  vectorizeNote: (id: string) => Promise<boolean>;
  /** Delete a voice note */
  deleteNote: (id: string) => Promise<boolean>;
  /** Update note title */
  updateNoteTitle: (id: string, title: string) => Promise<boolean>;
  /** Update note tags */
  updateNoteTags: (id: string, tags: string[]) => Promise<boolean>;
  /** Clear error */
  clearError: () => void;
}

/**
 * Convert blob to base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Hook for managing voice notes
 * 
 * @param options - Configuration options
 * @returns Voice notes state and operations
 */
export function useVoiceNotes(options: UseVoiceNotesOptions = {}): UseVoiceNotesReturn {
  const { onTranscribed, onVectorized } = options;

  const [notes, setNotes] = useState<IVoiceNote[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add a voice note
   */
  const addNote = useCallback((note: IVoiceNote) => {
    setNotes(prev => [note, ...prev]);
  }, []);

  /**
   * Transcribe a voice note
   */
  const transcribeNote = useCallback(async (
    id: string,
    options: ITranscriptionOptions = {}
  ): Promise<boolean> => {
    const note = notes.find(n => n.id === id);
    if (!note) {
      setError('Voice note not found');
      return false;
    }

    setIsTranscribing(true);
    setError(null);

    try {
      // Convert audio to base64
      const audioBase64 = await blobToBase64(note.audioBlob);

      // Call Whisper API via IPC
      const result = await window.voiceAPI?.transcribe(
        audioBase64,
        note.format,
        options
      );

      if (!result?.text) {
        throw new Error('Transcription failed');
      }

      // Update note
      setNotes(prev => prev.map(n => {
        if (n.id === id) {
          const updated = { ...n, transcription: result.text };
          onTranscribed?.(updated);
          return updated;
        }
        return n;
      }));

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transcription failed';
      setError(message);
      return false;
    } finally {
      setIsTranscribing(false);
    }
  }, [notes, onTranscribed]);

  /**
   * Vectorize a voice note
   */
  const vectorizeNote = useCallback(async (id: string): Promise<boolean> => {
    const note = notes.find(n => n.id === id);
    if (!note) {
      setError('Voice note not found');
      return false;
    }

    if (!note.transcription) {
      setError('Note must be transcribed before vectorizing');
      return false;
    }

    setError(null);

    try {
      // Generate embedding
      const embeddingResult = await window.vectorStoreAPI?.generateEmbedding(note.transcription);
      if (!embeddingResult?.embedding) {
        throw new Error('Failed to generate embedding');
      }

      // Store in vector store
      const entry = await window.vectorStoreAPI?.addEntry({
        sourceType: 'voice',
        content: note.transcription,
        embedding: embeddingResult.embedding,
        metadata: {
          title: note.title,
          sourcePath: `voice://${note.id}`,
          duration: note.duration,
          format: note.format,
          wordCount: note.transcription.split(/\s+/).length,
          charCount: note.transcription.length,
        },
      });

      if (!entry?.id) {
        throw new Error('Failed to store vector');
      }

      // Update note
      setNotes(prev => prev.map(n => {
        if (n.id === id) {
          const updated = {
            ...n,
            isVectorized: true,
            vectorEntryIds: [...n.vectorEntryIds, entry.id],
          };
          onVectorized?.(updated);
          return updated;
        }
        return n;
      }));

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Vectorization failed';
      setError(message);
      return false;
    }
  }, [notes, onVectorized]);

  /**
   * Delete a voice note
   */
  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    try {
      const note = notes.find(n => n.id === id);
      if (note?.audioUrl) {
        URL.revokeObjectURL(note.audioUrl);
      }

      setNotes(prev => prev.filter(n => n.id !== id));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete note';
      setError(message);
      return false;
    }
  }, [notes]);

  /**
   * Update note title
   */
  const updateNoteTitle = useCallback(async (id: string, title: string): Promise<boolean> => {
    try {
      setNotes(prev => prev.map(n => {
        if (n.id === id) {
          return { ...n, title };
        }
        return n;
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update title';
      setError(message);
      return false;
    }
  }, []);

  /**
   * Update note tags
   */
  const updateNoteTags = useCallback(async (id: string, tags: string[]): Promise<boolean> => {
    try {
      setNotes(prev => prev.map(n => {
        if (n.id === id) {
          return { ...n, tags };
        }
        return n;
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update tags';
      setError(message);
      return false;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    notes,
    isTranscribing,
    error,
    addNote,
    transcribeNote,
    vectorizeNote,
    deleteNote,
    updateNoteTitle,
    updateNoteTags,
    clearError,
  };
}

export type { UseVoiceNotesOptions, UseVoiceNotesReturn };
