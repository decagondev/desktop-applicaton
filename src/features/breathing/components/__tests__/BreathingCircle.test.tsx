/**
 * Tests for BreathingCircle component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BreathingCircle } from '../BreathingCircle';

describe('BreathingCircle', () => {
  describe('Idle State', () => {
    it('should display "Press Start" when idle', () => {
      render(<BreathingCircle phase="idle" timeRemaining={0} />);
      
      expect(screen.getByText('Press Start')).toBeInTheDocument();
    });

    it('should not show time when idle', () => {
      render(<BreathingCircle phase="idle" timeRemaining={0} />);
      
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('Inhale Phase', () => {
    it('should display "Inhale" instruction', () => {
      render(<BreathingCircle phase="inhale" timeRemaining={4} />);
      
      expect(screen.getByText('Inhale')).toBeInTheDocument();
    });

    it('should display time remaining', () => {
      render(<BreathingCircle phase="inhale" timeRemaining={4} />);
      
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('Hold Phase', () => {
    it('should display "Hold" instruction', () => {
      render(<BreathingCircle phase="hold" timeRemaining={7} />);
      
      expect(screen.getByText('Hold')).toBeInTheDocument();
    });

    it('should display time remaining', () => {
      render(<BreathingCircle phase="hold" timeRemaining={7} />);
      
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });

  describe('Exhale Phase', () => {
    it('should display "Exhale" instruction', () => {
      render(<BreathingCircle phase="exhale" timeRemaining={8} />);
      
      expect(screen.getByText('Exhale')).toBeInTheDocument();
    });

    it('should display time remaining', () => {
      render(<BreathingCircle phase="exhale" timeRemaining={8} />);
      
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  describe('Custom Instructions', () => {
    it('should use custom instruction when provided', () => {
      render(
        <BreathingCircle 
          phase="inhale" 
          timeRemaining={4} 
          instruction="Breathe In"
        />
      );
      
      expect(screen.getByText('Breathe In')).toBeInTheDocument();
      expect(screen.queryByText('Inhale')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should have animation classes for inhale', () => {
      const { container } = render(
        <BreathingCircle phase="inhale" timeRemaining={4} />
      );
      
      const circle = container.querySelector('.animate-breathe-in');
      expect(circle).toBeInTheDocument();
    });

    it('should have animation classes for hold', () => {
      const { container } = render(
        <BreathingCircle phase="hold" timeRemaining={7} />
      );
      
      const circle = container.querySelector('.animate-hold');
      expect(circle).toBeInTheDocument();
    });

    it('should have animation classes for exhale', () => {
      const { container } = render(
        <BreathingCircle phase="exhale" timeRemaining={8} />
      );
      
      const circle = container.querySelector('.animate-breathe-out');
      expect(circle).toBeInTheDocument();
    });
  });
});
