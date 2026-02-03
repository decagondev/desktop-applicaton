/**
 * NetworkSection component
 * Displays network statistics with charts and cards
 * Follows Single Responsibility - focused on network display
 */

import { memo } from 'react'
import { useStats } from '../context/StatsContext'
import { StatCard } from './StatCard'
import { LineGraph } from './LineGraph'
import type { IStatsHistoryPoint, ILineConfig } from '../types/dashboard.types'
import { CHART_COLORS } from '../types/dashboard.types'

/**
 * Format bytes per second to human-readable format
 * @param bytesPerSec - Number of bytes per second
 * @returns Formatted string (e.g., "1.5 MB/s")
 */
function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytesPerSec) / Math.log(k))
  return `${(bytesPerSec / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Format bytes to human-readable format
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 GB")
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Network icon SVG component
 */
function NetworkIcon(): React.ReactElement {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" 
      />
    </svg>
  )
}

/**
 * Download icon SVG component
 */
function DownloadIcon(): React.ReactElement {
  return (
    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  )
}

/**
 * Upload icon SVG component
 */
function UploadIcon(): React.ReactElement {
  return (
    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  )
}

/**
 * Line configuration for network chart
 */
const networkLineConfig: ILineConfig[] = [
  { dataKey: 'download', name: 'Download', color: CHART_COLORS.network.download },
  { dataKey: 'upload', name: 'Upload', color: CHART_COLORS.network.upload },
]

/**
 * Data accessor for network speeds (converted to MB/s for chart)
 */
function networkDataAccessor(point: IStatsHistoryPoint, key: string): number | null {
  if (key === 'download') {
    const rxSec = point.network?.rxSec
    return rxSec !== undefined ? rxSec / (1024 * 1024) : null
  }
  if (key === 'upload') {
    const txSec = point.network?.txSec
    return txSec !== undefined ? txSec / (1024 * 1024) : null
  }
  return null
}

/**
 * Y-axis formatter for MB/s values
 */
function mbpsFormatter(value: number): string {
  return `${value.toFixed(1)}`
}

/**
 * NetworkSection component
 * Displays current network stats and historical chart
 * 
 * @returns React element
 */
function NetworkSectionComponent(): React.ReactElement {
  const { network, history, isLoading, error, isAvailable } = useStats()

  if (!isAvailable) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-slate-700/50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <NetworkIcon /> Network
        </h2>
        <p className="text-slate-400 text-sm">
          Network statistics are only available in the Electron app.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-red-700/50">
        <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <NetworkIcon /> Network
        </h2>
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/30 rounded-lg p-4 sm:p-6 border border-slate-700/50 h-full">
      <h2 className="text-base sm:text-lg font-semibold text-slate-200 mb-3 sm:mb-4 flex items-center gap-2">
        <NetworkIcon /> Network
      </h2>

      {isLoading && !network ? (
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-slate-700/50 rounded"></div>
          <div className="h-48 bg-slate-700/50 rounded"></div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <StatCard
              label="Download"
              value={network ? formatSpeed(network.rxSec) : '-'}
              icon={<DownloadIcon />}
            />
            <StatCard
              label="Upload"
              value={network ? formatSpeed(network.txSec) : '-'}
              icon={<UploadIcon />}
            />
            <StatCard
              label="Total Down"
              value={network ? formatBytes(network.rxBytes) : '-'}
            />
            <StatCard
              label="Total Up"
              value={network ? formatBytes(network.txBytes) : '-'}
            />
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-medium text-slate-400 mb-2">Network Activity (MB/s)</h3>
            <LineGraph
              data={history}
              lines={networkLineConfig}
              dataAccessor={networkDataAccessor}
              yAxisLabel="MB/s"
              yAxisFormatter={mbpsFormatter}
              height={180}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Memoized NetworkSection for performance
 */
export const NetworkSection = memo(NetworkSectionComponent)
