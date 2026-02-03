/**
 * ProcessesSection component
 * Displays top processes by CPU and memory usage
 * Follows Single Responsibility - focused on process list display
 */

import { memo, useState } from 'react'
import { useStats } from '../context/StatsContext'
import type { IProcessInfo } from '../types/dashboard.types'

/**
 * Format bytes to human-readable format
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "256 MB")
 */
function formatMemory(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Process icon SVG component
 */
function ProcessIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M4 6h16M4 10h16M4 14h16M4 18h16" 
      />
    </svg>
  )
}

/**
 * CPU icon SVG component
 */
function CpuIcon(): React.ReactElement {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
 * Memory chip icon SVG component
 */
function MemoryChipIcon(): React.ReactElement {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
      />
    </svg>
  )
}

/**
 * Sort type for the process list
 */
type SortType = 'cpu' | 'memory'

/**
 * Props for ProcessRow component
 */
interface ProcessRowProps {
  process: IProcessInfo;
  index: number;
}

/**
 * ProcessRow component - displays a single process
 */
function ProcessRow({ process, index }: ProcessRowProps): React.ReactElement {
  const cpuBarWidth = Math.min(process.cpu, 100)
  const memBarWidth = Math.min(process.memoryPercent, 100)
  
  return (
    <tr className="border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors">
      <td className="py-2 px-2 sm:px-3 text-slate-500 text-xs sm:text-sm w-8">
        {index + 1}
      </td>
      <td className="py-2 px-2 sm:px-3">
        <span className="text-slate-200 text-xs sm:text-sm font-medium truncate block max-w-[100px] sm:max-w-[150px]" title={process.name}>
          {process.name}
        </span>
        <span className="text-slate-500 text-xs hidden sm:block">
          PID: {process.pid}
        </span>
      </td>
      <td className="py-2 px-2 sm:px-3">
        <div className="flex items-center gap-2">
          <div className="w-16 sm:w-20 bg-slate-700/50 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${cpuBarWidth}%` }}
            />
          </div>
          <span className="text-xs sm:text-sm text-slate-300 w-12 sm:w-14 text-right">
            {process.cpu.toFixed(1)}%
          </span>
        </div>
      </td>
      <td className="py-2 px-2 sm:px-3">
        <div className="flex items-center gap-2">
          <div className="w-16 sm:w-20 bg-slate-700/50 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-purple-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${memBarWidth}%` }}
            />
          </div>
          <span className="text-xs sm:text-sm text-slate-300 w-14 sm:w-16 text-right">
            {formatMemory(process.memory)}
          </span>
        </div>
      </td>
    </tr>
  )
}

/**
 * ProcessesSection component
 * Displays top processes sorted by CPU or memory usage
 * 
 * @returns React element
 */
function ProcessesSectionComponent(): React.ReactElement {
  const { processes, isLoading, error, isAvailable } = useStats()
  const [sortBy, setSortBy] = useState<SortType>('cpu')

  if (!isAvailable) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-slate-700/50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <ProcessIcon /> Top Processes
        </h2>
        <p className="text-slate-400 text-sm">
          Process information is only available in the Electron app.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-red-700/50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <ProcessIcon /> Top Processes
        </h2>
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    )
  }

  const sortedProcesses = processes 
    ? [...processes].sort((a, b) => 
        sortBy === 'cpu' ? b.cpu - a.cpu : b.memoryPercent - a.memoryPercent
      )
    : []

  return (
    <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-slate-700/50 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200 flex items-center gap-2">
          <ProcessIcon /> Top Processes
        </h2>
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => setSortBy('cpu')}
            className={`
              flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors
              ${sortBy === 'cpu' 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' 
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700'}
            `}
          >
            <CpuIcon /> CPU
          </button>
          <button
            onClick={() => setSortBy('memory')}
            className={`
              flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors
              ${sortBy === 'memory' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' 
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700'}
            `}
          >
            <MemoryChipIcon /> Memory
          </button>
        </div>
      </div>

      {isLoading && !processes ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-700/50 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="py-2 px-2 sm:px-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-8">
                  #
                </th>
                <th className="py-2 px-2 sm:px-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Process
                </th>
                <th className="py-2 px-2 sm:px-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <CpuIcon /> CPU
                  </span>
                </th>
                <th className="py-2 px-2 sm:px-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <MemoryChipIcon /> Memory
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProcesses.map((process, index) => (
                <ProcessRow key={process.pid} process={process} index={index} />
              ))}
              {sortedProcesses.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                    No process data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/**
 * Memoized ProcessesSection for performance
 */
export const ProcessesSection = memo(ProcessesSectionComponent)
