/**
 * Images API type declarations
 * Defines the interface exposed by Electron preload for image operations
 */

/**
 * Image description result
 */
interface IDescribeImageResult {
  description: string;
}

/**
 * OCR result
 */
interface IOcrResult {
  text: string;
}

/**
 * Images API exposed via Electron preload
 */
interface IImagesAPI {
  /** Generate AI description for an image */
  describeImage: (
    base64Data: string,
    mimeType: string
  ) => Promise<IDescribeImageResult | null>;

  /** Extract text from image using OCR */
  extractText: (
    base64Data: string,
    mimeType: string
  ) => Promise<IOcrResult | null>;
}

declare global {
  interface Window {
    imagesAPI?: IImagesAPI;
  }
}

export type { IImagesAPI, IDescribeImageResult, IOcrResult };
