/**
 * LineGraph component for displaying time-series data
 * Uses recharts for visualization
 * Follows Open/Closed Principle - configurable via props
 */

import { memo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ILineGraphProps, IStatsHistoryPoint } from '../types/dashboard.types'
import { CHART_COLORS, STATS_DEFAULTS } from '../types/dashboard.types'

/**
 * Format timestamp for X-axis display
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string (HH:MM:SS)
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * Default Y-axis value formatter
 * @param value - Numeric value
 * @returns Formatted string
 */
function defaultYAxisFormatter(value: number): string {
  return value.toFixed(1)
}

/**
 * Transform data for recharts consumption
 * Applies the dataAccessor to extract values for each line
 */
function transformData(
  data: IStatsHistoryPoint[],
  lines: { dataKey: string }[],
  dataAccessor: (point: IStatsHistoryPoint, key: string) => number | null
): Record<string, unknown>[] {
  return data.map((point) => {
    const result: Record<string, unknown> = {
      timestamp: point.timestamp,
      time: formatTime(point.timestamp),
    }
    lines.forEach(({ dataKey }) => {
      result[dataKey] = dataAccessor(point, dataKey)
    })
    return result
  })
}

/**
 * LineGraph component
 * Renders a responsive line chart with configurable data and appearance
 * 
 * @param props - LineGraph configuration
 * @returns React element
 * 
 * @example
 * ```tsx
 * <LineGraph
 *   data={historyData}
 *   lines={[
 *     { dataKey: 'download', name: 'Download', color: '#22c55e' },
 *     { dataKey: 'upload', name: 'Upload', color: '#f59e0b' },
 *   ]}
 *   dataAccessor={(point, key) => 
 *     key === 'download' ? point.network?.rxSec : point.network?.txSec
 *   }
 *   yAxisLabel="MB/s"
 * />
 * ```
 */
function LineGraphComponent({
  data,
  lines,
  height = STATS_DEFAULTS.CHART_HEIGHT,
  dataAccessor,
  yAxisLabel,
  yAxisFormatter = defaultYAxisFormatter,
}: ILineGraphProps): React.ReactElement {
  const chartData = transformData(data, lines, dataAccessor)

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={CHART_COLORS.grid}
            opacity={0.5}
          />
          <XAxis 
            dataKey="time" 
            stroke={CHART_COLORS.text}
            tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke={CHART_COLORS.text}
            tick={{ fill: CHART_COLORS.text, fontSize: 12 }}
            tickFormatter={yAxisFormatter}
            label={yAxisLabel ? {
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              fill: CHART_COLORS.text,
              fontSize: 12,
            } : undefined}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: CHART_COLORS.background,
              border: `1px solid ${CHART_COLORS.grid}`,
              borderRadius: 8,
              color: CHART_COLORS.text,
            }}
            labelStyle={{ color: CHART_COLORS.text }}
            formatter={(value: number | undefined, name: string | undefined) => [
              value !== undefined ? yAxisFormatter(value) : '-',
              name ?? '',
            ]}
          />
          <Legend 
            wrapperStyle={{ 
              color: CHART_COLORS.text,
              paddingTop: 10,
            }}
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              strokeDasharray={line.strokeDasharray}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Memoized LineGraph for performance optimization
 * Prevents unnecessary re-renders when parent components update
 */
export const LineGraph = memo(LineGraphComponent)
