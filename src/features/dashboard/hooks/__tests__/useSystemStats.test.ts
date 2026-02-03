/**
 * Tests for useSystemStats hook
 * Verifies state management, API detection, and manual refresh
 * 
 * Note: Tests with autoStart:true and timers are simplified due to 
 * timing complexities with fake timers and async React state.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSystemStats } from '../useSystemStats'
import { 
  setupElectronMock, 
  clearElectronMock,
  mockMemoryStats,
  mockNetworkStats,
} from '@/test/mocks/electron'

describe('useSystemStats', () => {
  beforeEach(() => {
    setupElectronMock('win32', true)
  })

  afterEach(() => {
    clearElectronMock()
    vi.restoreAllMocks()
  })

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useSystemStats({ autoStart: false }))
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.memory).toBeNull()
    expect(result.current.network).toBeNull()
    expect(result.current.history).toEqual([])
  })

  it('detects when Electron API is available', () => {
    const { result } = renderHook(() => useSystemStats({ autoStart: false }))
    expect(result.current.isAvailable).toBe(true)
  })

  it('detects when Electron API is not available', () => {
    clearElectronMock()
    const { result } = renderHook(() => useSystemStats({ autoStart: false }))
    expect(result.current.isAvailable).toBe(false)
  })

  it('can manually refresh stats', async () => {
    const { result } = renderHook(() => useSystemStats({ autoStart: false }))
    
    expect(result.current.memory).toBeNull()
    
    await act(async () => {
      await result.current.refreshStats()
    })
    
    expect(result.current.memory).toEqual(mockMemoryStats)
    expect(result.current.network).toEqual(mockNetworkStats)
    expect(result.current.isLoading).toBe(false)
  })

  it('adds stats to history on refresh', async () => {
    const { result } = renderHook(() => useSystemStats({ autoStart: false }))
    
    expect(result.current.history.length).toBe(0)
    
    await act(async () => {
      await result.current.refreshStats()
    })
    
    expect(result.current.history.length).toBe(1)
    expect(result.current.history[0].memory).toEqual(mockMemoryStats)
    expect(result.current.history[0].network).toEqual(mockNetworkStats)
  })

  it('can clear history', async () => {
    const { result } = renderHook(() => useSystemStats({ autoStart: false }))
    
    await act(async () => {
      await result.current.refreshStats()
    })
    
    expect(result.current.history.length).toBe(1)
    
    act(() => {
      result.current.clearHistory()
    })
    
    expect(result.current.history).toEqual([])
  })

  it('sets error state when API is not available', async () => {
    clearElectronMock()
    const { result } = renderHook(() => useSystemStats({ autoStart: false }))
    
    await act(async () => {
      await result.current.refreshStats()
    })
    
    expect(result.current.error).toBe('Electron API not available')
    expect(result.current.isLoading).toBe(false)
  })

  it('limits history to maxHistoryLength', async () => {
    const { result } = renderHook(() => useSystemStats({ 
      autoStart: false,
      maxHistoryLength: 3,
    }))
    
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await result.current.refreshStats()
      })
    }
    
    expect(result.current.history.length).toBeLessThanOrEqual(3)
  })

  it('history points have timestamps', async () => {
    const { result } = renderHook(() => useSystemStats({ autoStart: false }))
    
    const before = Date.now()
    
    await act(async () => {
      await result.current.refreshStats()
    })
    
    const after = Date.now()
    
    expect(result.current.history.length).toBe(1)
    expect(result.current.history[0].timestamp).toBeGreaterThanOrEqual(before)
    expect(result.current.history[0].timestamp).toBeLessThanOrEqual(after)
  })

  it('exposes refreshStats function', () => {
    const { result } = renderHook(() => useSystemStats({ autoStart: false }))
    expect(typeof result.current.refreshStats).toBe('function')
  })

  it('exposes clearHistory function', () => {
    const { result } = renderHook(() => useSystemStats({ autoStart: false }))
    expect(typeof result.current.clearHistory).toBe('function')
  })
})
