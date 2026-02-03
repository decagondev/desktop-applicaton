/**
 * Tests for breathing constants
 */

import { describe, it, expect } from 'vitest';
import {
  PATTERN_478,
  PATTERN_BOX,
  BREATHING_PATTERNS,
  DEFAULT_DURATION_OPTIONS,
  DEFAULT_SESSION_DURATION,
  DEFAULT_PHASE_CONFIGS,
  getPhaseConfig,
  getPhaseDuration,
} from '../breathing.constants';

describe('Breathing Constants', () => {
  describe('DEFAULT_PHASE_CONFIGS', () => {
    it('should have correct inhale configuration', () => {
      expect(DEFAULT_PHASE_CONFIGS.inhale).toEqual({
        name: 'inhale',
        duration: 4,
        instruction: 'Inhale',
      });
    });

    it('should have correct hold configuration', () => {
      expect(DEFAULT_PHASE_CONFIGS.hold).toEqual({
        name: 'hold',
        duration: 7,
        instruction: 'Hold',
      });
    });

    it('should have correct exhale configuration', () => {
      expect(DEFAULT_PHASE_CONFIGS.exhale).toEqual({
        name: 'exhale',
        duration: 8,
        instruction: 'Exhale',
      });
    });

    it('should have correct idle configuration', () => {
      expect(DEFAULT_PHASE_CONFIGS.idle).toEqual({
        name: 'idle',
        duration: 0,
        instruction: 'Press Start',
      });
    });
  });

  describe('PATTERN_478', () => {
    it('should have correct name', () => {
      expect(PATTERN_478.name).toBe('4-7-8 Breathing');
    });

    it('should have 3 phases in correct order', () => {
      expect(PATTERN_478.phases).toHaveLength(3);
      expect(PATTERN_478.phases[0].name).toBe('inhale');
      expect(PATTERN_478.phases[1].name).toBe('hold');
      expect(PATTERN_478.phases[2].name).toBe('exhale');
    });

    it('should have correct durations (4-7-8)', () => {
      expect(PATTERN_478.phases[0].duration).toBe(4);
      expect(PATTERN_478.phases[1].duration).toBe(7);
      expect(PATTERN_478.phases[2].duration).toBe(8);
    });
  });

  describe('PATTERN_BOX', () => {
    it('should have correct name', () => {
      expect(PATTERN_BOX.name).toBe('Box Breathing');
    });

    it('should have 4 phases (box pattern)', () => {
      expect(PATTERN_BOX.phases).toHaveLength(4);
    });

    it('should have equal durations (4-4-4-4)', () => {
      PATTERN_BOX.phases.forEach(phase => {
        expect(phase.duration).toBe(4);
      });
    });
  });

  describe('BREATHING_PATTERNS', () => {
    it('should contain both patterns', () => {
      expect(BREATHING_PATTERNS).toContain(PATTERN_478);
      expect(BREATHING_PATTERNS).toContain(PATTERN_BOX);
    });
  });

  describe('DEFAULT_DURATION_OPTIONS', () => {
    it('should have correct duration options', () => {
      expect(DEFAULT_DURATION_OPTIONS).toEqual([2, 5, 10, 15]);
    });
  });

  describe('DEFAULT_SESSION_DURATION', () => {
    it('should be 5 minutes', () => {
      expect(DEFAULT_SESSION_DURATION).toBe(5);
    });
  });

  describe('getPhaseConfig', () => {
    it('should return correct config for inhale', () => {
      const config = getPhaseConfig('inhale');
      expect(config).toEqual(DEFAULT_PHASE_CONFIGS.inhale);
    });

    it('should return idle config for idle phase', () => {
      const config = getPhaseConfig('idle');
      expect(config).toEqual(DEFAULT_PHASE_CONFIGS.idle);
    });

    it('should return null for unknown phase', () => {
      const config = getPhaseConfig('unknown');
      expect(config).toBeNull();
    });

    it('should use custom pattern when provided', () => {
      const config = getPhaseConfig('inhale', PATTERN_BOX);
      expect(config?.duration).toBe(4);
    });
  });

  describe('getPhaseDuration', () => {
    it('should return correct duration for inhale', () => {
      expect(getPhaseDuration('inhale')).toBe(4);
    });

    it('should return correct duration for hold', () => {
      expect(getPhaseDuration('hold')).toBe(7);
    });

    it('should return correct duration for exhale', () => {
      expect(getPhaseDuration('exhale')).toBe(8);
    });

    it('should return 0 for unknown phase', () => {
      expect(getPhaseDuration('unknown')).toBe(0);
    });

    it('should use custom pattern when provided', () => {
      expect(getPhaseDuration('hold', PATTERN_BOX)).toBe(4);
    });
  });
});
