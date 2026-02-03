/**
 * Feature Toggles Component
 * Toggle switches for enabling/disabling features
 */

import { memo, useCallback } from 'react';
import type { FeatureFlagName, IFeatureFlags } from '../types/settings.types';
import {
  FEATURE_FLAG_LABELS,
  FEATURE_FLAG_DESCRIPTIONS,
} from '../types/settings.types';

/**
 * Props for FeatureToggles component
 */
interface IFeatureTogglesProps {
  /** Current feature flags */
  features: IFeatureFlags;
  /** Callback when a feature is toggled */
  onToggle: (feature: FeatureFlagName, enabled: boolean) => void;
  /** Whether toggles are disabled */
  disabled?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Individual toggle switch component
 */
interface IToggleSwitchProps {
  /** Toggle label */
  label: string;
  /** Toggle description */
  description: string;
  /** Whether the toggle is on */
  checked: boolean;
  /** Callback when toggled */
  onChange: (checked: boolean) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: IToggleSwitchProps): React.ReactElement {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onChange(!checked);
    }
  }, [checked, disabled, onChange]);

  return (
    <div
      className={`
        flex items-center justify-between p-4 bg-slate-800 rounded-lg
        ${disabled ? 'opacity-50' : 'cursor-pointer hover:bg-slate-750'}
      `}
      onClick={handleClick}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex-1 mr-4">
        <h3 className="text-sm font-medium text-slate-200">{label}</h3>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <div
        className={`
          relative w-11 h-6 rounded-full transition-colors
          ${checked ? 'bg-blue-600' : 'bg-slate-700'}
        `}
      >
        <div
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full
            transition-transform shadow
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </div>
    </div>
  );
}

/**
 * Feature toggles grid
 */
function FeatureTogglesComponent({
  features,
  onToggle,
  disabled = false,
  className = '',
}: IFeatureTogglesProps): React.ReactElement {
  const featureKeys: FeatureFlagName[] = [
    'dashboard',
    'webSearch',
    'github',
    'voiceNotes',
    'multimodal',
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <h2 className="text-lg font-semibold text-slate-200 mb-4">
        Feature Toggles
      </h2>
      {featureKeys.map((key) => (
        <ToggleSwitch
          key={key}
          label={FEATURE_FLAG_LABELS[key]}
          description={FEATURE_FLAG_DESCRIPTIONS[key]}
          checked={features[key]}
          onChange={(checked) => onToggle(key, checked)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export const FeatureToggles = memo(FeatureTogglesComponent);
