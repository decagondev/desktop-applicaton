/**
 * Tests for useBreathingTimer hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBreathingTimer } from '../useBreathingTimer';
import { PATTERN_BOX } from '../../constants/breathing.constants';

describe('useBreathingTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      expect(result.current.state.isActive).toBe(false);
      expect(result.current.state.phase).toBe('idle');
      expect(result.current.state.phaseTimeRemaining).toBe(0);
      expect(result.current.state.sessionDuration).toBe(5);
      expect(result.current.state.sessionTimeRemaining).toBe(300);
      expect(result.current.state.cycleCount).toBe(0);
    });

    it('should use custom initial duration when provided', () => {
      const { result } = renderHook(() => 
        useBreathingTimer({ initialDuration: 10 })
      );
      
      expect(result.current.state.sessionDuration).toBe(10);
      expect(result.current.state.sessionTimeRemaining).toBe(600);
    });

    it('should return currentPhaseConfig as null when idle', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      expect(result.current.currentPhaseConfig).toEqual({
        name: 'idle',
        duration: 0,
        instruction: 'Press Start',
      });
    });
  });

  describe('Session Control', () => {
    it('should start session on toggleSession', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      expect(result.current.state.isActive).toBe(true);
      expect(result.current.state.phase).toBe('inhale');
      expect(result.current.state.phaseTimeRemaining).toBe(4);
      expect(result.current.state.cycleCount).toBe(1);
    });

    it('should stop session on toggleSession when active', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      expect(result.current.state.isActive).toBe(true);
      
      act(() => {
        result.current.toggleSession();
      });
      
      expect(result.current.state.isActive).toBe(false);
      expect(result.current.state.phase).toBe('idle');
    });

    it('should set session duration when not active', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.setSessionDuration(10);
      });
      
      expect(result.current.state.sessionDuration).toBe(10);
      expect(result.current.state.sessionTimeRemaining).toBe(600);
    });

    it('should not change duration when active', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      act(() => {
        result.current.setSessionDuration(10);
      });
      
      expect(result.current.state.sessionDuration).toBe(5);
    });
  });

  describe('Timer Countdown', () => {
    it('should countdown phase time', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      expect(result.current.state.phaseTimeRemaining).toBe(4);
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(result.current.state.phaseTimeRemaining).toBe(3);
    });

    it('should countdown session time', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      expect(result.current.state.sessionTimeRemaining).toBe(300);
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(result.current.state.sessionTimeRemaining).toBe(299);
    });
  });

  describe('Phase Transitions', () => {
    it('should transition from inhale to hold', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      expect(result.current.state.phase).toBe('inhale');
      
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      
      expect(result.current.state.phase).toBe('hold');
      expect(result.current.state.phaseTimeRemaining).toBe(7);
    });

    it('should transition from hold to exhale', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      act(() => {
        vi.advanceTimersByTime(4000 + 7000);
      });
      
      expect(result.current.state.phase).toBe('exhale');
      expect(result.current.state.phaseTimeRemaining).toBe(8);
    });

    it('should transition from exhale to inhale and increment cycle', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      expect(result.current.state.cycleCount).toBe(1);
      
      act(() => {
        vi.advanceTimersByTime(4000 + 7000 + 8000);
      });
      
      expect(result.current.state.phase).toBe('inhale');
      expect(result.current.state.cycleCount).toBe(2);
    });

    it('should complete full cycle with correct timings', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      const fullCycleTime = 4000 + 7000 + 8000;
      
      act(() => {
        vi.advanceTimersByTime(fullCycleTime * 2);
      });
      
      expect(result.current.state.cycleCount).toBe(3);
    });
  });

  describe('Session End', () => {
    it('should end session when time runs out', () => {
      const { result } = renderHook(() => 
        useBreathingTimer({ initialDuration: 1 })
      );
      
      act(() => {
        result.current.toggleSession();
      });
      
      expect(result.current.state.isActive).toBe(true);
      
      act(() => {
        vi.advanceTimersByTime(60000);
      });
      
      expect(result.current.state.isActive).toBe(false);
      expect(result.current.state.phase).toBe('idle');
      expect(result.current.state.sessionTimeRemaining).toBe(0);
    });
  });

  describe('Custom Patterns', () => {
    it('should use custom pattern when provided', () => {
      const { result } = renderHook(() => 
        useBreathingTimer({ pattern: PATTERN_BOX })
      );
      
      act(() => {
        result.current.toggleSession();
      });
      
      expect(result.current.state.phase).toBe('inhale');
      expect(result.current.state.phaseTimeRemaining).toBe(4);
      
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      
      expect(result.current.state.phase).toBe('hold');
      expect(result.current.state.phaseTimeRemaining).toBe(4);
    });

    it('should have 4 phases in box pattern', () => {
      const { result } = renderHook(() => 
        useBreathingTimer({ pattern: PATTERN_BOX })
      );
      
      act(() => {
        result.current.toggleSession();
      });
      
      const phases: string[] = [];
      
      for (let i = 0; i < 4; i++) {
        phases.push(result.current.state.phase);
        act(() => {
          vi.advanceTimersByTime(4000);
        });
      }
      
      expect(phases).toEqual(['inhale', 'hold', 'exhale', 'hold']);
    });
  });

  describe('currentPhaseConfig', () => {
    it('should return correct config for current phase', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      expect(result.current.currentPhaseConfig).toEqual({
        name: 'inhale',
        duration: 4,
        instruction: 'Inhale',
      });
    });

    it('should update when phase changes', () => {
      const { result } = renderHook(() => useBreathingTimer());
      
      act(() => {
        result.current.toggleSession();
      });
      
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      
      expect(result.current.currentPhaseConfig?.name).toBe('hold');
      expect(result.current.currentPhaseConfig?.instruction).toBe('Hold');
    });
  });
});
