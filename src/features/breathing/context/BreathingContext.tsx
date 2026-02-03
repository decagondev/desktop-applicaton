/**
 * Breathing Context Provider
 * Provides breathing state and controls via React Context
 * Follows Dependency Inversion principle - components depend on context, not implementation
 */

import { createContext, useContext, type ReactNode } from 'react';
import {
  useBreathingTimer,
  type UseBreathingTimerOptions,
} from '../hooks/useBreathingTimer';
import type { UseBreathingTimerReturn } from '../types/breathing.types';

/**
 * Context value type
 */
type BreathingContextValue = UseBreathingTimerReturn | null;

/**
 * Breathing context instance
 */
const BreathingContext = createContext<BreathingContextValue>(null);

/**
 * Props for the BreathingProvider component
 */
export interface BreathingProviderProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional hook configuration */
  options?: UseBreathingTimerOptions;
}

/**
 * BreathingProvider component
 * Wraps children with breathing state context
 * 
 * @example
 * ```tsx
 * <BreathingProvider>
 *   <App />
 * </BreathingProvider>
 * ```
 * 
 * @example With custom pattern
 * ```tsx
 * <BreathingProvider options={{ pattern: PATTERN_BOX }}>
 *   <App />
 * </BreathingProvider>
 * ```
 */
export function BreathingProvider({ 
  children, 
  options = {} 
}: BreathingProviderProps) {
  const breathingState = useBreathingTimer(options);
  
  return (
    <BreathingContext.Provider value={breathingState}>
      {children}
    </BreathingContext.Provider>
  );
}

/**
 * Custom hook to access breathing context
 * @throws Error if used outside of BreathingProvider
 * @returns Breathing state and controls
 */
export function useBreathing(): UseBreathingTimerReturn {
  const context = useContext(BreathingContext);
  
  if (context === null) {
    throw new Error(
      'useBreathing must be used within a BreathingProvider. ' +
      'Wrap your component tree with <BreathingProvider>.'
    );
  }
  
  return context;
}

/**
 * Export the context for advanced use cases
 */
export { BreathingContext };
