/**
 * useSystemStats hook for polling system statistics
 * Manages memory and network stats with configurable polling
 * Follows Open/Closed Principle - configurable via options
 * Follows Dependency Inversion - depends on abstractions (ElectronAPI interface)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { 
  IStatsState, 
  IUseSystemStatsOptions,
  IStatsHistoryPoint,
} from '../types/dashboard.types'
import { STATS_DEFAULTS } from '../types/dashboard.types'
import type { IMemoryStats, INetworkStats, ISystemInfo, IProcessInfo } from '@shared/types/electron.d'

/**
 * Check if Electron API is available
 * @returns Whether the Electron stats API is available
 */
function isElectronStatsAvailable(): boolean {
  return typeof window !== 'undefined' && 
         window.electronAPI !== undefined &&
         typeof window.electronAPI.getMemoryStats === 'function'
}

/**
 * Create initial state for the stats
 */
function createInitialState(): IStatsState {
  return {
    memory: null,
    network: null,
    systemInfo: null,
    processes: null,
    history: [],
    isLoading: true,
    error: null,
  }
}

/**
 * Return type for the useSystemStats hook
 */
export interface UseSystemStatsReturn extends IStatsState {
  /** Refresh stats manually */
  refreshStats: () => Promise<void>;
  /** Clear history */
  clearHistory: () => void;
  /** Whether stats API is available */
  isAvailable: boolean;
}

/**
 * Hook for fetching and managing system statistics
 * 
 * @param options - Configuration options for the hook
 * @returns System stats state and control functions
 * 
 * @example
 * ```tsx
 * const { memory, network, history, isLoading, error } = useSystemStats({
 *   pollInterval: 2000,
 *   maxHistoryLength: 60,
 * })
 * ```
 */
export function useSystemStats(options: IUseSystemStatsOptions = {}): UseSystemStatsReturn {
  const {
    pollInterval = STATS_DEFAULTS.POLL_INTERVAL,
    maxHistoryLength = STATS_DEFAULTS.MAX_HISTORY_LENGTH,
    autoStart = true,
  } = options

  const [state, setState] = useState<IStatsState>(createInitialState)
  const [isAvailable] = useState(() => isElectronStatsAvailable())
  const intervalRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)

  /**
   * Fetch system info (called once)
   */
  const fetchSystemInfo = useCallback(async (): Promise<ISystemInfo | null> => {
    if (!isAvailable || !window.electronAPI) return null
    try {
      return await window.electronAPI.getSystemInfo()
    } catch (error) {
      console.error('Error fetching system info:', error)
      return null
    }
  }, [isAvailable])

  /**
   * Fetch memory stats
   */
  const fetchMemoryStats = useCallback(async (): Promise<IMemoryStats | null> => {
    if (!isAvailable || !window.electronAPI) return null
    try {
      return await window.electronAPI.getMemoryStats()
    } catch (error) {
      console.error('Error fetching memory stats:', error)
      return null
    }
  }, [isAvailable])

  /**
   * Fetch network stats
   */
  const fetchNetworkStats = useCallback(async (): Promise<INetworkStats | null> => {
    if (!isAvailable || !window.electronAPI) return null
    try {
      return await window.electronAPI.getNetworkStats()
    } catch (error) {
      console.error('Error fetching network stats:', error)
      return null
    }
  }, [isAvailable])

  /**
   * Fetch top processes
   */
  const fetchTopProcesses = useCallback(async (count: number = 10): Promise<IProcessInfo[] | null> => {
    if (!isAvailable || !window.electronAPI) return null
    try {
      return await window.electronAPI.getTopProcesses(count)
    } catch (error) {
      console.error('Error fetching top processes:', error)
      return null
    }
  }, [isAvailable])

  /**
   * Refresh all stats
   */
  const refreshStats = useCallback(async (): Promise<void> => {
    if (!isAvailable) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Electron API not available',
      }))
      return
    }

    if (isRunningRef.current) return
    isRunningRef.current = true

    try {
      const [memory, network, processes] = await Promise.all([
        fetchMemoryStats(),
        fetchNetworkStats(),
        fetchTopProcesses(10),
      ])

      const timestamp = Date.now()
      const historyPoint: IStatsHistoryPoint = {
        timestamp,
        memory,
        network,
      }

      setState(prev => {
        const newHistory = [...prev.history, historyPoint]
        if (newHistory.length > maxHistoryLength) {
          newHistory.shift()
        }

        return {
          ...prev,
          memory,
          network,
          processes,
          history: newHistory,
          isLoading: false,
          error: null,
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
    } finally {
      isRunningRef.current = false
    }
  }, [isAvailable, fetchMemoryStats, fetchNetworkStats, fetchTopProcesses, maxHistoryLength])

  /**
   * Clear history data
   */
  const clearHistory = useCallback((): void => {
    setState(prev => ({
      ...prev,
      history: [],
    }))
  }, [])

  /**
   * Load system info on mount
   */
  useEffect(() => {
    if (!isAvailable) return

    fetchSystemInfo().then(systemInfo => {
      setState(prev => ({
        ...prev,
        systemInfo,
      }))
    })
  }, [isAvailable, fetchSystemInfo])

  /**
   * Start polling for stats
   */
  useEffect(() => {
    if (!autoStart || !isAvailable) return

    refreshStats()

    intervalRef.current = window.setInterval(() => {
      refreshStats()
    }, pollInterval)

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoStart, isAvailable, pollInterval, refreshStats])

  return {
    ...state,
    refreshStats,
    clearHistory,
    isAvailable,
  }
}
