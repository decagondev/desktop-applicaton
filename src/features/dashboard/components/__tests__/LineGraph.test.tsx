/**
 * Tests for LineGraph component
 * Verifies rendering, data display, and configuration options
 * 
 * Note: ResponsiveContainer doesn't fully render in JSDOM due to lack of dimensions.
 * Tests focus on component mounting and prop handling rather than SVG internals.
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LineGraph } from '../LineGraph'
import type { IStatsHistoryPoint, ILineConfig } from '../../types/dashboard.types'

/**
 * Create mock history data for testing
 */
function createMockData(count: number): IStatsHistoryPoint[] {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => ({
    timestamp: now - (count - i - 1) * 2000,
    memory: {
      total: 16 * 1024 * 1024 * 1024,
      used: (8 + Math.random()) * 1024 * 1024 * 1024,
      free: (8 - Math.random()) * 1024 * 1024 * 1024,
      usedPercent: 50 + Math.random() * 10,
    },
    network: {
      rxBytes: 1000000 + i * 10000,
      txBytes: 500000 + i * 5000,
      rxSec: 1024 * 1024 * (1 + Math.random()),
      txSec: 512 * 1024 * (1 + Math.random()),
    },
  }))
}

const mockLines: ILineConfig[] = [
  { dataKey: 'download', name: 'Download', color: '#22c55e' },
  { dataKey: 'upload', name: 'Upload', color: '#f59e0b' },
]

const mockDataAccessor = (point: IStatsHistoryPoint, key: string): number | null => {
  if (key === 'download') return point.network?.rxSec ?? null
  if (key === 'upload') return point.network?.txSec ?? null
  return null
}

describe('LineGraph', () => {
  it('renders without crashing', () => {
    const data = createMockData(5)
    render(
      <LineGraph
        data={data}
        lines={mockLines}
        dataAccessor={mockDataAccessor}
      />
    )
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('renders with empty data', () => {
    render(
      <LineGraph
        data={[]}
        lines={mockLines}
        dataAccessor={mockDataAccessor}
      />
    )
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('renders with custom height', () => {
    const data = createMockData(5)
    const { container } = render(
      <LineGraph
        data={data}
        lines={mockLines}
        dataAccessor={mockDataAccessor}
        height={300}
      />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ height: '300px' })
  })

  it('renders responsive container for legend', () => {
    const data = createMockData(5)
    render(
      <LineGraph
        data={data}
        lines={mockLines}
        dataAccessor={mockDataAccessor}
      />
    )
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('handles null values in data accessor', () => {
    const data = createMockData(5)
    const nullAccessor = (): number | null => null
    
    render(
      <LineGraph
        data={data}
        lines={mockLines}
        dataAccessor={nullAccessor}
      />
    )
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('renders container with Y-axis label prop', () => {
    const data = createMockData(5)
    render(
      <LineGraph
        data={data}
        lines={mockLines}
        dataAccessor={mockDataAccessor}
        yAxisLabel="MB/s"
      />
    )
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('applies custom Y-axis formatter', () => {
    const data = createMockData(5)
    const customFormatter = (value: number) => `${value.toFixed(2)} MB/s`
    
    render(
      <LineGraph
        data={data}
        lines={mockLines}
        dataAccessor={mockDataAccessor}
        yAxisFormatter={customFormatter}
      />
    )
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('renders with multiple lines config', () => {
    const data = createMockData(5)
    const { container } = render(
      <LineGraph
        data={data}
        lines={mockLines}
        dataAccessor={mockDataAccessor}
      />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with single line config', () => {
    const data = createMockData(5)
    const singleLine: ILineConfig[] = [
      { dataKey: 'download', name: 'Download', color: '#22c55e' },
    ]
    
    const { container } = render(
      <LineGraph
        data={data}
        lines={singleLine}
        dataAccessor={mockDataAccessor}
      />
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
