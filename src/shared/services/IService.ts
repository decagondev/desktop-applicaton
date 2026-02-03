/**
 * Base Service Interfaces
 * Defines common patterns for service implementations
 */

/**
 * Base interface for all services
 * Provides lifecycle management methods
 */
export interface IService {
  /** Service name for logging and identification */
  readonly name: string;
  
  /** Initialize the service */
  initialize(): Promise<void>;
  
  /** Clean up resources */
  dispose(): Promise<void>;
  
  /** Check if service is ready */
  isReady(): boolean;
}

/**
 * Service with health check capability
 */
export interface IHealthCheckable {
  /** Check service health */
  healthCheck(): Promise<IHealthStatus>;
}

/**
 * Health check result
 */
export interface IHealthStatus {
  /** Whether the service is healthy */
  healthy: boolean;
  /** Status message */
  message: string;
  /** Response time in ms (optional) */
  latency?: number;
  /** Last check timestamp */
  timestamp: Date;
  /** Additional details (optional) */
  details?: Record<string, unknown>;
}

/**
 * Service with retry capability
 */
export interface IRetryable {
  /** Maximum retry attempts */
  maxRetries: number;
  /** Base delay between retries in ms */
  retryDelay: number;
  /** Execute with retry */
  withRetry<T>(operation: () => Promise<T>): Promise<T>;
}

/**
 * Service with rate limiting
 */
export interface IRateLimited {
  /** Requests per minute limit */
  rateLimit: number;
  /** Current request count */
  requestCount: number;
  /** Check if rate limited */
  isRateLimited(): boolean;
  /** Wait until rate limit resets */
  waitForRateLimit(): Promise<void>;
}

/**
 * Async operation result wrapper
 */
export interface IResult<T> {
  /** Whether operation succeeded */
  success: boolean;
  /** Result data (if successful) */
  data?: T;
  /** Error message (if failed) */
  error?: string;
  /** Error code (if failed) */
  code?: string;
}

/**
 * Create a successful result
 */
export function success<T>(data: T): IResult<T> {
  return { success: true, data };
}

/**
 * Create a failed result
 */
export function failure<T>(error: string, code?: string): IResult<T> {
  return { success: false, error, code };
}

/**
 * Base class for services with common functionality
 */
export abstract class BaseService implements IService {
  abstract readonly name: string;
  
  protected _isReady = false;
  protected _isInitializing = false;

  async initialize(): Promise<void> {
    if (this._isReady || this._isInitializing) {
      return;
    }

    this._isInitializing = true;
    try {
      await this.onInitialize();
      this._isReady = true;
    } finally {
      this._isInitializing = false;
    }
  }

  async dispose(): Promise<void> {
    if (!this._isReady) {
      return;
    }

    await this.onDispose();
    this._isReady = false;
  }

  isReady(): boolean {
    return this._isReady;
  }

  /**
   * Override in subclass to implement initialization logic
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * Override in subclass to implement cleanup logic
   */
  protected abstract onDispose(): Promise<void>;
}

/**
 * Retry helper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
