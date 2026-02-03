/**
 * Notes feature type definitions
 * Defines interfaces for markdown notes and editing
 */

/**
 * A single note
 */
export interface INote {
  /** Unique identifier */
  id: string;
  /** Note title */
  title: string;
  /** Markdown content */
  content: string;
  /** Tags for organization */
  tags: string[];
  /** Whether note has been vectorized */
  isVectorized: boolean;
  /** Vector entry IDs if vectorized */
  vectorEntryIds: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Input for creating a new note
 */
export interface INoteInput {
  /** Note title */
  title: string;
  /** Markdown content */
  content: string;
  /** Tags */
  tags?: string[];
}

/**
 * Notes list filter options
 */
export interface INotesFilter {
  /** Filter by tags */
  tags?: string[];
  /** Search query */
  search?: string;
  /** Sort field */
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Notes state
 */
export interface INotesState {
  /** All notes */
  notes: INote[];
  /** Currently selected note */
  selectedNote: INote | null;
  /** Whether notes are loading */
  isLoading: boolean;
  /** Whether a note is being saved */
  isSaving: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Notes context interface
 */
export interface INotesContext extends INotesState {
  /** Create a new note */
  createNote: (input: INoteInput) => Promise<INote>;
  /** Update an existing note */
  updateNote: (id: string, input: Partial<INoteInput>) => Promise<INote | null>;
  /** Delete a note */
  deleteNote: (id: string) => Promise<boolean>;
  /** Select a note for editing */
  selectNote: (id: string | null) => void;
  /** Vectorize a note */
  vectorizeNote: (id: string) => Promise<boolean>;
  /** Get all tags */
  getAllTags: () => string[];
  /** Filter notes */
  filterNotes: (filter: INotesFilter) => INote[];
}

/**
 * Default note content template
 */
export const DEFAULT_NOTE_TEMPLATE = `# New Note

Write your thoughts here...

## Key Points

- Point 1
- Point 2

## References

`;
