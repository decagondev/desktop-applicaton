/**
 * useNotes Hook
 * Handles note CRUD operations and vectorization
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  INote,
  INoteInput,
  INotesFilter,
} from '../types/notes.types';
import { DEFAULT_NOTE_TEMPLATE } from '../types/notes.types';

/**
 * Options for useNotes hook
 */
export interface UseNotesOptions {
  /** Auto-save interval in ms (0 to disable) */
  autoSaveInterval?: number;
  /** Callback on note save */
  onSave?: (note: INote) => void;
}

/**
 * Return type for useNotes hook
 */
export interface UseNotesReturn {
  /** All notes */
  notes: INote[];
  /** Selected note */
  selectedNote: INote | null;
  /** Loading state */
  isLoading: boolean;
  /** Saving state */
  isSaving: boolean;
  /** Error message */
  error: string | null;
  /** Create a note */
  createNote: (input?: Partial<INoteInput>) => Promise<INote>;
  /** Update a note */
  updateNote: (id: string, input: Partial<INoteInput>) => Promise<INote | null>;
  /** Delete a note */
  deleteNote: (id: string) => Promise<boolean>;
  /** Select a note */
  selectNote: (id: string | null) => void;
  /** Vectorize a note */
  vectorizeNote: (id: string) => Promise<boolean>;
  /** Get all unique tags */
  allTags: string[];
  /** Filter notes */
  filterNotes: (filter: INotesFilter) => INote[];
  /** Clear error */
  clearError: () => void;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Hook for notes management
 * 
 * @param options - Configuration options
 * @returns Notes state and operations
 */
export function useNotes(options: UseNotesOptions = {}): UseNotesReturn {
  const { onSave } = options;

  const [notes, setNotes] = useState<INote[]>([]);
  const [selectedNote, setSelectedNote] = useState<INote | null>(null);
  const [isLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new note
   */
  const createNote = useCallback(async (
    input: Partial<INoteInput> = {}
  ): Promise<INote> => {
    setIsSaving(true);
    setError(null);

    try {
      const now = new Date();
      const note: INote = {
        id: generateId(),
        title: input.title ?? 'Untitled Note',
        content: input.content ?? DEFAULT_NOTE_TEMPLATE,
        tags: input.tags ?? [],
        isVectorized: false,
        vectorEntryIds: [],
        createdAt: now,
        updatedAt: now,
      };

      setNotes(prev => [note, ...prev]);
      setSelectedNote(note);
      onSave?.(note);

      return note;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create note';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  /**
   * Update a note
   */
  const updateNote = useCallback(async (
    id: string,
    input: Partial<INoteInput>
  ): Promise<INote | null> => {
    setIsSaving(true);
    setError(null);

    try {
      let updatedNote: INote | null = null;

      setNotes(prev => prev.map(note => {
        if (note.id === id) {
          updatedNote = {
            ...note,
            ...input,
            updatedAt: new Date(),
            isVectorized: false, // Mark as needing re-vectorization
          };
          return updatedNote;
        }
        return note;
      }));

      if (updatedNote) {
        if (selectedNote?.id === id) {
          setSelectedNote(updatedNote);
        }
        onSave?.(updatedNote);
      }

      return updatedNote;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update note';
      setError(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [selectedNote, onSave]);

  /**
   * Delete a note
   */
  const deleteNote = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      setNotes(prev => prev.filter(note => note.id !== id));
      
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete note';
      setError(message);
      return false;
    }
  }, [selectedNote]);

  /**
   * Select a note
   */
  const selectNote = useCallback((id: string | null) => {
    if (id === null) {
      setSelectedNote(null);
    } else {
      const note = notes.find(n => n.id === id);
      setSelectedNote(note ?? null);
    }
  }, [notes]);

  /**
   * Vectorize a note
   */
  const vectorizeNote = useCallback(async (id: string): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const note = notes.find(n => n.id === id);
      if (!note) {
        throw new Error('Note not found');
      }

      // Generate embedding
      const embeddingResult = await window.vectorStoreAPI?.generateEmbedding(note.content);
      if (!embeddingResult?.embedding) {
        throw new Error('Failed to generate embedding');
      }

      // Store in vector store
      const entry = await window.vectorStoreAPI?.addEntry({
        sourceType: 'note',
        content: note.content,
        embedding: embeddingResult.embedding,
        metadata: {
          title: note.title,
          sourcePath: `note://${note.id}`,
          tags: note.tags,
          wordCount: note.content.split(/\s+/).length,
          charCount: note.content.length,
        },
      });

      if (!entry?.id) {
        throw new Error('Failed to store vector');
      }

      // Update note
      setNotes(prev => prev.map(n => {
        if (n.id === id) {
          return {
            ...n,
            isVectorized: true,
            vectorEntryIds: [...n.vectorEntryIds, entry.id],
            updatedAt: new Date(),
          };
        }
        return n;
      }));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to vectorize note';
      setError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [notes]);

  /**
   * Get all unique tags
   */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const note of notes) {
      for (const tag of note.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [notes]);

  /**
   * Filter notes
   */
  const filterNotes = useCallback((filter: INotesFilter): INote[] => {
    let filtered = [...notes];

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(note =>
        filter.tags!.some(tag => note.tags.includes(tag))
      );
    }

    // Filter by search
    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search)
      );
    }

    // Sort
    const sortBy = filter.sortBy ?? 'updatedAt';
    const sortOrder = filter.sortOrder ?? 'desc';
    
    filtered.sort((a, b) => {
      let aVal: string | number | Date = a[sortBy];
      let bVal: string | number | Date = b[sortBy];

      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [notes]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    notes,
    selectedNote,
    isLoading,
    isSaving,
    error,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    vectorizeNote,
    allTags,
    filterNotes,
    clearError,
  };
}

