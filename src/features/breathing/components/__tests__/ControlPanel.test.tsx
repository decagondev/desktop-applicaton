/**
 * Tests for ControlPanel component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlPanel } from '../ControlPanel';

describe('ControlPanel', () => {
  const defaultProps = {
    isActive: false,
    sessionDuration: 5,
    onToggle: vi.fn(),
    onDurationChange: vi.fn(),
  };

  describe('Start/Stop Button', () => {
    it('should display "Start" when not active', () => {
      render(<ControlPanel {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    });

    it('should display "Stop" when active', () => {
      render(<ControlPanel {...defaultProps} isActive={true} />);
      
      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
    });

    it('should call onToggle when clicked', () => {
      const onToggle = vi.fn();
      render(<ControlPanel {...defaultProps} onToggle={onToggle} />);
      
      fireEvent.click(screen.getByRole('button', { name: 'Start' }));
      
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('should have green color when not active', () => {
      const { container } = render(<ControlPanel {...defaultProps} />);
      
      const button = container.querySelector('button');
      expect(button?.className).toContain('bg-green');
    });

    it('should have red color when active', () => {
      const { container } = render(<ControlPanel {...defaultProps} isActive={true} />);
      
      const button = container.querySelector('button');
      expect(button?.className).toContain('bg-red');
    });
  });

  describe('Duration Select', () => {
    it('should display current duration', () => {
      render(<ControlPanel {...defaultProps} sessionDuration={5} />);
      
      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('5');
    });

    it('should have default duration options', () => {
      render(<ControlPanel {...defaultProps} />);
      
      expect(screen.getByRole('option', { name: '2 minutes' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '5 minutes' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '10 minutes' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '15 minutes' })).toBeInTheDocument();
    });

    it('should call onDurationChange when changed', () => {
      const onDurationChange = vi.fn();
      render(<ControlPanel {...defaultProps} onDurationChange={onDurationChange} />);
      
      fireEvent.change(screen.getByRole('combobox'), { target: { value: '10' } });
      
      expect(onDurationChange).toHaveBeenCalledWith(10);
    });

    it('should be disabled when active', () => {
      render(<ControlPanel {...defaultProps} isActive={true} />);
      
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should be enabled when not active', () => {
      render(<ControlPanel {...defaultProps} />);
      
      expect(screen.getByRole('combobox')).toBeEnabled();
    });
  });

  describe('Custom Duration Options', () => {
    it('should use custom duration options when provided', () => {
      render(
        <ControlPanel 
          {...defaultProps} 
          durationOptions={[1, 3, 5]} 
        />
      );
      
      expect(screen.getByRole('option', { name: '1 minute' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '3 minutes' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '5 minutes' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: '10 minutes' })).not.toBeInTheDocument();
    });
  });
});
