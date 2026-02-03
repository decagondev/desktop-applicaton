/**
 * Main Application E2E Tests
 * 
 * Tests core application functionality including navigation,
 * settings, and basic feature interactions.
 */

import { test, expect } from '@playwright/test';

test.describe('Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application', async ({ page }) => {
    // App should render without errors
    await expect(page).toHaveTitle(/Second Brain/i);
  });

  test('should display navigation sidebar', async ({ page }) => {
    // Navigation sidebar should be visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should navigate to settings', async ({ page }) => {
    // Click settings button
    const settingsButton = page.getByTitle('Settings');
    await settingsButton.click();

    // Settings page should be visible
    await expect(page.getByText('API Keys')).toBeVisible();
  });

  test('should navigate to chat', async ({ page }) => {
    // Click chat button
    const chatButton = page.getByTitle('Chat');
    await chatButton.click();

    // Chat interface should be visible
    await expect(page.getByPlaceholder(/ask a question/i)).toBeVisible();
  });
});

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to settings
    await page.getByTitle('Settings').click();
  });

  test('should display API key configuration', async ({ page }) => {
    // API Keys section should be visible
    await expect(page.getByText('API Keys')).toBeVisible();
  });

  test('should display feature toggles', async ({ page }) => {
    // Feature toggles section should be visible
    await expect(page.getByText('Feature Toggles')).toBeVisible();
  });

  test('should toggle dashboard feature', async ({ page }) => {
    // Find dashboard toggle
    const dashboardToggle = page.getByRole('switch', { name: /dashboard/i });
    
    if (await dashboardToggle.isVisible()) {
      // Get initial state
      const initialState = await dashboardToggle.isChecked();
      
      // Click toggle
      await dashboardToggle.click();
      
      // State should change
      const newState = await dashboardToggle.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });
});

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure we're on chat tab
    await page.getByTitle('Chat').click();
  });

  test('should display empty chat state', async ({ page }) => {
    // Empty state message
    await expect(page.getByText(/start a conversation/i)).toBeVisible();
  });

  test('should have message input', async ({ page }) => {
    // Message input should be present
    const input = page.getByPlaceholder(/ask a question/i);
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test('should have send button', async ({ page }) => {
    // Send button should be present (disabled when empty)
    const sendButton = page.getByRole('button', { name: /send/i });
    await expect(sendButton).toBeVisible();
  });

  test('should enable send button when message is typed', async ({ page }) => {
    // Type a message
    const input = page.getByPlaceholder(/ask a question/i);
    await input.fill('Hello, this is a test message');

    // Send button should be enabled (or form should be submittable)
    const sendButton = page.locator('button[type="submit"]');
    await expect(sendButton).toBeEnabled();
  });

  test('should have new chat button', async ({ page }) => {
    // New Chat button should be visible
    await expect(page.getByRole('button', { name: /new chat/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for main headings
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    
    // At least one heading should be present
    const headingCount = await h1.count() + await h2.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigation buttons should have titles
    const buttons = page.locator('nav button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const title = await button.getAttribute('title');
      expect(title).toBeTruthy();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through the page
    await page.keyboard.press('Tab');
    
    // Something should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // App should still be functional
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // App should still be functional
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // App should still be functional
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});
