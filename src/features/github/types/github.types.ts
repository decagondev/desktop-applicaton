/**
 * GitHub feature type definitions
 * Defines interfaces for GitHub repository cloning and vectorization
 */

/**
 * GitHub repository info
 */
export interface IGitHubRepo {
  /** Repository owner */
  owner: string;
  /** Repository name */
  name: string;
  /** Full name (owner/name) */
  fullName: string;
  /** Repository description */
  description: string | null;
  /** Default branch */
  defaultBranch: string;
  /** Clone URL */
  cloneUrl: string;
  /** Whether repo is private */
  isPrivate: boolean;
  /** Star count */
  stars: number;
  /** Primary language */
  language: string | null;
  /** Last updated */
  updatedAt: Date;
}

/**
 * Repository file
 */
export interface IRepoFile {
  /** File path relative to repo root */
  path: string;
  /** File name */
  name: string;
  /** File extension */
  extension: string;
  /** File content */
  content: string;
  /** File size in bytes */
  size: number;
  /** SHA hash */
  sha: string;
}

/**
 * Supported file extensions for vectorization
 */
export const SUPPORTED_CODE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx',
  '.py', '.rb', '.go', '.rs',
  '.java', '.kt', '.scala',
  '.c', '.cpp', '.h', '.hpp',
  '.cs', '.swift', '.m',
  '.md', '.mdx', '.txt',
  '.json', '.yaml', '.yml', '.toml',
  '.html', '.css', '.scss',
  '.sql', '.graphql',
  '.sh', '.bash', '.zsh',
  '.dockerfile', '.env.example',
] as const;

/**
 * Clone options
 */
export interface ICloneOptions {
  /** Branch to clone */
  branch?: string;
  /** Depth (shallow clone) */
  depth?: number;
  /** File extensions to include */
  includeExtensions?: string[];
  /** Paths to exclude */
  excludePaths?: string[];
  /** Max file size in bytes */
  maxFileSize?: number;
}

/**
 * Default clone options
 */
export const DEFAULT_CLONE_OPTIONS: Required<ICloneOptions> = {
  branch: 'main',
  depth: 1,
  includeExtensions: [...SUPPORTED_CODE_EXTENSIONS],
  excludePaths: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '__pycache__',
    '.venv',
    'vendor',
    '.idea',
    '.vscode',
  ],
  maxFileSize: 100 * 1024, // 100KB
};

/**
 * Clone progress
 */
export interface ICloneProgress {
  /** Current stage */
  stage: 'cloning' | 'scanning' | 'reading' | 'vectorizing' | 'complete';
  /** Progress percentage (0-100) */
  percent: number;
  /** Current file being processed */
  currentFile?: string;
  /** Total files found */
  totalFiles: number;
  /** Files processed */
  processedFiles: number;
  /** Files vectorized */
  vectorizedFiles: number;
}

/**
 * Clone result
 */
export interface ICloneResult {
  /** Whether clone was successful */
  success: boolean;
  /** Repository info */
  repo: IGitHubRepo | null;
  /** Files vectorized */
  filesVectorized: number;
  /** Total chunks created */
  chunksCreated: number;
  /** Error message if failed */
  error?: string;
  /** Vector entry IDs */
  vectorEntryIds: string[];
}

/**
 * GitHub state
 */
export interface IGitHubState {
  /** Cloned repositories */
  repositories: IGitHubRepo[];
  /** Currently cloning */
  isCloning: boolean;
  /** Clone progress */
  progress: ICloneProgress | null;
  /** Error message */
  error: string | null;
}

/**
 * GitHub context interface
 */
export interface IGitHubContext extends IGitHubState {
  /** Clone a repository */
  cloneRepository: (url: string, options?: ICloneOptions) => Promise<ICloneResult>;
  /** Remove a cloned repository */
  removeRepository: (fullName: string) => Promise<boolean>;
  /** Cancel current clone */
  cancelClone: () => void;
  /** Clear error */
  clearError: () => void;
}

/**
 * Parse GitHub URL
 */
export function parseGitHubUrl(url: string): { owner: string; name: string } | null {
  const patterns = [
    /github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i,
    /^([^/]+)\/([^/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], name: match[2] };
    }
  }

  return null;
}
