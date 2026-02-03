import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type {
  ITimerState,
  BreathingPhase,
  IBreathingPatternConfig,
  IBreathingPhaseConfig,
  UseBreathingTimerReturn,
} from '../types/breathing.types';
import {
  PATTERN_478,
  DEFAULT_SESSION_DURATION,
  getPhaseConfig,
  getPhaseDuration,
} from '../constants/breathing.constants';

/**
 * Get the next phase in the breathing cycle
 * @param currentPhase - Current breathing phase
 * @param pattern - Breathing pattern configuration
 * @returns Next phase name and whether a new cycle started
 */
function getNextPhase(
  currentPhase: BreathingPhase,
  pattern: IBreathingPatternConfig
): { phase: BreathingPhase; isNewCycle: boolean } {
  const phases = pattern.phases;
  const currentIndex = phases.findIndex(p => p.name === currentPhase);
  
  if (currentIndex === -1 || currentIndex === phases.length - 1) {
    return { phase: phases[0].name, isNewCycle: true };
  }
  
  return { phase: phases[currentIndex + 1].name, isNewCycle: false };
}

/**
 * Create initial timer state
 * @param sessionDuration - Session duration in minutes
 * @returns Initial timer state
 */
function createInitialState(sessionDuration: number = DEFAULT_SESSION_DURATION): ITimerState {
  return {
    isActive: false,
    phase: 'idle',
    phaseTimeRemaining: 0,
    sessionDuration,
    sessionTimeRemaining: sessionDuration * 60,
    cycleCount: 0,
  };
}

/**
 * Options for the useBreathingTimer hook
 */
export interface UseBreathingTimerOptions {
  /** Breathing pattern to use (defaults to 4-7-8) */
  pattern?: IBreathingPatternConfig;
  /** Initial session duration in minutes */
  initialDuration?: number;
}

/**
 * Custom hook for managing breathing timer state
 * Follows SOLID principles:
 * - Single Responsibility: Manages timer state only
 * - Open/Closed: Extensible via pattern configuration
 * - Dependency Inversion: Pattern injected via options
 * 
 * @param options - Hook configuration options
 * @returns Timer state and control functions
 */
export function useBreathingTimer(
  options: UseBreathingTimerOptions = {}
): UseBreathingTimerReturn {
  const {
    pattern = PATTERN_478,
    initialDuration = DEFAULT_SESSION_DURATION,
  } = options;

  const [state, setState] = useState<ITimerState>(() => 
    createInitialState(initialDuration)
  );
  
  const timerRef = useRef<number | null>(null);
  const patternRef = useRef(pattern);
  
  /**
   * Toggle session on/off
   */
  const toggleSession = useCallback(() => {
    setState(prev => {
      if (prev.isActive) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return {
          ...prev,
          isActive: false,
          phase: 'idle',
          phaseTimeRemaining: 0,
        };
      } else {
        const firstPhase = patternRef.current.phases[0];
        return {
          ...prev,
          isActive: true,
          phase: firstPhase.name,
          phaseTimeRemaining: firstPhase.duration,
          sessionTimeRemaining: prev.sessionDuration * 60,
          cycleCount: 1,
        };
      }
    });
  }, []);
  
  /**
   * Set session duration (only when not active)
   * @param minutes - Duration in minutes
   */
  const setSessionDuration = useCallback((minutes: number) => {
    setState(prev => {
      if (prev.isActive) return prev;
      return {
        ...prev,
        sessionDuration: minutes,
        sessionTimeRemaining: minutes * 60,
      };
    });
  }, []);

  /**
   * Get current phase configuration
   */
  const currentPhaseConfig = useMemo((): IBreathingPhaseConfig | null => {
    return getPhaseConfig(state.phase, pattern);
  }, [state.phase, pattern]);
  
  /**
   * Timer tick effect
   */
  useEffect(() => {
    if (!state.isActive) return;
    
    timerRef.current = window.setInterval(() => {
      setState(prev => {
        const newSessionTimeRemaining = prev.sessionTimeRemaining - 1;
        
        if (newSessionTimeRemaining <= 0) {
          clearInterval(timerRef.current!);
          return {
            ...prev,
            isActive: false,
            phase: 'idle',
            sessionTimeRemaining: 0,
            phaseTimeRemaining: 0,
          };
        }
        
        let newPhaseTimeRemaining = prev.phaseTimeRemaining - 1;
        let newPhase = prev.phase;
        let newCycleCount = prev.cycleCount;
        
        if (newPhaseTimeRemaining <= 0) {
          const { phase: nextPhase, isNewCycle } = getNextPhase(
            prev.phase,
            patternRef.current
          );
          newPhase = nextPhase;
          newPhaseTimeRemaining = getPhaseDuration(nextPhase, patternRef.current);
          if (isNewCycle) {
            newCycleCount = prev.cycleCount + 1;
          }
        }
        
        return {
          ...prev,
          phase: newPhase,
          phaseTimeRemaining: newPhaseTimeRemaining,
          sessionTimeRemaining: newSessionTimeRemaining,
          cycleCount: newCycleCount,
        };
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isActive]);
  
  return {
    state,
    toggleSession,
    setSessionDuration,
    currentPhaseConfig,
  };
}