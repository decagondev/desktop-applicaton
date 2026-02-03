/**
 * Repository Clone Form Component
 * Form for cloning GitHub repositories
 */

import { memo, useState, useCallback, type FormEvent } from 'react';
import type { ICloneOptions, ICloneProgress } from '../types/github.types';
import { parseGitHubUrl, SUPPORTED_CODE_EXTENSIONS } from '../types/github.types';

/**
 * Props for RepoCloneForm component
 */
interface IRepoCloneFormProps {
  /** Callback when clone is submitted */
  onClone: (url: string, options?: ICloneOptions) => void;
  /** Whether cloning is in progress */
  isCloning: boolean;
  /** Clone progress */
  progress: ICloneProgress | null;
  /** Callback to cancel clone */
  onCancel?: () => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Progress bar component
 */
function ProgressBar({
  progress,
}: {
  progress: ICloneProgress;
}): React.ReactElement {
  const stageLabels: Record<ICloneProgress['stage'], string> = {
    cloning: 'Cloning repository...',
    scanning: 'Scanning files...',
    reading: 'Reading files...',
    vectorizing: 'Vectorizing content...',
    complete: 'Complete!',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">{stageLabels[progress.stage]}</span>
        <span className="text-slate-400">{progress.percent}%</span>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      {progress.currentFile && (
        <p className="text-xs text-slate-500 truncate">
          {progress.currentFile}
        </p>
      )}
      <p className="text-xs text-slate-400">
        {progress.vectorizedFiles} / {progress.totalFiles} files vectorized
      </p>
    </div>
  );
}

/**
 * Repository clone form
 */
function RepoCloneFormComponent({
  onClone,
  isCloning,
  progress,
  onCancel,
  className = '',
}: IRepoCloneFormProps): React.ReactElement {
  const [url, setUrl] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [branch, setBranch] = useState('main');
  const [depth, setDepth] = useState(1);
  const [urlError, setUrlError] = useState<string | null>(null);

  /**
   * Validate URL on change
   */
  const handleUrlChange = useCallback((value: string) => {
    setUrl(value);
    if (value) {
      const parsed = parseGitHubUrl(value);
      setUrlError(parsed ? null : 'Invalid GitHub URL format');
    } else {
      setUrlError(null);
    }
  }, []);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (!url || urlError || isCloning) return;

    const options: ICloneOptions = {
      branch,
      depth,
    };

    onClone(url, options);
  }, [url, urlError, isCloning, branch, depth, onClone]);

  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-medium text-slate-200 mb-4">
        Clone GitHub Repository
      </h3>

      {isCloning && progress ? (
        <div className="space-y-4">
          <ProgressBar progress={progress} />
          {onCancel && progress.stage !== 'complete' && (
            <button
              onClick={onCancel}
              className="
                w-full px-4 py-2 text-sm
                bg-red-600 text-white rounded-lg
                hover:bg-red-700
              "
            >
              Cancel
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Repository URL or owner/name
            </label>
            <input
              type="text"
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://github.com/owner/repo or owner/repo"
              className={`
                w-full px-3 py-2
                bg-slate-700 border rounded-lg
                text-slate-200 placeholder-slate-500
                focus:outline-none focus:border-blue-500
                ${urlError ? 'border-red-500' : 'border-slate-600'}
              `}
            />
            {urlError && (
              <p className="mt-1 text-xs text-red-400">{urlError}</p>
            )}
          </div>

          {/* Options toggle */}
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showOptions ? '- Hide options' : '+ Show options'}
          </button>

          {/* Options */}
          {showOptions && (
            <div className="space-y-3 pl-4 border-l-2 border-slate-700">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="
                    w-full px-3 py-2
                    bg-slate-700 border border-slate-600 rounded-lg
                    text-slate-200
                    focus:outline-none focus:border-blue-500
                  "
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Clone depth
                </label>
                <input
                  type="number"
                  value={depth}
                  onChange={e => setDepth(parseInt(e.target.value) || 1)}
                  min={1}
                  max={100}
                  className="
                    w-24 px-3 py-2
                    bg-slate-700 border border-slate-600 rounded-lg
                    text-slate-200
                    focus:outline-none focus:border-blue-500
                  "
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Supported extensions
                </label>
                <p className="text-xs text-slate-500">
                  {SUPPORTED_CODE_EXTENSIONS.slice(0, 10).join(', ')}...
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!url || !!urlError || isCloning}
            className="
              w-full px-4 py-2 font-medium
              bg-blue-600 text-white rounded-lg
              hover:bg-blue-700
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Clone & Vectorize
          </button>
        </form>
      )}
    </div>
  );
}

export const RepoCloneForm = memo(RepoCloneFormComponent);
