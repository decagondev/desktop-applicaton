/**
 * API Key Form Component
 * Form for managing API keys with secure storage
 */

import { useState, useCallback, type FormEvent } from 'react';
import type { ApiKeyName } from '../types/settings.types';
import {
  API_KEY_LABELS,
  API_KEY_DESCRIPTIONS,
} from '../types/settings.types';

/**
 * Props for ApiKeyForm component
 */
interface IApiKeyFormProps {
  /** API key name */
  keyName: ApiKeyName;
  /** Whether the key is currently set */
  isSet: boolean;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Callback when key is saved */
  onSave: (key: ApiKeyName, value: string) => Promise<void>;
  /** Callback when key is removed */
  onRemove: (key: ApiKeyName) => Promise<void>;
  /** Optional CSS class */
  className?: string;
}

/**
 * Form for managing a single API key
 */
export function ApiKeyForm({
  keyName,
  isSet,
  disabled = false,
  onSave,
  onRemove,
  className = '',
}: IApiKeyFormProps): React.ReactElement {
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label = API_KEY_LABELS[keyName];
  const description = API_KEY_DESCRIPTIONS[keyName];

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!value.trim()) {
      setError('API key cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(keyName, value.trim());
      setValue('');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [keyName, value, onSave]);

  /**
   * Handle key removal
   */
  const handleRemove = useCallback(async () => {
    setError(null);
    setIsSaving(true);

    try {
      await onRemove(keyName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    } finally {
      setIsSaving(false);
    }
  }, [keyName, onRemove]);

  /**
   * Cancel editing
   */
  const handleCancel = useCallback(() => {
    setValue('');
    setIsEditing(false);
    setError(null);
  }, []);

  return (
    <div className={`p-4 bg-slate-800 rounded-lg ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium text-slate-200">{label}</h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {isSet && !isEditing && (
            <span className="px-2 py-1 text-xs bg-green-900/50 text-green-400 rounded">
              Configured
            </span>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="flex gap-2">
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${label} API key`}
              disabled={disabled || isSaving}
              className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded
                         text-slate-200 placeholder-slate-500
                         focus:outline-none focus:border-blue-500
                         disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={disabled || isSaving || !value.trim()}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded
                         hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium bg-slate-700 text-slate-300 rounded
                         hover:bg-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-400">{error}</p>
          )}
        </form>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium bg-slate-700 text-slate-300 rounded
                       hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSet ? 'Update' : 'Add'}
          </button>
          {isSet && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isSaving}
              className="px-4 py-2 text-sm font-medium bg-red-900/50 text-red-400 rounded
                         hover:bg-red-900/70 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Removing...' : 'Remove'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
