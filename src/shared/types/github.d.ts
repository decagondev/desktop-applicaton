/**
 * GitHub API type declarations
 * Defines the interface exposed by Electron preload for GitHub operations
 */

import type { ICloneOptions, IRepoFile } from '@features/github';

/**
 * Clone result from main process
 */
interface ICloneResultMain {
  success: boolean;
  localPath: string;
  description?: string;
  isPrivate?: boolean;
  stars?: number;
  language?: string;
  error?: string;
}

/**
 * GitHub API exposed via Electron preload
 */
interface IGitHubAPI {
  /** Clone a repository */
  cloneRepository: (
    owner: string,
    name: string,
    options?: ICloneOptions
  ) => Promise<ICloneResultMain | null>;

  /** Get files from cloned repository */
  getRepositoryFiles: (
    localPath: string,
    extensions: string[],
    excludePaths: string[],
    maxFileSize: number
  ) => Promise<IRepoFile[]>;

  /** Delete cloned repository */
  deleteRepository: (localPath: string) => Promise<boolean>;

  /** Check if GitHub token is configured */
  hasGitHubToken: () => Promise<boolean>;
}

declare global {
  interface Window {
    githubAPI?: IGitHubAPI;
  }
}

export type { IGitHubAPI, ICloneResultMain };
