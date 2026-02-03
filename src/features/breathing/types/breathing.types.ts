/**
 * Breathing feature type definitions
 * Follows SOLID principles:
 * - Single Responsibility: Separate interfaces for different concerns
 * - Open/Closed: Extensible phase configuration
 * - Interface Segregation: Small, focused interfaces
 * - Dependency Inversion: Abstract timer service interface
 */

/**
 * Represents the current phase of a breathing cycle
 */
export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'idle';

/**
 * Configuration for a single breathing phase (Open/Closed principle)
 * Allows custom breathing patterns without modifying core logic
 */
export interface IBreathingPhaseConfig {
  /** Unique identifier for the phase */
  name: BreathingPhase;
  /** Duration of the phase in seconds */
  duration: number;
  /** Text instruction shown during this phase */
  instruction: string;
}

/**
 * Configuration for a complete breathing pattern
 * Default is 4-7-8 pattern, but can be extended
 */
export interface IBreathingPatternConfig {
  /** Name of the breathing pattern */
  name: string;
  /** Array of phases in order */
  phases: IBreathingPhaseConfig[];
}

/**
 * Timer control actions (Interface Segregation)
 */
export interface ITimerControls {
  /** Start the breathing session */
  start: () => void;
  /** Stop the breathing session */
  stop: () => void;
  /** Toggle session on/off */
  toggle: () => void;
  /** Set session duration in minutes */
  setDuration: (minutes: number) => void;
}

/**
 * Timer state values (Interface Segregation)
 */
export interface ITimerState {
  /** Whether the breathing session is currently active */
  isActive: boolean;
  /** Current phase of the breathing cycle */
  phase: BreathingPhase;
  /** Time remaining in the current phase (seconds) */
  phaseTimeRemaining: number;
  /** Total session duration (minutes) */
  sessionDuration: number;
  /** Time remaining in the session (seconds) */
  sessionTimeRemaining: number;
  /** Number of completed breathing cycles */
  cycleCount: number;
}

/**
 * Complete state of the breathing timer
 * Type alias for backward compatibility
 */
export type BreathingTimerState = ITimerState;

/**
 * Timer service interface (Dependency Inversion)
 * Abstracts timer implementation for testability
 */
export interface ITimerService {
  /** Get current timer state */
  getState: () => ITimerState;
  /** Start the timer */
  start: () => void;
  /** Stop the timer */
  stop: () => void;
  /** Reset the timer */
  reset: () => void;
  /** Subscribe to state changes */
  subscribe: (callback: (state: ITimerState) => void) => () => void;
}

/**
 * Hook return type combining state and controls
 */
export interface UseBreathingTimerReturn {
  /** Current timer state */
  state: ITimerState;
  /** Toggle session on/off */
  toggleSession: () => void;
  /** Set session duration */
  setSessionDuration: (minutes: number) => void;
  /** Current phase configuration */
  currentPhaseConfig: IBreathingPhaseConfig | null;
}

/**
 * Props for the BreathingCircle component
 */
export interface BreathingCircleProps {
  /** Current breathing phase */
  phase: BreathingPhase;
  /** Time remaining in the current phase */
  timeRemaining: number;
  /** Optional custom instruction text */
  instruction?: string;
}

/**
 * Props for the ControlPanel component
 */
export interface ControlPanelProps {
  /** Whether the session is currently active */
  isActive: boolean;
  /** Current session duration setting (minutes) */
  sessionDuration: number;
  /** Callback to toggle the session on/off */
  onToggle: () => void;
  /** Callback to change the session duration */
  onDurationChange: (duration: number) => void;
  /** Available duration options in minutes */
  durationOptions?: number[];
}

/**
 * Props for the ProgressInfo component
 */
export interface ProgressInfoProps {
  /** Number of completed breathing cycles */
  cycleCount: number;
  /** Time remaining in the session (seconds) */
  timeRemaining: number;
}
