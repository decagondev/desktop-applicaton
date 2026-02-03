import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { StatsProvider } from '@features/dashboard'
import { ElectronProvider } from '@shared/index'

/**
 * Application entry point
 * Wraps App with context providers for dependency injection
 * - ElectronProvider: Platform detection and Electron API access
 * - StatsProvider: System statistics polling and state management
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ElectronProvider>
      <StatsProvider>
        <App />
      </StatsProvider>
    </ElectronProvider>
  </StrictMode>,
)
