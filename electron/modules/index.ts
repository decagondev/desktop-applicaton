/**
 * Electron IPC Module Registration
 * Centralized registration for all IPC handlers
 */

import { registerVectorStoreHandlers } from './vector-store.js';
import { registerSettingsHandlers } from './settings.js';
import { registerChatHandlers } from './chat.js';

/**
 * Register all IPC handlers for the application
 * Call this during app initialization in main.ts
 */
export function registerAllHandlers(): void {
  console.log('Registering IPC handlers...');
  
  registerVectorStoreHandlers();
  registerSettingsHandlers();
  registerChatHandlers();
  
  console.log('IPC handlers registered successfully');
}

/**
 * Module registration interface
 * Each module should export a register function following this pattern
 */
export interface IModuleRegistration {
  /** Module name for logging */
  name: string;
  /** Function to register all handlers for this module */
  register: () => void;
  /** Function to clean up resources (optional) */
  cleanup?: () => Promise<void>;
}

/**
 * Registry of all modules for lifecycle management
 */
const moduleRegistry: IModuleRegistration[] = [];

/**
 * Register a module
 * @param module - Module registration info
 */
export function registerModule(module: IModuleRegistration): void {
  moduleRegistry.push(module);
  module.register();
  console.log(`Module registered: ${module.name}`);
}

/**
 * Clean up all registered modules
 * Call this before app quit
 */
export async function cleanupAllModules(): Promise<void> {
  console.log('Cleaning up modules...');
  
  for (const module of moduleRegistry) {
    if (module.cleanup) {
      try {
        await module.cleanup();
        console.log(`Module cleaned up: ${module.name}`);
      } catch (error) {
        console.error(`Error cleaning up module ${module.name}:`, error);
      }
    }
  }
}

export { registerVectorStoreHandlers } from './vector-store.js';
export { registerSettingsHandlers } from './settings.js';
export { registerChatHandlers } from './chat.js';
