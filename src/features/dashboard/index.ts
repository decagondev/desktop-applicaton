/**
 * Dashboard feature public API
 * Exports all public components, hooks, contexts, and types
 */

export { DashboardLayout } from './components/DashboardLayout'
export { MemorySection } from './components/MemorySection'
export { NetworkSection } from './components/NetworkSection'
export { ProcessesSection } from './components/ProcessesSection'
export { LineGraph } from './components/LineGraph'
export { PieChart } from './components/PieChart'
export { StatCard } from './components/StatCard'

export { StatsProvider, useStats, useStatsOptional } from './context/StatsContext'

export { useSystemStats } from './hooks/useSystemStats'
export type { UseSystemStatsReturn } from './hooks/useSystemStats'

export type {
  IMemoryStats,
  INetworkStats,
  ISystemInfo,
  IProcessInfo,
  IStatsHistoryPoint,
  IStatsState,
  IStatsContext,
  IUseSystemStatsOptions,
  ILineGraphProps,
  ILineConfig,
  IPieChartProps,
  IPieSegment,
  IStatCardProps,
} from './types/dashboard.types'

export { STATS_DEFAULTS, CHART_COLORS } from './types/dashboard.types'
