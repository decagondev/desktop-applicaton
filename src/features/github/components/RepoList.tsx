/**
 * Repository List Component
 * Displays cloned repositories
 */

import { memo } from 'react';
import type { IGitHubRepo } from '../types/github.types';

/**
 * Props for RepoList component
 */
interface IRepoListProps {
  /** Repositories to display */
  repositories: IGitHubRepo[];
  /** Callback when repository is removed */
  onRemove?: (fullName: string) => void;
  /** Optional CSS class */
  className?: string;
}

/**
 * Single repository item
 */
function RepoItem({
  repo,
  onRemove,
}: {
  repo: IGitHubRepo;
  onRemove?: () => void;
}): React.ReactElement {
  return (
    <div className="flex items-start justify-between p-3 bg-slate-800 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <a
            href={repo.cloneUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-400 hover:text-blue-300 truncate"
          >
            {repo.fullName}
          </a>
          {repo.isPrivate && (
            <span className="px-1.5 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">
              Private
            </span>
          )}
        </div>
        {repo.description && (
          <p className="mt-1 text-sm text-slate-400 line-clamp-2">
            {repo.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {repo.stars}
          </span>
          <span>{repo.defaultBranch}</span>
          <span>Updated {repo.updatedAt.toLocaleDateString()}</span>
        </div>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-2 p-1 text-slate-500 hover:text-red-400 transition-colors"
          title="Remove from knowledge base"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Repository list component
 */
function RepoListComponent({
  repositories,
  onRemove,
  className = '',
}: IRepoListProps): React.ReactElement {
  if (repositories.length === 0) {
    return (
      <div className={`text-center py-8 text-slate-500 ${className}`}>
        <svg className="mx-auto w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p>No repositories cloned yet</p>
        <p className="text-sm">Clone a GitHub repository to add it to your knowledge base</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-sm font-medium text-slate-400 mb-2">
        Cloned Repositories ({repositories.length})
      </h3>
      {repositories.map(repo => (
        <RepoItem
          key={repo.fullName}
          repo={repo}
          onRemove={onRemove ? () => onRemove(repo.fullName) : undefined}
        />
      ))}
    </div>
  );
}

export const RepoList = memo(RepoListComponent);
