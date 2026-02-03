/**
 * Upload Progress Component
 * Displays file upload progress
 */

import { memo } from 'react';
import type { IUploadProgress, IUploadResult, UploadStage } from '../types/ingestion.types';

/**
 * Props for UploadProgress component
 */
interface IUploadProgressProps {
  /** Current progress */
  progress: IUploadProgress | null;
  /** Completed results */
  results: IUploadResult[];
  /** Optional CSS class */
  className?: string;
}

/**
 * Stage display labels
 */
const STAGE_LABELS: Record<UploadStage, string> = {
  reading: 'Reading file',
  parsing: 'Parsing document',
  chunking: 'Creating chunks',
  embedding: 'Generating embeddings',
  storing: 'Storing vectors',
  complete: 'Complete',
  error: 'Error',
};

/**
 * Get stage color
 */
function getStageColor(stage: UploadStage): string {
  switch (stage) {
    case 'complete':
      return 'text-green-400';
    case 'error':
      return 'text-red-400';
    default:
      return 'text-blue-400';
  }
}

/**
 * Progress bar component
 */
function ProgressBar({ progress }: { progress: number }): React.ReactElement {
  return (
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/**
 * Single result item
 */
function ResultItem({ result }: { result: IUploadResult }): React.ReactElement {
  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg
      ${result.success ? 'bg-green-900/20' : 'bg-red-900/20'}
    `}>
      {result.success ? (
        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">
          {result.fileName}
        </p>
        {result.success ? (
          <p className="text-xs text-slate-400">
            {result.chunkCount} chunks created
          </p>
        ) : (
          <p className="text-xs text-red-400">
            {result.error}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Upload progress display component
 */
function UploadProgressComponent({
  progress,
  results,
  className = '',
}: IUploadProgressProps): React.ReactElement {
  if (!progress && results.length === 0) {
    return <></>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current progress */}
      {progress && (
        <div className="p-4 bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-200 truncate">
              {progress.fileName}
            </span>
            <span className={`text-xs ${getStageColor(progress.stage)}`}>
              {STAGE_LABELS[progress.stage]}
            </span>
          </div>
          
          <ProgressBar progress={progress.progress} />
          
          <p className="mt-2 text-xs text-slate-400">
            {progress.message}
          </p>
        </div>
      )}

      {/* Completed results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-300">
            Completed ({results.filter(r => r.success).length}/{results.length})
          </h3>
          {results.map((result, index) => (
            <ResultItem key={`${result.fileName}-${index}`} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}

export const UploadProgress = memo(UploadProgressComponent);
