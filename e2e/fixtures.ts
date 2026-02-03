/**
 * E2E Test Fixtures
 * 
 * Custom fixtures and utilities for Playwright E2E tests.
 */

import { test as base, expect, Page } from '@playwright/test';

/**
 * Extended test fixtures
 */
export interface Fixtures {
  /** Navigate to a specific tab */
  navigateToTab: (tab: 'chat' | 'dashboard' | 'settings') => Promise<void>;
  /** Wait for app to be ready */
  waitForAppReady: () => Promise<void>;
}

/**
 * Create custom test with fixtures
 */
export const test = base.extend<Fixtures>({
  navigateToTab: async ({ page }, use) => {
    const navigate = async (tab: 'chat' | 'dashboard' | 'settings') => {
      const titleMap = {
        chat: 'Chat',
        dashboard: 'Dashboard',
        settings: 'Settings',
      };
      
      const button = page.getByTitle(titleMap[tab]);
      await button.click();
      
      // Wait for navigation to complete
      await page.waitForTimeout(100);
    };
    
    await use(navigate);
  },

  waitForAppReady: async ({ page }, use) => {
    const waitForReady = async () => {
      // Wait for navigation to be visible (indicates app has loaded)
      await page.waitForSelector('nav', { state: 'visible', timeout: 10000 });
    };
    
    await use(waitForReady);
  },
});

export { expect };

/**
 * Helper to mock Electron APIs in web context
 */
export async function mockElectronAPIs(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Mock vector store API
    (window as any).vectorStoreAPI = {
      addEntry: async () => ({ id: 'mock-id' }),
      search: async () => [],
      generateEmbedding: async () => ({ embedding: new Array(1536).fill(0) }),
      deleteEntry: async () => true,
      getStats: async () => ({ totalEntries: 0, lastSync: null }),
    };

    // Mock settings API
    (window as any).settingsAPI = {
      get: async () => ({
        apiKeys: {},
        features: { dashboard: true, webSearch: true, github: true, voice: true, images: true },
        preferences: { theme: 'dark', embeddingModel: 'text-embedding-3-small' },
      }),
      save: async () => true,
      setApiKey: async () => true,
      removeApiKey: async () => true,
      hasApiKey: async () => false,
      getApiKey: async () => null,
    };

    // Mock chat API
    (window as any).chatAPI = {
      queryWithRag: async () => ({
        response: 'This is a mock response.',
        sources: [],
      }),
      chatCompletion: async () => ({ content: 'Mock completion' }),
    };
  });
}

/**
 * Helper to fill a form field
 */
export async function fillField(
  page: Page,
  label: string | RegExp,
  value: string
): Promise<void> {
  const field = page.getByLabel(label);
  await field.fill(value);
}

/**
 * Helper to check for error messages
 */
export async function expectNoErrors(page: Page): Promise<void> {
  // Check for common error indicators
  const errorBanner = page.locator('[class*="error"], [class*="Error"]');
  const errorCount = await errorBanner.count();
  
  // If there are error elements, they should not be visible
  for (let i = 0; i < errorCount; i++) {
    const element = errorBanner.nth(i);
    const isVisible = await element.isVisible();
    if (isVisible) {
      const text = await element.textContent();
      throw new Error(`Unexpected error visible: ${text}`);
    }
  }
}

/**
 * Helper to wait for loading to complete
 */
export async function waitForLoadingComplete(page: Page): Promise<void> {
  // Wait for loading indicators to disappear
  const loadingIndicators = [
    page.getByText(/loading/i),
    page.locator('[class*="loading"]'),
    page.locator('[class*="spinner"]'),
  ];

  for (const indicator of loadingIndicators) {
    try {
      await indicator.waitFor({ state: 'hidden', timeout: 5000 });
    } catch {
      // Indicator might not exist, which is fine
    }
  }
}
