import { DashboardLayout } from '@features/dashboard';

/**
 * Main application component
 * Renders the system dashboard with real-time stats
 * Uses StatsProvider context for state management (Dependency Inversion)
 */
export function App(): React.ReactElement {
  return <DashboardLayout />;
}