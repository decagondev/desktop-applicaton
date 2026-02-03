/**
 * Tests for MemorySection component
 * Verifies rendering, loading states, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemorySection } from '../MemorySection'
import { StatsProvider } from '../../context/StatsContext'
import { setupElectronMock, clearElectronMock } from '@/test/mocks/electron'

/**
 * Wrapper component with provider
 */
function MemorySectionWithProvider(): React.ReactElement {
  return (
    <StatsProvider options={{ autoStart: false }}>
      <MemorySection />
    </StatsProvider>
  )
}

describe('MemorySection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setupElectronMock('win32', true)
  })

  afterEach(() => {
    vi.useRealTimers()
    clearElectronMock()
    vi.restoreAllMocks()
  })

  it('renders section title', () => {
    render(<MemorySectionWithProvider />)
    expect(screen.getByText('Memory')).toBeInTheDocument()
  })

  it('shows loading skeleton when no data', () => {
    render(<MemorySectionWithProvider />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows unavailable message when not in Electron', () => {
    clearElectronMock()
    render(<MemorySectionWithProvider />)
    expect(screen.getByText(/only available in the Electron app/i)).toBeInTheDocument()
  })

  it('renders stat cards section', () => {
    render(<MemorySectionWithProvider />)
    const section = document.querySelector('.bg-slate-800\\/30')
    expect(section).toBeInTheDocument()
  })

  it('renders section with proper styling', () => {
    render(<MemorySectionWithProvider />)
    const section = document.querySelector('.rounded-lg')
    expect(section).toBeInTheDocument()
  })

  it('renders memory icon', () => {
    render(<MemorySectionWithProvider />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
