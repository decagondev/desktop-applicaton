/**
 * Ingestion feature type definitions
 * Defines interfaces for document parsing, chunking, and upload
 */

import type { IVectorMetadata } from '@features/vector-store';

/**
 * Supported MIME types for document ingestion
 */
export type SupportedMimeType =
  | 'application/pdf'
  | 'text/html'
  | 'text/markdown'
  | 'text/plain'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/**
 * File type based on extension
 */
export type FileType = 'pdf' | 'html' | 'markdown' | 'txt' | 'docx';

/**
 * Map from MIME type to file type
 */
export const MIME_TO_FILE_TYPE: Record<SupportedMimeType, FileType> = {
  'application/pdf': 'pdf',
  'text/html': 'html',
  'text/markdown': 'markdown',
  'text/plain': 'txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

/**
 * Map from file extension to MIME type
 */
export const EXTENSION_TO_MIME: Record<string, SupportedMimeType> = {
  '.pdf': 'application/pdf',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.txt': 'text/plain',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/**
 * Parsed document content
 */
export interface IParsedDocument {
  /** Extracted title (from metadata or first heading) */
  title: string;
  /** Full text content */
  content: string;
  /** Document metadata */
  metadata: IDocumentMetadata;
  /** Content chunks for embedding */
  chunks: IDocumentChunk[];
}

/**
 * Document metadata extracted during parsing
 */
export interface IDocumentMetadata {
  /** File name */
  fileName: string;
  /** MIME type */
  mimeType: SupportedMimeType;
  /** File size in bytes */
  fileSize: number;
  /** Number of pages (for PDF) */
  pageCount?: number;
  /** Author (if available) */
  author?: string;
  /** Creation date (if available) */
  createdAt?: Date;
  /** Language (detected or specified) */
  language?: string;
  /** Word count */
  wordCount: number;
  /** Character count */
  charCount: number;
}

/**
 * A chunk of document content for embedding
 */
export interface IDocumentChunk {
  /** Chunk index */
  index: number;
  /** Chunk content */
  content: string;
  /** Start position in original document */
  startOffset: number;
  /** End position in original document */
  endOffset: number;
  /** Word count */
  wordCount: number;
}

/**
 * Chunking configuration
 */
export interface IChunkConfig {
  /** Maximum chunk size in characters */
  maxChunkSize: number;
  /** Overlap between chunks in characters */
  overlapSize: number;
  /** Separators to use for splitting (in order of preference) */
  separators: string[];
}

/**
 * Default chunking configuration
 */
export const DEFAULT_CHUNK_CONFIG: IChunkConfig = {
  maxChunkSize: 1000,
  overlapSize: 200,
  separators: ['\n\n', '\n', '. ', ' '],
};

/**
 * Document parser interface (Interface Segregation)
 */
export interface IDocumentParser {
  /** File types this parser supports */
  supportedTypes: FileType[];
  
  /** Check if parser supports a MIME type */
  supports(mimeType: string): boolean;
  
  /** Parse document content */
  parse(content: ArrayBuffer | string, fileName: string): Promise<IParsedDocument>;
}

/**
 * Upload progress state
 */
export interface IUploadProgress {
  /** File being processed */
  fileName: string;
  /** Current stage */
  stage: UploadStage;
  /** Progress percentage (0-100) */
  progress: number;
  /** Status message */
  message: string;
}

/**
 * Upload processing stages
 */
export type UploadStage =
  | 'reading'
  | 'parsing'
  | 'chunking'
  | 'embedding'
  | 'storing'
  | 'complete'
  | 'error';

/**
 * Upload result
 */
export interface IUploadResult {
  /** Whether upload was successful */
  success: boolean;
  /** File name */
  fileName: string;
  /** Number of chunks created */
  chunkCount: number;
  /** Vector entry IDs created */
  entryIds: string[];
  /** Error message if failed */
  error?: string;
}

/**
 * File upload input
 */
export interface IFileUploadInput {
  /** File object */
  file: File;
  /** Optional custom metadata */
  customMetadata?: Partial<IVectorMetadata>;
  /** Optional chunk configuration */
  chunkConfig?: Partial<IChunkConfig>;
}

/**
 * Ingestion context state
 */
export interface IIngestionState {
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Current upload progress */
  progress: IUploadProgress | null;
  /** Recent upload results */
  recentResults: IUploadResult[];
  /** Error message if any */
  error: string | null;
}

/**
 * Ingestion context interface
 */
export interface IIngestionContext extends IIngestionState {
  /** Upload files */
  uploadFiles: (files: File[], options?: Partial<IChunkConfig>) => Promise<IUploadResult[]>;
  /** Cancel current upload */
  cancelUpload: () => void;
  /** Clear recent results */
  clearResults: () => void;
}

/**
 * Supported file extensions
 */
export const SUPPORTED_EXTENSIONS = ['.pdf', '.html', '.htm', '.md', '.markdown', '.txt', '.docx'];

/**
 * Maximum file size (50MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
