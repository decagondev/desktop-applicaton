/**
 * Electron main process
 * Manages application lifecycle and window creation
 * Implements security best practices for Electron 40+
 * Provides IPC handlers for system stats (dashboard feature)
 */

import { app, BrowserWindow, session, ipcMain, Menu } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import si from 'systeminformation'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Environment configuration
 */
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
const WEB_PORT = process.env.VITE_PORT || 5173

/**
 * Content Security Policy for production
 * Restricts what resources can be loaded
 */
const CONTENT_SECURITY_POLICY = isDev
  ? "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ws://localhost:* http://localhost:*;"
  : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"

let mainWindow: BrowserWindow | null = null

/**
 * Create the main application window
 * Configured with security best practices
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Deca Dash',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
  })

  // Set empty menu on window for Windows/Linux
  mainWindow.setMenu(null)

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Load the app
  if (isDev) {
    // Development: Load from Vite dev server
    mainWindow.loadURL(`http://localhost:${WEB_PORT}`)
    // Open DevTools in development
    mainWindow.webContents.openDevTools()
  } else {
    // Production: Load from built files
    let indexPath: string
    if (app.isPackaged) {
      // In packaged app, dist is in the app directory
      indexPath = join(__dirname, '../dist/index.html')
    } else {
      // In development build (not packaged), use relative path
      indexPath = join(__dirname, '../dist/index.html')
    }
    
    if (existsSync(indexPath)) {
      mainWindow.loadFile(indexPath)
    } else {
      console.error('Built index.html not found at:', indexPath)
      // Try alternative path structure (only if resourcesPath exists)
      if (process.resourcesPath) {
        const altPath = join(process.resourcesPath, 'app', 'dist', 'index.html')
        if (existsSync(altPath)) {
          mainWindow.loadFile(altPath)
        } else {
          console.error('Alternative path also not found:', altPath)
        }
      }
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * Configure security headers for all requests
 */
function setupSecurityHeaders(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CONTENT_SECURITY_POLICY],
      },
    })
  })
}

/**
 * IPC Handlers for System Stats
 * Provides memory and network statistics to the renderer process
 */

/**
 * Get memory statistics
 * @returns Memory stats object with total, used, free, and percentage
 */
ipcMain.handle('get-memory-stats', async () => {
  try {
    const mem = await si.mem()
    return {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      usedPercent: (mem.used / mem.total) * 100,
    }
  } catch (error) {
    console.error('Error getting memory stats:', error)
    return null
  }
})

/**
 * Get network statistics
 * @returns Network stats object with upload/download speeds and totals
 */
ipcMain.handle('get-network-stats', async () => {
  try {
    const networkStats = await si.networkStats()
    const defaultInterface = networkStats[0] || {
      rx_bytes: 0,
      tx_bytes: 0,
      rx_sec: 0,
      tx_sec: 0,
    }
    return {
      rxBytes: defaultInterface.rx_bytes,
      txBytes: defaultInterface.tx_bytes,
      rxSec: defaultInterface.rx_sec ?? 0,
      txSec: defaultInterface.tx_sec ?? 0,
    }
  } catch (error) {
    console.error('Error getting network stats:', error)
    return null
  }
})

/**
 * Get system information (CPU, OS, etc.)
 * @returns Basic system information
 */
ipcMain.handle('get-system-info', async () => {
  try {
    const [cpu, osInfo] = await Promise.all([
      si.cpu(),
      si.osInfo(),
    ])
    return {
      cpuModel: cpu.brand,
      cpuCores: cpu.cores,
      osName: osInfo.distro,
      osVersion: osInfo.release,
      hostname: osInfo.hostname,
    }
  } catch (error) {
    console.error('Error getting system info:', error)
    return null
  }
})

/**
 * Get top processes by resource usage
 * @param _event - IPC event
 * @param count - Number of processes to return (default: 10)
 * @returns Array of top processes sorted by CPU and memory usage
 */
ipcMain.handle('get-top-processes', async (_event, count: number = 10) => {
  try {
    const [processes, mem] = await Promise.all([
      si.processes(),
      si.mem(),
    ])
    
    if (!processes.list || processes.list.length === 0) {
      return []
    }
    
    const topProcesses = [...processes.list]
      .sort((a, b) => {
        const cpuDiff = b.cpu - a.cpu
        if (cpuDiff !== 0) return cpuDiff
        return (b.memRss || 0) - (a.memRss || 0)
      })
      .slice(0, count)
      .map(proc => ({
        pid: proc.pid,
        name: proc.name,
        cpu: Math.round(proc.cpu * 100) / 100,
        memory: proc.memRss || 0,
        memoryPercent: mem.total > 0 
          ? Math.round(((proc.memRss || 0) / mem.total) * 10000) / 100 
          : 0,
      }))
    
    return topProcesses
  } catch (error) {
    console.error('Error getting top processes:', error)
    return null
  }
})

/**
 * Toggle fullscreen/kiosk mode
 */
ipcMain.handle('toggle-kiosk-mode', async () => {
  if (!mainWindow) return false
  
  const isFullScreen = mainWindow.isFullScreen()
  mainWindow.setFullScreen(!isFullScreen)
  return !isFullScreen
})

/**
 * Get current kiosk mode state
 */
ipcMain.handle('get-kiosk-mode', async () => {
  if (!mainWindow) return false
  return mainWindow.isFullScreen()
})

/**
 * Application initialization
 */
app.whenReady().then(() => {
  // Remove menu bar globally before creating any windows
  if (process.platform !== 'darwin') {
    Menu.setApplicationMenu(null)
  }
  
  setupSecurityHeaders()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * Security: Prevent new window creation and restrict navigation
 */
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' }
  })

  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl)
    
    if (isDev && parsedUrl.origin === `http://localhost:${WEB_PORT}`) {
      return
    }
    
    if (!isDev && parsedUrl.protocol === 'file:') {
      return
    }
    
    event.preventDefault()
  })
})

