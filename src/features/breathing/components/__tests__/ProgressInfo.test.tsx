/**
 * Tests for ProgressInfo component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressInfo } from '../ProgressInfo';

describe('ProgressInfo', () => {
  describe('Cycle Count', () => {
    it('should display cycle count', () => {
      render(<ProgressInfo cycleCount={5} timeRemaining={300} />);
      
      expect(screen.getByText('Cycle: 5')).toBeInTheDocument();
    });

    it('should display cycle count of 0', () => {
      render(<ProgressInfo cycleCount={0} timeRemaining={300} />);
      
      expect(screen.getByText('Cycle: 0')).toBeInTheDocument();
    });

    it('should display high cycle counts', () => {
      render(<ProgressInfo cycleCount={100} timeRemaining={300} />);
      
      expect(screen.getByText('Cycle: 100')).toBeInTheDocument();
    });
  });

  describe('Time Remaining', () => {
    it('should format time as M:SS', () => {
      render(<ProgressInfo cycleCount={1} timeRemaining={125} />);
      
      expect(screen.getByText('Remaining: 2:05')).toBeInTheDocument();
    });

    it('should display 0:00 for zero time', () => {
      render(<ProgressInfo cycleCount={1} timeRemaining={0} />);
      
      expect(screen.getByText('Remaining: 0:00')).toBeInTheDocument();
    });

    it('should format single digit seconds with leading zero', () => {
      render(<ProgressInfo cycleCount={1} timeRemaining={65} />);
      
      expect(screen.getByText('Remaining: 1:05')).toBeInTheDocument();
    });

    it('should format 5 minutes correctly', () => {
      render(<ProgressInfo cycleCount={1} timeRemaining={300} />);
      
      expect(screen.getByText('Remaining: 5:00')).toBeInTheDocument();
    });

    it('should format 10 minutes correctly', () => {
      render(<ProgressInfo cycleCount={1} timeRemaining={600} />);
      
      expect(screen.getByText('Remaining: 10:00')).toBeInTheDocument();
    });

    it('should handle 59 seconds', () => {
      render(<ProgressInfo cycleCount={1} timeRemaining={59} />);
      
      expect(screen.getByText('Remaining: 0:59')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render cycle icon (svg)', () => {
      const { container } = render(
        <ProgressInfo cycleCount={1} timeRemaining={300} />
      );
      
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);
    });
  });
});
