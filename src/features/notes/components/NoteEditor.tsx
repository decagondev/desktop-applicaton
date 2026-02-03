/**
 * Note Editor Component
 * Markdown editor for notes with preview
 */

import { memo, useState, useCallback, useEffect } from 'react';
import type { INote, INoteInput } from '../types/notes.types';

/**
 * Props for NoteEditor component
 */
interface INoteEditorProps {
  /** Note to edit (null for new note) */
  note: INote | null;
  /** Callback when note is saved */
  onSave: (input: INoteInput) => void;
  /** Callback when vectorize is clicked */
  onVectorize?: () => void;
  /** Whether saving is in progress */
  isSaving?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Tag input component
 */
function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}): React.ReactElement {
  const [input, setInput] = useState('');

  const handleAdd = useCallback(() => {
    const tag = input.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
      setInput('');
    }
  }, [input, tags, onChange]);

  const handleRemove = useCallback((tag: string) => {
    onChange(tags.filter(t => t !== tag));
  }, [tags, onChange]);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm"
        >
          {tag}
          <button
            onClick={() => handleRemove(tag)}
            className="text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        }}
        placeholder="Add tag..."
        className="
          px-2 py-1 bg-transparent text-slate-300 text-sm
          border-none outline-none
          placeholder-slate-500
        "
      />
    </div>
  );
}

/**
 * Markdown note editor
 */
function NoteEditorComponent({
  note,
  onSave,
  onVectorize,
  isSaving = false,
  className = '',
}: INoteEditorProps): React.ReactElement {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [tags, setTags] = useState<string[]>(note?.tags ?? []);
  const [isDirty, setIsDirty] = useState(false);

  // Reset when note changes
  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setTags(note?.tags ?? []);
    setIsDirty(false);
  }, [note?.id]);

  /**
   * Handle save
   */
  const handleSave = useCallback(() => {
    onSave({ title, content, tags });
    setIsDirty(false);
  }, [title, content, tags, onSave]);

  /**
   * Mark as dirty on change
   */
  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    setIsDirty(true);
  }, []);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setIsDirty(true);
  }, []);

  const handleTagsChange = useCallback((value: string[]) => {
    setTags(value);
    setIsDirty(true);
  }, []);

  return (
    <div className={`flex flex-col h-full bg-slate-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <input
          type="text"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Note title..."
          className="
            flex-1 text-lg font-semibold
            bg-transparent text-slate-200
            border-none outline-none
            placeholder-slate-500
          "
        />
        <div className="flex items-center gap-2">
          {note && !note.isVectorized && onVectorize && (
            <button
              onClick={onVectorize}
              disabled={isSaving || isDirty}
              className="
                px-3 py-1.5 text-sm
                bg-green-600 text-white rounded-lg
                hover:bg-green-700
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              title={isDirty ? 'Save before vectorizing' : 'Add to knowledge base'}
            >
              Vectorize
            </button>
          )}
          {note?.isVectorized && (
            <span className="px-2 py-1 text-xs bg-green-900/50 text-green-400 rounded">
              In KB
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="
              px-4 py-1.5 text-sm font-medium
              bg-blue-600 text-white rounded-lg
              hover:bg-blue-700
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="px-4 py-2 border-b border-slate-800">
        <TagInput tags={tags} onChange={handleTagsChange} />
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 overflow-hidden">
        <textarea
          value={content}
          onChange={e => handleContentChange(e.target.value)}
          placeholder="Write your note in Markdown..."
          className="
            w-full h-full
            bg-slate-800 text-slate-200
            p-4 rounded-lg
            border border-slate-700
            focus:outline-none focus:border-blue-500
            resize-none
            font-mono text-sm
          "
        />
      </div>

      {/* Status bar */}
      <div className="px-4 py-2 border-t border-slate-800 text-xs text-slate-500">
        <span>{content.split(/\s+/).filter(w => w.length > 0).length} words</span>
        <span className="mx-2">•</span>
        <span>{content.length} characters</span>
        {isDirty && (
          <>
            <span className="mx-2">•</span>
            <span className="text-yellow-500">Unsaved changes</span>
          </>
        )}
      </div>
    </div>
  );
}

export const NoteEditor = memo(NoteEditorComponent);
