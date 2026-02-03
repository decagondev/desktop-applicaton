/**
 * Markdown Parser
 * Parses Markdown documents for vectorization
 */

import { BaseDocumentParser } from './IDocumentParser';
import type {
  IParsedDocument,
  IDocumentChunk,
  FileType,
  SupportedMimeType,
} from '../types/ingestion.types';
import { DEFAULT_CHUNK_CONFIG } from '../types/ingestion.types';

/**
 * Parser for Markdown files
 */
export class MarkdownParser extends BaseDocumentParser {
  readonly supportedTypes: FileType[] = ['markdown', 'txt'];

  /**
   * Check if this parser supports the given MIME type
   */
  supports(mimeType: string): boolean {
    return mimeType === 'text/markdown' || mimeType === 'text/plain';
  }

  /**
   * Parse Markdown content
   */
  async parse(content: ArrayBuffer | string, fileName: string): Promise<IParsedDocument> {
    // Convert ArrayBuffer to string if needed
    const text = typeof content === 'string' 
      ? content 
      : new TextDecoder().decode(content);

    // Clean up content
    const cleanedContent = this.cleanContent(text);
    
    // Extract title
    const title = this.extractTitle(cleanedContent, fileName);
    
    // Create chunks
    const chunks = this.createChunks(cleanedContent);
    
    // Calculate metadata
    const wordCount = this.countWords(cleanedContent);
    const language = this.detectLanguage(cleanedContent);

    return {
      title,
      content: cleanedContent,
      metadata: {
        fileName,
        mimeType: 'text/markdown' as SupportedMimeType,
        fileSize: typeof content === 'string' ? content.length : content.byteLength,
        wordCount,
        charCount: cleanedContent.length,
        language,
      },
      chunks,
    };
  }

  /**
   * Clean Markdown content
   * Remove excessive whitespace while preserving structure
   */
  private cleanContent(content: string): string {
    return content
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      // Remove excessive blank lines
      .replace(/\n{3,}/g, '\n\n')
      // Trim
      .trim();
  }

  /**
   * Create chunks from Markdown content
   * Tries to split on heading boundaries first
   */
  private createChunks(content: string): IDocumentChunk[] {
    const { maxChunkSize, overlapSize } = DEFAULT_CHUNK_CONFIG;
    const chunks: IDocumentChunk[] = [];

    // Try to split on headings first
    const sections = this.splitOnHeadings(content);

    let currentOffset = 0;

    for (const section of sections) {
      if (section.length <= maxChunkSize) {
        // Section fits in one chunk
        chunks.push({
          index: chunks.length,
          content: section,
          startOffset: currentOffset,
          endOffset: currentOffset + section.length,
          wordCount: this.countWords(section),
        });
      } else {
        // Split large section into smaller chunks
        const sectionChunks = this.splitLargeSection(
          section,
          maxChunkSize,
          overlapSize,
          currentOffset,
          chunks.length
        );
        chunks.push(...sectionChunks);
      }

      currentOffset += section.length;
    }

    return chunks;
  }

  /**
   * Split content on Markdown headings
   */
  private splitOnHeadings(content: string): string[] {
    // Split on ## or ### headings (keep heading with content)
    const parts = content.split(/(?=^#{1,3}\s)/m);
    return parts.filter(part => part.trim().length > 0);
  }

  /**
   * Split a large section into overlapping chunks
   */
  private splitLargeSection(
    content: string,
    maxSize: number,
    overlap: number,
    startOffset: number,
    startIndex: number
  ): IDocumentChunk[] {
    const chunks: IDocumentChunk[] = [];
    let position = 0;

    while (position < content.length) {
      const end = Math.min(position + maxSize, content.length);
      let chunkEnd = end;

      // Try to break at a sentence or paragraph boundary
      if (end < content.length) {
        const breakPoint = this.findBreakPoint(content, position, end);
        if (breakPoint > position) {
          chunkEnd = breakPoint;
        }
      }

      const chunkContent = content.slice(position, chunkEnd);
      chunks.push({
        index: startIndex + chunks.length,
        content: chunkContent,
        startOffset: startOffset + position,
        endOffset: startOffset + chunkEnd,
        wordCount: this.countWords(chunkContent),
      });

      // Move position with overlap
      position = chunkEnd - overlap;
      if (position <= chunks[chunks.length - 1].startOffset - startOffset) {
        position = chunkEnd; // Prevent infinite loop
      }
    }

    return chunks;
  }

  /**
   * Find a good break point for chunking
   */
  private findBreakPoint(content: string, start: number, end: number): number {
    const searchRange = content.slice(start, end);
    
    // Look for paragraph break
    const paragraphBreak = searchRange.lastIndexOf('\n\n');
    if (paragraphBreak > searchRange.length * 0.5) {
      return start + paragraphBreak + 2;
    }

    // Look for sentence break
    const sentenceBreak = searchRange.lastIndexOf('. ');
    if (sentenceBreak > searchRange.length * 0.5) {
      return start + sentenceBreak + 2;
    }

    // Look for line break
    const lineBreak = searchRange.lastIndexOf('\n');
    if (lineBreak > searchRange.length * 0.5) {
      return start + lineBreak + 1;
    }

    // Fall back to word break
    const wordBreak = searchRange.lastIndexOf(' ');
    if (wordBreak > searchRange.length * 0.5) {
      return start + wordBreak + 1;
    }

    return end;
  }
}
