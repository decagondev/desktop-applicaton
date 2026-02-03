/**
 * HTML Parser
 * Parses HTML documents for vectorization
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
 * Parser for HTML files
 */
export class HtmlParser extends BaseDocumentParser {
  readonly supportedTypes: FileType[] = ['html'];

  /**
   * Check if this parser supports the given MIME type
   */
  supports(mimeType: string): boolean {
    return mimeType === 'text/html';
  }

  /**
   * Parse HTML content
   */
  async parse(content: ArrayBuffer | string, fileName: string): Promise<IParsedDocument> {
    // Convert ArrayBuffer to string if needed
    const html = typeof content === 'string'
      ? content
      : new TextDecoder().decode(content);

    // Extract text content
    const textContent = this.extractTextContent(html);
    
    // Extract title
    const title = this.extractHtmlTitle(html) || this.extractTitle(textContent, fileName);
    
    // Create chunks
    const chunks = this.createChunks(textContent);
    
    // Calculate metadata
    const wordCount = this.countWords(textContent);
    const language = this.detectLanguage(textContent);

    return {
      title,
      content: textContent,
      metadata: {
        fileName,
        mimeType: 'text/html' as SupportedMimeType,
        fileSize: typeof content === 'string' ? content.length : content.byteLength,
        wordCount,
        charCount: textContent.length,
        language,
      },
      chunks,
    };
  }

  /**
   * Extract title from HTML <title> tag
   */
  private extractHtmlTitle(html: string): string | null {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract text content from HTML
   * Removes tags, scripts, styles, and normalizes whitespace
   */
  private extractTextContent(html: string): string {
    let text = html;

    // Remove script and style elements
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');

    // Remove HTML comments
    text = text.replace(/<!--[\s\S]*?-->/g, '');

    // Add newlines for block elements
    const blockTags = ['p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr'];
    for (const tag of blockTags) {
      text = text.replace(new RegExp(`</${tag}>`, 'gi'), '\n');
      text = text.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '\n');
    }

    // Remove remaining HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // Decode HTML entities
    text = this.decodeHtmlEntities(text);

    // Normalize whitespace
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text;
  }

  /**
   * Decode common HTML entities
   */
  private decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      '&nbsp;': ' ',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&mdash;': '—',
      '&ndash;': '–',
      '&hellip;': '…',
      '&copy;': '©',
      '&reg;': '®',
      '&trade;': '™',
    };

    let result = text;
    for (const [entity, char] of Object.entries(entities)) {
      result = result.replace(new RegExp(entity, 'g'), char);
    }

    // Decode numeric entities
    result = result.replace(/&#(\d+);/g, (_, code) => 
      String.fromCharCode(parseInt(code, 10))
    );
    result = result.replace(/&#x([0-9a-f]+);/gi, (_, code) => 
      String.fromCharCode(parseInt(code, 16))
    );

    return result;
  }

  /**
   * Create chunks from content
   */
  private createChunks(content: string): IDocumentChunk[] {
    const { maxChunkSize, overlapSize, separators } = DEFAULT_CHUNK_CONFIG;
    const chunks: IDocumentChunk[] = [];
    
    let position = 0;

    while (position < content.length) {
      const end = Math.min(position + maxChunkSize, content.length);
      let chunkEnd = end;

      // Try to break at a good boundary
      if (end < content.length) {
        for (const separator of separators) {
          const searchRange = content.slice(position, end);
          const breakPoint = searchRange.lastIndexOf(separator);
          
          if (breakPoint > searchRange.length * 0.5) {
            chunkEnd = position + breakPoint + separator.length;
            break;
          }
        }
      }

      const chunkContent = content.slice(position, chunkEnd).trim();
      
      if (chunkContent.length > 0) {
        chunks.push({
          index: chunks.length,
          content: chunkContent,
          startOffset: position,
          endOffset: chunkEnd,
          wordCount: this.countWords(chunkContent),
        });
      }

      // Move position with overlap
      position = chunkEnd - overlapSize;
      if (position <= 0 || position <= chunks[chunks.length - 1]?.startOffset) {
        position = chunkEnd;
      }
    }

    return chunks;
  }
}
