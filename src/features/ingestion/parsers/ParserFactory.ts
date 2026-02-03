/**
 * Parser Factory
 * Creates appropriate parser based on MIME type (Open/Closed Principle)
 */

import type { IDocumentParser, SupportedMimeType } from '../types/ingestion.types';
import { EXTENSION_TO_MIME } from '../types/ingestion.types';
import { MarkdownParser } from './MarkdownParser';
import { HtmlParser } from './HtmlParser';

/**
 * Factory for creating document parsers
 * Follows Open/Closed Principle - add new parsers without modifying existing code
 */
export class ParserFactory {
  private static parsers: IDocumentParser[] = [
    new MarkdownParser(),
    new HtmlParser(),
    // Add new parsers here:
    // new PdfParser(),
    // new DocxParser(),
  ];

  /**
   * Get parser for a given MIME type
   * @param mimeType - MIME type of the document
   * @returns Parser instance or null if not supported
   */
  static getParser(mimeType: string): IDocumentParser | null {
    for (const parser of this.parsers) {
      if (parser.supports(mimeType)) {
        return parser;
      }
    }
    return null;
  }

  /**
   * Get parser for a file by extension
   * @param fileName - File name with extension
   * @returns Parser instance or null if not supported
   */
  static getParserForFile(fileName: string): IDocumentParser | null {
    const extension = this.getExtension(fileName);
    const mimeType = EXTENSION_TO_MIME[extension];
    
    if (!mimeType) {
      return null;
    }

    return this.getParser(mimeType);
  }

  /**
   * Get MIME type for a file
   * @param fileName - File name with extension
   * @returns MIME type or null if not supported
   */
  static getMimeType(fileName: string): SupportedMimeType | null {
    const extension = this.getExtension(fileName);
    return EXTENSION_TO_MIME[extension] ?? null;
  }

  /**
   * Check if a file is supported
   * @param fileName - File name with extension
   * @returns True if file type is supported
   */
  static isSupported(fileName: string): boolean {
    return this.getParserForFile(fileName) !== null;
  }

  /**
   * Check if a MIME type is supported
   * @param mimeType - MIME type to check
   * @returns True if MIME type is supported
   */
  static isMimeTypeSupported(mimeType: string): boolean {
    return this.getParser(mimeType) !== null;
  }

  /**
   * Get list of supported extensions
   * @returns Array of supported file extensions
   */
  static getSupportedExtensions(): string[] {
    return Object.keys(EXTENSION_TO_MIME);
  }

  /**
   * Get list of supported MIME types
   * @returns Array of supported MIME types
   */
  static getSupportedMimeTypes(): string[] {
    return Object.values(EXTENSION_TO_MIME);
  }

  /**
   * Register a new parser
   * @param parser - Parser instance to register
   */
  static registerParser(parser: IDocumentParser): void {
    // Add at beginning so custom parsers take precedence
    this.parsers.unshift(parser);
  }

  /**
   * Get file extension from file name
   */
  private static getExtension(fileName: string): string {
    const match = fileName.match(/\.[^.]+$/);
    return match ? match[0].toLowerCase() : '';
  }
}
