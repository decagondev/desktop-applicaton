/**
 * PieChart component for displaying proportional data
 * Uses recharts for visualization
 * Follows Open/Closed Principle - configurable via props
 */

import { memo } from 'react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import type { IPieChartProps } from '../types/dashboard.types'
import { CHART_COLORS, STATS_DEFAULTS } from '../types/dashboard.types'

/**
 * Format bytes to human-readable format for tooltip
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "8.5 GB")
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Custom label renderer for pie segments
 * Shows percentage on the chart
 */
function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
}): React.ReactElement | null {
  if (cx === undefined || cy === undefined || midAngle === undefined || 
      innerRadius === undefined || outerRadius === undefined || percent === undefined) {
    return null
  }
  
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/**
 * PieChart component
 * Renders a responsive pie/donut chart with configurable data and appearance
 * 
 * @param props - PieChart configuration
 * @returns React element
 * 
 * @example
 * ```tsx
 * <PieChart
 *   data={[
 *     { name: 'Used', value: 8589934592, color: '#3b82f6' },
 *     { name: 'Free', value: 8589934592, color: '#64748b' },
 *   ]}
 *   innerRadius={60}
 *   outerRadius={80}
 * />
 * ```
 */
function PieChartComponent({
  data,
  height = STATS_DEFAULTS.CHART_HEIGHT,
  innerRadius = STATS_DEFAULTS.PIE_INNER_RADIUS,
  outerRadius = STATS_DEFAULTS.PIE_OUTER_RADIUS,
}: IPieChartProps): React.ReactElement {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: CHART_COLORS.background,
              border: `1px solid ${CHART_COLORS.grid}`,
              borderRadius: 8,
              color: CHART_COLORS.text,
            }}
            formatter={(value: number | undefined) => [
              value !== undefined ? formatBytes(value) : '-', 
              ''
            ]}
          />
          <Legend
            wrapperStyle={{
              color: CHART_COLORS.text,
              paddingTop: 10,
            }}
            formatter={(value: string) => (
              <span style={{ color: CHART_COLORS.text }}>{value}</span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Memoized PieChart for performance optimization
 * Prevents unnecessary re-renders when parent components update
 */
export const PieChart = memo(PieChartComponent)
