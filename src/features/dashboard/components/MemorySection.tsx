/**
 * MemorySection component
 * Displays memory statistics with charts and cards
 * Follows Single Responsibility - focused on memory display
 */

import { memo } from 'react'
import { useStats } from '../context/StatsContext'
import { StatCard } from './StatCard'
import { PieChart } from './PieChart'
import { LineGraph } from './LineGraph'
import type { IStatsHistoryPoint, IPieSegment, ILineConfig } from '../types/dashboard.types'
import { CHART_COLORS } from '../types/dashboard.types'

/**
 * Format bytes to human-readable format
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "8.5 GB")
 */
function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`
}

/**
 * Memory icon SVG component
 */
function MemoryIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" 
      />
    </svg>
  )
}

/**
 * Line configuration for memory over time chart
 */
const memoryLineConfig: ILineConfig[] = [
  { dataKey: 'usedPercent', name: 'Memory Used %', color: CHART_COLORS.memory.used },
]

/**
 * Data accessor for memory percentage
 */
function memoryDataAccessor(point: IStatsHistoryPoint, key: string): number | null {
  if (key === 'usedPercent') return point.memory?.usedPercent ?? null
  return null
}

/**
 * Y-axis formatter for percentage values
 */
function percentFormatter(value: number): string {
  return `${value.toFixed(0)}%`
}

/**
 * MemorySection component
 * Displays current memory stats and historical chart
 * 
 * @returns React element
 */
function MemorySectionComponent(): React.ReactElement {
  const { memory, history, isLoading, error, isAvailable } = useStats()

  if (!isAvailable) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-slate-700/50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <MemoryIcon /> Memory
        </h2>
        <p className="text-slate-400 text-sm">
          Memory statistics are only available in the Electron app.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-red-700/50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <MemoryIcon /> Memory
        </h2>
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    )
  }

  const pieData: IPieSegment[] = memory ? [
    { name: 'Used', value: memory.used, color: CHART_COLORS.memory.used },
    { name: 'Free', value: memory.free, color: CHART_COLORS.memory.free },
  ] : []

  return (
    <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-slate-700/50 h-full">
      <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-3 sm:mb-4 flex items-center gap-2">
        <MemoryIcon /> Memory
      </h2>

      {isLoading && !memory ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-slate-700/50 rounded"></div>
          <div className="h-48 bg-slate-700/50 rounded"></div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <StatCard
              label="Total"
              value={memory ? formatBytes(memory.total, 1) : '-'}
            />
            <StatCard
              label="Used"
              value={memory ? formatBytes(memory.used, 1) : '-'}
              trend={memory && memory.usedPercent > 80 ? 'up' : 'stable'}
            />
            <StatCard
              label="Free"
              value={memory ? formatBytes(memory.free, 1) : '-'}
            />
            <StatCard
              label="Usage"
              value={memory ? memory.usedPercent.toFixed(1) : '-'}
              unit="%"
              trend={memory && memory.usedPercent > 80 ? 'up' : 'stable'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-slate-400 mb-2">Allocation</h3>
              <PieChart data={pieData} height={180} innerRadius={45} outerRadius={65} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-slate-400 mb-2">Usage Over Time</h3>
              <LineGraph
                data={history}
                lines={memoryLineConfig}
                dataAccessor={memoryDataAccessor}
                yAxisLabel="%"
                yAxisFormatter={percentFormatter}
                height={180}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Memoized MemorySection for performance
 */
export const MemorySection = memo(MemorySectionComponent)
