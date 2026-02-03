/**
 * StatsContext - React Context for system statistics
 * Provides centralized state management for dashboard stats
 * Follows Dependency Inversion Principle - components depend on context abstraction
 */

import { createContext, useContext, type ReactNode } from 'react'
import { useSystemStats, type UseSystemStatsReturn } from '../hooks/useSystemStats'
import type { IUseSystemStatsOptions } from '../types/dashboard.types'

/**
 * Context type definition
 */
type StatsContextType = UseSystemStatsReturn | null

/**
 * Create the context with null default
 */
const StatsContext = createContext<StatsContextType>(null)

/**
 * Props for the StatsProvider component
 */
interface StatsProviderProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional configuration for the stats hook */
  options?: IUseSystemStatsOptions;
}

/**
 * StatsProvider component
 * Wraps children with the stats context
 * 
 * @param props - Provider props including children and options
 * @returns React element with context provider
 * 
 * @example
 * ```tsx
 * <StatsProvider options={{ pollInterval: 1000 }}>
 *   <Dashboard />
 * </StatsProvider>
 * ```
 */
export function StatsProvider({ children, options }: StatsProviderProps): React.ReactElement {
  const stats = useSystemStats(options)

  return (
    <StatsContext.Provider value={stats}>
      {children}
    </StatsContext.Provider>
  )
}

/**
 * Hook to access the stats context
 * Throws an error if used outside of StatsProvider
 * 
 * @returns The stats context value
 * @throws Error if used outside of StatsProvider
 * 
 * @example
 * ```tsx
 * function MemoryDisplay() {
 *   const { memory, isLoading } = useStats()
 *   if (isLoading) return <Loading />
 *   return <div>{memory?.usedPercent}% used</div>
 * }
 * ```
 */
export function useStats(): UseSystemStatsReturn {
  const context = useContext(StatsContext)
  
  if (context === null) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  
  return context
}

/**
 * Hook to optionally access the stats context
 * Returns null if used outside of StatsProvider
 * Useful for components that can work with or without stats
 * 
 * @returns The stats context value or null
 */
export function useStatsOptional(): UseSystemStatsReturn | null {
  return useContext(StatsContext)
}
