/**
 * Breathing feature barrel export
 * Provides a clean public API for the breathing feature
 */

export { BreathingCircle } from './components/BreathingCircle';
export { ControlPanel } from './components/ControlPanel';
export { ProgressInfo } from './components/ProgressInfo';
export { useBreathingTimer } from './hooks/useBreathingTimer';
export type { UseBreathingTimerOptions } from './hooks/useBreathingTimer';

export { 
  BreathingProvider, 
  useBreathing,
  BreathingContext,
} from './context/BreathingContext';
export type { BreathingProviderProps } from './context/BreathingContext';

export {
  PATTERN_478,
  PATTERN_BOX,
  BREATHING_PATTERNS,
  DEFAULT_DURATION_OPTIONS,
  DEFAULT_SESSION_DURATION,
  getPhaseConfig,
  getPhaseDuration,
} from './constants/breathing.constants';

export type {
  BreathingPhase,
  BreathingTimerState,
  BreathingCircleProps,
  ControlPanelProps,
  ProgressInfoProps,
  IBreathingPhaseConfig,
  IBreathingPatternConfig,
  ITimerControls,
  ITimerState,
  ITimerService,
  UseBreathingTimerReturn,
} from './types/breathing.types';
