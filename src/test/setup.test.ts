/**
 * Setup verification tests
 * Ensures the test environment is configured correctly
 */

import { describe, it, expect } from 'vitest';

describe('Test Setup', () => {
  it('should have access to Vitest globals', () => {
    expect(true).toBe(true);
  });

  it('should have access to jest-dom matchers', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    expect(div).toHaveTextContent('Hello');
  });

  it('should have window.matchMedia mocked', () => {
    expect(window.matchMedia).toBeDefined();
    const result = window.matchMedia('(min-width: 768px)');
    expect(result.matches).toBe(false);
  });
});
