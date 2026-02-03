/**
 * Electron Context Provider
 * Provides Electron API access via React Context
 * Follows Dependency Inversion principle - components depend on abstraction, not window.electronAPI
 */

import { 
  createContext, 
  useContext, 
  useMemo, 
  type ReactNode 
} from 'react';
import { isElectron } from '../lib/isElectron';
import type { ElectronAPI } from '../types/electron.d';

/**
 * Extended Electron context value with helper properties
 */
export interface ElectronContextValue {
  /** Whether running in Electron environment */
  isElectron: boolean;
  /** Platform name (win32, darwin, linux) or 'web' */
  platform: string;
  /** The raw Electron API object, if available */
  api: ElectronAPI | null;
}

/**
 * Electron context instance
 */
const ElectronContext = createContext<ElectronContextValue | null>(null);

/**
 * Props for the ElectronProvider component
 */
export interface ElectronProviderProps {
  /** Child components to wrap */
  children: ReactNode;
}

/**
 * Get the current Electron API from the window object
 * @returns ElectronAPI or null if not in Electron
 */
function getElectronAPI(): ElectronAPI | null {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }
  return null;
}

/**
 * ElectronProvider component
 * Wraps children with Electron API context
 * Safe to use in both web and Electron environments
 * 
 * @example
 * ```tsx
 * <ElectronProvider>
 *   <App />
 * </ElectronProvider>
 * ```
 */
export function ElectronProvider({ children }: ElectronProviderProps) {
  const value = useMemo<ElectronContextValue>(() => {
    const api = getElectronAPI();
    const isInElectron = isElectron();
    
    return {
      isElectron: isInElectron,
      platform: api?.platform ?? 'web',
      api,
    };
  }, []);
  
  return (
    <ElectronContext.Provider value={value}>
      {children}
    </ElectronContext.Provider>
  );
}

/**
 * Custom hook to access Electron context
 * @throws Error if used outside of ElectronProvider
 * @returns Electron context value with isElectron, platform, and api
 */
export function useElectronAPI(): ElectronContextValue {
  const context = useContext(ElectronContext);
  
  if (context === null) {
    throw new Error(
      'useElectronAPI must be used within an ElectronProvider. ' +
      'Wrap your component tree with <ElectronProvider>.'
    );
  }
  
  return context;
}

/**
 * Export the context for advanced use cases
 */
export { ElectronContext };
