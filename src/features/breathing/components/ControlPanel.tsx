import type { ControlPanelProps } from '../types/breathing.types';
import { DEFAULT_DURATION_OPTIONS } from '../constants/breathing.constants';

/**
 * ControlPanel component
 * Provides controls for starting/stopping sessions and setting duration
 * 
 * @param props - Component props
 * @param props.isActive - Whether session is active
 * @param props.sessionDuration - Current duration setting
 * @param props.onToggle - Toggle callback
 * @param props.onDurationChange - Duration change callback
 * @param props.durationOptions - Optional custom duration options (Open/Closed principle)
 */
export function ControlPanel({ 
  isActive, 
  sessionDuration, 
  onToggle, 
  onDurationChange,
  durationOptions = DEFAULT_DURATION_OPTIONS,
}: ControlPanelProps) {
  return (
    <div className="mt-8 flex gap-4 items-center">
      <button
        onClick={onToggle}
        className={`px-6 py-2 rounded-full font-medium ${
          isActive
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isActive ? 'Stop' : 'Start'}
      </button>
      
      <div className="flex items-center gap-2">
        <label htmlFor="duration" className="text-sm">Session:</label>
        <select
          id="duration"
          value={sessionDuration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          disabled={isActive}
          className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
        >
          {durationOptions.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} minute{minutes !== 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}