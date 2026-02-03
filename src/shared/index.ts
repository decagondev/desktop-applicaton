/**
 * Shared module barrel export
 * Provides utilities and components used across features
 */

export { isElectron } from './lib/isElectron';
export { QuoteGen } from './components/QuoteGen';
export { 
  ElectronProvider, 
  useElectronAPI,
  ElectronContext,
} from './context/ElectronContext';
export type { 
  ElectronContextValue,
  ElectronProviderProps,
} from './context/ElectronContext';
