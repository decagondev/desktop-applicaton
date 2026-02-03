/**
 * Notes List Component
 * Displays list of notes with search and filter
 */

import { memo, useState, useMemo } from 'react';
import type { INote, INotesFilter } from '../types/notes.types';

/**
 * Props for NotesList component
 */
interface INotesListProps {
  /** Notes to display */
  notes: INote[];
  /** Selected note ID */
  selectedId: string | null;
  /** Callback when note is selected */
  onSelect: (id: string) => void;
  /** Callback when new note is clicked */
  onNew: () => void;
  /** Available tags for filtering */
  availableTags?: string[];
  /** Filter notes function */
  filterNotes?: (filter: INotesFilter) => INote[];
  /** Optional CSS class */
  className?: string;
}

/**
 * Single note item
 */
function NoteItem({
  note,
  isSelected,
  onSelect,
}: {
  note: INote;
  isSelected: boolean;
  onSelect: () => void;
}): React.ReactElement {
  const preview = note.content
    .replace(/^#.*$/gm, '') // Remove headings
    .replace(/\n+/g, ' ')   // Replace newlines with spaces
    .trim()
    .slice(0, 100);

  return (
    <button
      onClick={onSelect}
      className={`
        w-full p-3 text-left rounded-lg transition-colors
        ${isSelected 
          ? 'bg-blue-900/50 border border-blue-800' 
          : 'bg-slate-800 hover:bg-slate-750 border border-transparent'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-200 truncate">
          {note.title || 'Untitled'}
        </h3>
        {note.isVectorized && (
          <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" title="In knowledge base" />
        )}
      </div>
      <p className="mt-1 text-sm text-slate-400 line-clamp-2">
        {preview || 'Empty note'}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-slate-500">
          {note.updatedAt.toLocaleDateString()}
        </span>
        {note.tags.length > 0 && (
          <div className="flex gap-1">
            {note.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">
                {tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-xs text-slate-500">+{note.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

/**
 * Notes list component
 */
function NotesListComponent({
  notes,
  selectedId,
  onSelect,
  onNew,
  availableTags = [],
  filterNotes,
  className = '',
}: INotesListProps): React.ReactElement {
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Apply filters
  const filteredNotes = useMemo(() => {
    if (filterNotes) {
      return filterNotes({
        search: search || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
    }
    return notes;
  }, [notes, search, selectedTags, filterNotes]);

  return (
    <div className={`flex flex-col h-full bg-slate-900 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-200">Notes</h2>
          <button
            onClick={onNew}
            className="
              px-3 py-1.5 text-sm
              bg-blue-600 text-white rounded-lg
              hover:bg-blue-700
            "
          >
            + New
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="
            w-full px-3 py-2 text-sm
            bg-slate-800 border border-slate-700 rounded-lg
            text-slate-200 placeholder-slate-500
            focus:outline-none focus:border-blue-500
          "
        />

        {/* Tag filter */}
        {availableTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {availableTags.slice(0, 5).map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
                className={`
                  px-2 py-0.5 text-xs rounded
                  ${selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            {search || selectedTags.length > 0
              ? 'No matching notes'
              : 'No notes yet'}
          </div>
        ) : (
          filteredNotes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedId}
              onSelect={() => onSelect(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export const NotesList = memo(NotesListComponent);
