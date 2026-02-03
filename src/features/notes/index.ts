/**
 * Notes Feature
 * 
 * Provides markdown note editing and vectorization for the Second Brain app.
 * 
 * @packageDocumentation
 */

// Components
export { NoteEditor } from './components/NoteEditor';
export { NotesList } from './components/NotesList';

// Hooks
export { useNotes } from './hooks/useNotes';
export type {
  UseNotesOptions,
  UseNotesReturn,
} from './hooks/useNotes';

// Types
export type {
  INote,
  INoteInput,
  INotesFilter,
  INotesState,
  INotesContext,
} from './types/notes.types';

export { DEFAULT_NOTE_TEMPLATE } from './types/notes.types';
