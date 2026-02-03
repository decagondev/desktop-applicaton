/**
 * GitHub Feature
 * 
 * Provides GitHub repository cloning and vectorization for the Second Brain app.
 * 
 * @packageDocumentation
 */

// Components
export { RepoCloneForm } from './components/RepoCloneForm';
export { RepoList } from './components/RepoList';

// Hooks
export { useGitHub } from './hooks/useGitHub';
export type {
  UseGitHubOptions,
  UseGitHubReturn,
} from './hooks/useGitHub';

// Types
export type {
  IGitHubRepo,
  IRepoFile,
  ICloneOptions,
  ICloneProgress,
  ICloneResult,
  IGitHubState,
  IGitHubContext,
} from './types/github.types';

export {
  SUPPORTED_CODE_EXTENSIONS,
  DEFAULT_CLONE_OPTIONS,
  parseGitHubUrl,
} from './types/github.types';
