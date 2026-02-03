/**
 * StatCard component for displaying individual metrics
 * Shows a labeled value with optional unit, icon, and trend indicator
 * Follows Interface Segregation Principle - minimal, focused props
 */

import { memo } from 'react'
import type { IStatCardProps } from '../types/dashboard.types'

/**
 * Trend indicator arrow icons
 */
const TrendIcons = {
  up: (
    <svg 
      className="w-4 h-4 text-green-500" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ),
  down: (
    <svg 
      className="w-4 h-4 text-red-500" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  stable: (
    <svg 
      className="w-4 h-4 text-slate-400" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
  ),
} as const

/**
 * StatCard component
 * Renders a card displaying a single statistic with styling
 * 
 * @param props - StatCard configuration
 * @returns React element
 * 
 * @example
 * ```tsx
 * <StatCard
 *   label="Memory Used"
 *   value="8.5"
 *   unit="GB"
 *   trend="up"
 *   icon={<MemoryIcon />}
 * />
 * ```
 */
function StatCardComponent({
  label,
  value,
  unit,
  icon,
  trend,
  className = '',
}: IStatCardProps): React.ReactElement {
  return (
    <div 
      className={`
        bg-slate-800/50 rounded-lg p-3 sm:p-4 
        border border-slate-700/50
        hover:border-slate-600/50 transition-colors
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <span className="text-xs sm:text-sm text-slate-400 font-medium truncate">{label}</span>
        {icon && (
          <span className="text-slate-400 flex-shrink-0 ml-1">{icon}</span>
        )}
      </div>
      <div className="flex items-end gap-1 sm:gap-2">
        <span className="text-lg sm:text-2xl font-bold text-slate-100 truncate">
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm text-slate-400 pb-0.5 sm:pb-1 flex-shrink-0">{unit}</span>
        )}
        {trend && (
          <span className="ml-auto pb-0.5 sm:pb-1 flex-shrink-0">{TrendIcons[trend]}</span>
        )}
      </div>
    </div>
  )
}

/**
 * Memoized StatCard for performance optimization
 * Prevents unnecessary re-renders when parent components update
 */
export const StatCard = memo(StatCardComponent)
