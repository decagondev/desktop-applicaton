/**
 * Tests for NetworkSection component
 * Verifies rendering, loading states, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NetworkSection } from '../NetworkSection'
import { StatsProvider } from '../../context/StatsContext'
import { setupElectronMock, clearElectronMock } from '@/test/mocks/electron'

/**
 * Wrapper component with provider
 */
function NetworkSectionWithProvider(): React.ReactElement {
  return (
    <StatsProvider options={{ autoStart: false }}>
      <NetworkSection />
    </StatsProvider>
  )
}

describe('NetworkSection', () => {
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
    render(<NetworkSectionWithProvider />)
    expect(screen.getByText('Network')).toBeInTheDocument()
  })

  it('shows loading skeleton when no data', () => {
    render(<NetworkSectionWithProvider />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows unavailable message when not in Electron', () => {
    clearElectronMock()
    render(<NetworkSectionWithProvider />)
    expect(screen.getByText(/only available in the Electron app/i)).toBeInTheDocument()
  })

  it('renders section with proper styling', () => {
    render(<NetworkSectionWithProvider />)
    const section = document.querySelector('.bg-slate-800\\/30')
    expect(section).toBeInTheDocument()
  })

  it('renders network icon', () => {
    render(<NetworkSectionWithProvider />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
