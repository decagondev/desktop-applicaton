/**
 * Voice API type declarations
 * Defines the interface exposed by Electron preload for voice operations
 */

import type { ITranscriptionOptions, ITranscriptionResult } from '@features/voice';

/**
 * Voice API exposed via Electron preload
 */
interface IVoiceAPI {
  /** Transcribe audio using Whisper API */
  transcribe: (
    audioBase64: string,
    format: string,
    options?: ITranscriptionOptions
  ) => Promise<ITranscriptionResult | null>;

  /** Check if Whisper API is configured */
  isWhisperAvailable: () => Promise<boolean>;
}

declare global {
  interface Window {
    voiceAPI?: IVoiceAPI;
  }
}

export type { IVoiceAPI };
