/**
 * Document Parser Interface
 * Base interface for all document parsers (Interface Segregation Principle)
 */

import type {
  IDocumentParser,
  IParsedDocument,
  FileType,
} from '../types/ingestion.types';

/**
 * Abstract base class for document parsers
 * Provides common functionality for all parsers
 */
export abstract class BaseDocumentParser implements IDocumentParser {
  abstract readonly supportedTypes: FileType[];

  /**
   * Check if this parser supports the given MIME type
   * @param mimeType - MIME type to check
   * @returns True if supported
   */
  abstract supports(mimeType: string): boolean;

  /**
   * Parse document content
   * @param content - File content as ArrayBuffer or string
   * @param fileName - Original file name
   * @returns Parsed document
   */
  abstract parse(content: ArrayBuffer | string, fileName: string): Promise<IParsedDocument>;

  /**
   * Extract title from content
   * @param content - Document content
   * @param fileName - File name as fallback
   * @returns Extracted title
   */
  protected extractTitle(content: string, fileName: string): string {
    // Try to find a heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }

    // Try to find first line as title
    const firstLine = content.split('\n')[0]?.trim();
    if (firstLine && firstLine.length < 100) {
      return firstLine;
    }

    // Fall back to file name without extension
    return fileName.replace(/\.[^.]+$/, '');
  }

  /**
   * Count words in text
   * @param text - Text to count words in
   * @returns Word count
   */
  protected countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Detect language from text (simple heuristic)
   * @param text - Text to analyze
   * @returns Detected language code
   */
  protected detectLanguage(text: string): string {
    // Simple heuristic based on common words
    const sample = text.slice(0, 1000).toLowerCase();
    
    if (/\b(the|and|is|to|of|a|in)\b/.test(sample)) {
      return 'en';
    }
    if (/\b(der|die|das|und|ist|zu|von)\b/.test(sample)) {
      return 'de';
    }
    if (/\b(le|la|les|et|est|de|à)\b/.test(sample)) {
      return 'fr';
    }
    if (/\b(el|la|los|y|es|de|en)\b/.test(sample)) {
      return 'es';
    }

    return 'unknown';
  }
}

export type { IDocumentParser };
