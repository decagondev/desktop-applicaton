import type { BreathingCircleProps, BreathingPhase } from '../types/breathing.types';

/**
 * Default instruction text for each phase
 * Used when no custom instruction is provided
 */
const DEFAULT_INSTRUCTIONS: Record<BreathingPhase, string> = {
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
  idle: 'Press Start',
};

/**
 * Get CSS classes for the breathing circle based on phase
 * @param phase - Current breathing phase
 * @returns CSS class string
 */
function getCircleClasses(phase: BreathingPhase): string {
  const baseClasses = "flex items-center justify-center rounded-full transition-all duration-1000 ease-in-out";
  
  switch (phase) {
    case 'inhale':
      return `${baseClasses} bg-primary-light text-blue-900 animate-breathe-in`;
    case 'hold':
      return `${baseClasses} bg-primary text-blue-50 animate-hold`;
    case 'exhale':
      return `${baseClasses} bg-primary-dark text-blue-50 animate-breathe-out`;
    default:
      return `${baseClasses} bg-slate-700 text-slate-200`;
  }
}

/**
 * BreathingCircle component
 * Displays the current breathing phase with visual feedback
 * 
 * @param props - Component props
 * @param props.phase - Current breathing phase
 * @param props.timeRemaining - Time remaining in current phase
 * @param props.instruction - Optional custom instruction text (Open/Closed principle)
 */
export function BreathingCircle({ 
  phase, 
  timeRemaining,
  instruction,
}: BreathingCircleProps) {
  const displayInstruction = instruction ?? DEFAULT_INSTRUCTIONS[phase];
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={getCircleClasses(phase)}
        style={{ width: '200px', height: '200px' }}
      >
        <div className="flex flex-col items-center">
          <p className="text-xl font-bold">{displayInstruction}</p>
          {phase !== 'idle' && (
            <p className="text-3xl font-mono">{timeRemaining}</p>
          )}
        </div>
      </div>
    </div>
  );
}