/**
 * Tests for StatCard component
 * Verifies rendering, value display, and all prop variations
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '../StatCard'

describe('StatCard', () => {
  it('renders with required props', () => {
    render(<StatCard label="Memory Used" value="8.5" />)
    expect(screen.getByText('Memory Used')).toBeInTheDocument()
    expect(screen.getByText('8.5')).toBeInTheDocument()
  })

  it('renders with unit', () => {
    render(<StatCard label="Memory Used" value="8.5" unit="GB" />)
    expect(screen.getByText('GB')).toBeInTheDocument()
  })

  it('renders with numeric value', () => {
    render(<StatCard label="CPU Usage" value={75} unit="%" />)
    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">📊</span>
    render(<StatCard label="Stats" value="100" icon={<TestIcon />} />)
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('renders with upward trend indicator', () => {
    render(<StatCard label="Memory" value="8.5" trend="up" />)
    const svg = document.querySelector('.text-green-500')
    expect(svg).toBeInTheDocument()
  })

  it('renders with downward trend indicator', () => {
    render(<StatCard label="Memory" value="8.5" trend="down" />)
    const svg = document.querySelector('.text-red-500')
    expect(svg).toBeInTheDocument()
  })

  it('renders with stable trend indicator', () => {
    render(<StatCard label="Memory" value="8.5" trend="stable" />)
    const svg = document.querySelector('.text-slate-400')
    expect(svg).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <StatCard label="Test" value="0" className="custom-class" />
    )
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('custom-class')
  })

  it('renders all props together', () => {
    const TestIcon = () => <span data-testid="icon">🖥️</span>
    render(
      <StatCard
        label="Network Speed"
        value="125.5"
        unit="MB/s"
        icon={<TestIcon />}
        trend="up"
        className="test-class"
      />
    )
    expect(screen.getByText('Network Speed')).toBeInTheDocument()
    expect(screen.getByText('125.5')).toBeInTheDocument()
    expect(screen.getByText('MB/s')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(document.querySelector('.text-green-500')).toBeInTheDocument()
  })

  it('renders with zero value', () => {
    render(<StatCard label="Errors" value={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders with decimal value', () => {
    render(<StatCard label="Rate" value="99.99" unit="%" />)
    expect(screen.getByText('99.99')).toBeInTheDocument()
  })

  it('renders with large value', () => {
    render(<StatCard label="Total" value="1,234,567" unit="bytes" />)
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })
})
