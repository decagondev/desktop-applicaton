/**
 * Dashboard feature type definitions
 * Defines interfaces for system stats, history, and chart configurations
 */

import type { IMemoryStats, INetworkStats, ISystemInfo, IProcessInfo } from '@shared/types/electron.d'

/**
 * Re-export stats types from electron API for convenience
 */
export type { IMemoryStats, INetworkStats, ISystemInfo, IProcessInfo }

/**
 * A single point in the stats history timeline
 */
export interface IStatsHistoryPoint {
  /** Timestamp of the data point */
  timestamp: number;
  /** Memory stats at this point (may be null if unavailable) */
  memory: IMemoryStats | null;
  /** Network stats at this point (may be null if unavailable) */
  network: INetworkStats | null;
}

/**
 * Configuration for a line in the LineGraph component
 * Follows Interface Segregation Principle
 */
export interface ILineConfig {
  /** Unique key for the data point */
  dataKey: string;
  /** Display name for the legend */
  name: string;
  /** Line color */
  color: string;
  /** Optional stroke dash array for dashed lines */
  strokeDasharray?: string;
}

/**
 * Props for the LineGraph component
 */
export interface ILineGraphProps {
  /** Array of data points to display */
  data: IStatsHistoryPoint[];
  /** Configuration for each line */
  lines: ILineConfig[];
  /** Optional chart height (defaults to 200) */
  height?: number;
  /** Data accessor function to get the Y value */
  dataAccessor: (point: IStatsHistoryPoint, key: string) => number | null;
  /** Y-axis label (optional) */
  yAxisLabel?: string;
  /** Format function for Y-axis values */
  yAxisFormatter?: (value: number) => string;
}

/**
 * A segment in the pie chart
 */
export interface IPieSegment {
  /** Display name */
  name: string;
  /** Numeric value */
  value: number;
  /** Segment fill color */
  color: string;
}

/**
 * Props for the PieChart component
 */
export interface IPieChartProps {
  /** Array of pie segments */
  data: IPieSegment[];
  /** Optional chart height (defaults to 200) */
  height?: number;
  /** Optional inner radius for donut chart effect */
  innerRadius?: number;
  /** Optional outer radius */
  outerRadius?: number;
}

/**
 * Props for the StatCard component
 */
export interface IStatCardProps {
  /** Title/label for the stat */
  label: string;
  /** Current value to display */
  value: string | number;
  /** Optional unit (e.g., 'GB', 'MB/s') */
  unit?: string;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Optional trend indicator ('up', 'down', 'stable') */
  trend?: 'up' | 'down' | 'stable';
  /** Optional CSS class for custom styling */
  className?: string;
}

/**
 * Stats context state interface
 */
export interface IStatsState {
  /** Current memory stats */
  memory: IMemoryStats | null;
  /** Current network stats */
  network: INetworkStats | null;
  /** System information (loaded once) */
  systemInfo: ISystemInfo | null;
  /** Top processes by resource usage */
  processes: IProcessInfo[] | null;
  /** History of stats for charts */
  history: IStatsHistoryPoint[];
  /** Whether stats are currently being fetched */
  isLoading: boolean;
  /** Error message if fetching failed */
  error: string | null;
}

/**
 * Stats context value interface (state + actions)
 */
export interface IStatsContext extends IStatsState {
  /** Refresh stats manually */
  refreshStats: () => Promise<void>;
  /** Clear history */
  clearHistory: () => void;
}

/**
 * Options for the useSystemStats hook
 * Follows Open/Closed Principle for extensibility
 */
export interface IUseSystemStatsOptions {
  /** Polling interval in milliseconds (default: 2000) */
  pollInterval?: number;
  /** Maximum number of history points to keep (default: 60) */
  maxHistoryLength?: number;
  /** Whether to start polling immediately (default: true) */
  autoStart?: boolean;
}

/**
 * Default configuration values
 */
export const STATS_DEFAULTS = {
  POLL_INTERVAL: 2000,
  MAX_HISTORY_LENGTH: 60,
  CHART_HEIGHT: 200,
  PIE_INNER_RADIUS: 60,
  PIE_OUTER_RADIUS: 80,
} as const

/**
 * Color palette for charts (consistent with Tailwind slate/blue theme)
 */
export const CHART_COLORS = {
  memory: {
    used: '#3b82f6',    // blue-500
    free: '#64748b',    // slate-500
  },
  network: {
    download: '#22c55e', // green-500
    upload: '#f59e0b',   // amber-500
  },
  background: '#1e293b', // slate-800
  grid: '#334155',       // slate-700
  text: '#94a3b8',       // slate-400
} as const
