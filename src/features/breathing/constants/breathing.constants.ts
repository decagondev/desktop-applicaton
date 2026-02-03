/**
 * Breathing pattern constants
 * Following Open/Closed principle - extend by adding new patterns
 */

import type { IBreathingPatternConfig, IBreathingPhaseConfig } from '../types/breathing.types';

/**
 * Default 4-7-8 breathing pattern phases
 */
export const DEFAULT_PHASE_CONFIGS: Record<string, IBreathingPhaseConfig> = {
  inhale: {
    name: 'inhale',
    duration: 4,
    instruction: 'Inhale',
  },
  hold: {
    name: 'hold',
    duration: 7,
    instruction: 'Hold',
  },
  exhale: {
    name: 'exhale',
    duration: 8,
    instruction: 'Exhale',
  },
  idle: {
    name: 'idle',
    duration: 0,
    instruction: 'Press Start',
  },
};

/**
 * 4-7-8 breathing pattern (default)
 * Popularized by Dr. Andrew Weil for relaxation
 */
export const PATTERN_478: IBreathingPatternConfig = {
  name: '4-7-8 Breathing',
  phases: [
    DEFAULT_PHASE_CONFIGS.inhale,
    DEFAULT_PHASE_CONFIGS.hold,
    DEFAULT_PHASE_CONFIGS.exhale,
  ],
};

/**
 * Box breathing pattern (4-4-4-4)
 * Used by Navy SEALs for stress management
 */
export const PATTERN_BOX: IBreathingPatternConfig = {
  name: 'Box Breathing',
  phases: [
    { name: 'inhale', duration: 4, instruction: 'Inhale' },
    { name: 'hold', duration: 4, instruction: 'Hold' },
    { name: 'exhale', duration: 4, instruction: 'Exhale' },
    { name: 'hold', duration: 4, instruction: 'Hold' },
  ],
};

/**
 * Available breathing patterns
 */
export const BREATHING_PATTERNS: IBreathingPatternConfig[] = [
  PATTERN_478,
  PATTERN_BOX,
];

/**
 * Default session duration options (in minutes)
 */
export const DEFAULT_DURATION_OPTIONS = [2, 5, 10, 15];

/**
 * Default session duration (in minutes)
 */
export const DEFAULT_SESSION_DURATION = 5;

/**
 * Get phase configuration by phase name
 * @param phaseName - The phase to look up
 * @param pattern - Optional custom pattern (defaults to 4-7-8)
 * @returns The phase configuration or null if not found
 */
export function getPhaseConfig(
  phaseName: string,
  pattern: IBreathingPatternConfig = PATTERN_478
): IBreathingPhaseConfig | null {
  if (phaseName === 'idle') {
    return DEFAULT_PHASE_CONFIGS.idle;
  }
  return pattern.phases.find(p => p.name === phaseName) ?? null;
}

/**
 * Get phase duration by phase name
 * @param phaseName - The phase to look up
 * @param pattern - Optional custom pattern
 * @returns Duration in seconds
 */
export function getPhaseDuration(
  phaseName: string,
  pattern: IBreathingPatternConfig = PATTERN_478
): number {
  const config = getPhaseConfig(phaseName, pattern);
  return config?.duration ?? 0;
}
