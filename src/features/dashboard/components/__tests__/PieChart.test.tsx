/**
 * Tests for PieChart component
 * Verifies rendering, data display, and configuration options
 * 
 * Note: ResponsiveContainer doesn't fully render in JSDOM due to lack of dimensions.
 * Tests focus on component mounting and prop handling rather than SVG internals.
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { PieChart } from '../PieChart'
import type { IPieSegment } from '../../types/dashboard.types'
import { CHART_COLORS } from '../../types/dashboard.types'

const mockData: IPieSegment[] = [
  { name: 'Used', value: 8 * 1024 * 1024 * 1024, color: CHART_COLORS.memory.used },
  { name: 'Free', value: 8 * 1024 * 1024 * 1024, color: CHART_COLORS.memory.free },
]

describe('PieChart', () => {
  it('renders without crashing', () => {
    render(<PieChart data={mockData} />)
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('renders with empty data', () => {
    render(<PieChart data={[]} />)
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('renders with custom height', () => {
    const { container } = render(<PieChart data={mockData} height={300} />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveStyle({ height: '300px' })
  })

  it('renders responsive container for legend', () => {
    render(<PieChart data={mockData} />)
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('renders responsive container for pie segments', () => {
    render(<PieChart data={mockData} />)
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('renders with custom innerRadius for donut style', () => {
    render(<PieChart data={mockData} innerRadius={40} outerRadius={60} />)
    expect(document.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('handles single segment data', () => {
    const singleSegment: IPieSegment[] = [
      { name: 'Full', value: 16 * 1024 * 1024 * 1024, color: CHART_COLORS.memory.used },
    ]
    const { container } = render(<PieChart data={singleSegment} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with multiple segments', () => {
    const multiSegment: IPieSegment[] = [
      { name: 'Active', value: 4 * 1024 * 1024 * 1024, color: '#3b82f6' },
      { name: 'Cached', value: 4 * 1024 * 1024 * 1024, color: '#10b981' },
      { name: 'Free', value: 8 * 1024 * 1024 * 1024, color: '#64748b' },
    ]
    const { container } = render(<PieChart data={multiSegment} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
