/**
 * useGitHub Hook
 * Handles GitHub repository cloning and vectorization
 */

import { useState, useCallback, useRef } from 'react';
import type {
  IGitHubRepo,
  ICloneOptions,
  ICloneProgress,
  ICloneResult,
} from '../types/github.types';
import { DEFAULT_CLONE_OPTIONS, parseGitHubUrl } from '../types/github.types';

/**
 * Options for useGitHub hook
 */
export interface UseGitHubOptions {
  /** Callback when clone starts */
  onCloneStart?: (url: string) => void;
  /** Callback when clone completes */
  onCloneComplete?: (result: ICloneResult) => void;
  /** Callback on progress update */
  onProgress?: (progress: ICloneProgress) => void;
}

/**
 * Return type for useGitHub hook
 */
export interface UseGitHubReturn {
  /** Cloned repositories */
  repositories: IGitHubRepo[];
  /** Whether cloning is in progress */
  isCloning: boolean;
  /** Clone progress */
  progress: ICloneProgress | null;
  /** Error message */
  error: string | null;
  /** Clone a repository */
  cloneRepository: (url: string, options?: ICloneOptions) => Promise<ICloneResult>;
  /** Remove a repository */
  removeRepository: (fullName: string) => Promise<boolean>;
  /** Cancel current clone */
  cancelClone: () => void;
  /** Clear error */
  clearError: () => void;
}

/**
 * Hook for GitHub repository operations
 * 
 * @param options - Configuration options
 * @returns GitHub state and operations
 */
export function useGitHub(options: UseGitHubOptions = {}): UseGitHubReturn {
  const { onCloneStart, onCloneComplete, onProgress } = options;

  const [repositories, setRepositories] = useState<IGitHubRepo[]>([]);
  const [isCloning, setIsCloning] = useState(false);
  const [progress, setProgress] = useState<ICloneProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Update progress
   */
  const updateProgress = useCallback((newProgress: ICloneProgress) => {
    setProgress(newProgress);
    onProgress?.(newProgress);
  }, [onProgress]);

  /**
   * Clone a repository
   */
  const cloneRepository = useCallback(async (
    url: string,
    options: ICloneOptions = {}
  ): Promise<ICloneResult> => {
    // Parse URL
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      const result: ICloneResult = {
        success: false,
        repo: null,
        filesVectorized: 0,
        chunksCreated: 0,
        vectorEntryIds: [],
        error: 'Invalid GitHub URL or repository format',
      };
      setError(result.error!);
      return result;
    }

    setIsCloning(true);
    setError(null);
    onCloneStart?.(url);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    const mergedOptions = {
      ...DEFAULT_CLONE_OPTIONS,
      ...options,
    };

    try {
      // Stage 1: Cloning
      updateProgress({
        stage: 'cloning',
        percent: 0,
        totalFiles: 0,
        processedFiles: 0,
        vectorizedFiles: 0,
      });

      // Call IPC to clone repository
      const cloneResult = await window.githubAPI?.cloneRepository(
        parsed.owner,
        parsed.name,
        mergedOptions
      );

      if (!cloneResult) {
        throw new Error('Failed to clone repository');
      }

      if (!cloneResult.success) {
        throw new Error(cloneResult.error ?? 'Clone failed');
      }

      // Stage 2: Scanning files
      updateProgress({
        stage: 'scanning',
        percent: 20,
        totalFiles: 0,
        processedFiles: 0,
        vectorizedFiles: 0,
      });

      const files = await window.githubAPI?.getRepositoryFiles(
        cloneResult.localPath,
        mergedOptions.includeExtensions,
        mergedOptions.excludePaths,
        mergedOptions.maxFileSize
      );

      if (!files || files.length === 0) {
        throw new Error('No supported files found in repository');
      }

      // Stage 3: Reading and vectorizing
      const vectorEntryIds: string[] = [];
      let chunksCreated = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        updateProgress({
          stage: 'vectorizing',
          percent: 20 + Math.floor((i / files.length) * 70),
          currentFile: file.path,
          totalFiles: files.length,
          processedFiles: i,
          vectorizedFiles: vectorEntryIds.length,
        });

        // Generate embedding
        const embeddingResult = await window.vectorStoreAPI?.generateEmbedding(file.content);
        if (!embeddingResult?.embedding) {
          continue;
        }

        // Store in vector store
        const entry = await window.vectorStoreAPI?.addEntry({
          sourceType: 'github',
          content: file.content,
          embedding: embeddingResult.embedding,
          metadata: {
            title: file.name,
            sourcePath: `github://${parsed.owner}/${parsed.name}/${file.path}`,
            repository: `${parsed.owner}/${parsed.name}`,
            filePath: file.path,
            fileExtension: file.extension,
            wordCount: file.content.split(/\s+/).length,
            charCount: file.content.length,
          },
        });

        if (entry?.id) {
          vectorEntryIds.push(entry.id);
          chunksCreated++;
        }
      }

      // Stage 4: Complete
      updateProgress({
        stage: 'complete',
        percent: 100,
        totalFiles: files.length,
        processedFiles: files.length,
        vectorizedFiles: vectorEntryIds.length,
      });

      const repo: IGitHubRepo = {
        owner: parsed.owner,
        name: parsed.name,
        fullName: `${parsed.owner}/${parsed.name}`,
        description: cloneResult.description ?? null,
        defaultBranch: mergedOptions.branch,
        cloneUrl: url,
        isPrivate: cloneResult.isPrivate ?? false,
        stars: cloneResult.stars ?? 0,
        language: cloneResult.language ?? null,
        updatedAt: new Date(),
      };

      setRepositories(prev => [repo, ...prev.filter(r => r.fullName !== repo.fullName)]);

      const result: ICloneResult = {
        success: true,
        repo,
        filesVectorized: vectorEntryIds.length,
        chunksCreated,
        vectorEntryIds,
      };

      onCloneComplete?.(result);
      return result;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clone repository';
      setError(message);

      const result: ICloneResult = {
        success: false,
        repo: null,
        filesVectorized: 0,
        chunksCreated: 0,
        vectorEntryIds: [],
        error: message,
      };

      onCloneComplete?.(result);
      return result;

    } finally {
      setIsCloning(false);
      abortControllerRef.current = null;
    }
  }, [onCloneStart, onCloneComplete, updateProgress]);

  /**
   * Remove a repository
   */
  const removeRepository = useCallback(async (fullName: string): Promise<boolean> => {
    try {
      // Remove from local list
      setRepositories(prev => prev.filter(r => r.fullName !== fullName));

      // TODO: Also remove vector entries for this repository
      // This would require tracking vector entry IDs per repository

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove repository';
      setError(message);
      return false;
    }
  }, []);

  /**
   * Cancel current clone
   */
  const cancelClone = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsCloning(false);
    setProgress(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    repositories,
    isCloning,
    progress,
    error,
    cloneRepository,
    removeRepository,
    cancelClone,
    clearError,
  };
}

