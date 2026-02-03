/**
 * Ingestion Feature
 * 
 * Provides document upload, parsing, and vectorization for the Second Brain app.
 * Supports PDF, HTML, Markdown, TXT, and DOCX files.
 * 
 * @packageDocumentation
 */

// Components
export { FileUploader } from './components/FileUploader';
export { UploadProgress } from './components/UploadProgress';

// Parsers
export { BaseDocumentParser } from './parsers/IDocumentParser';
export type { IDocumentParser } from './parsers/IDocumentParser';
export { MarkdownParser } from './parsers/MarkdownParser';
export { HtmlParser } from './parsers/HtmlParser';
export { ParserFactory } from './parsers/ParserFactory';

// Hooks
export { useFileIngestion } from './hooks/useFileIngestion';
export type {
  UseFileIngestionOptions,
  UseFileIngestionReturn,
} from './hooks/useFileIngestion';

// Types
export type {
  SupportedMimeType,
  FileType,
  IParsedDocument,
  IDocumentMetadata,
  IDocumentChunk,
  IChunkConfig,
  IUploadProgress,
  UploadStage,
  IUploadResult,
  IFileUploadInput,
  IIngestionState,
  IIngestionContext,
} from './types/ingestion.types';

export {
  MIME_TO_FILE_TYPE,
  EXTENSION_TO_MIME,
  DEFAULT_CHUNK_CONFIG,
  SUPPORTED_EXTENSIONS,
  MAX_FILE_SIZE,
} from './types/ingestion.types';
