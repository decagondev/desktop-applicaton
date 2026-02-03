/**
 * Shared Services
 * 
 * Provides base interfaces and utilities for service implementations.
 * 
 * @packageDocumentation
 */

export type {
  IService,
  IHealthCheckable,
  IHealthStatus,
  IRetryable,
  IRateLimited,
  IResult,
} from './IService';

export {
  BaseService,
  success,
  failure,
  withRetry,
} from './IService';
