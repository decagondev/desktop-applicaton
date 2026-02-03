/**
 * Tests for isElectron utility
 */

import { describe, it, expect, afterEach } from 'vitest';
import { isElectron } from '../isElectron';
import { 
  setupElectronMock, 
  clearElectronMock 
} from '@/test/mocks/electron';

describe('isElectron', () => {
  afterEach(() => {
    clearElectronMock();
  });

  it('should return false in web environment', () => {
    clearElectronMock();
    expect(isElectron()).toBe(false);
  });

  it('should return true when electronAPI is present', () => {
    setupElectronMock();
    expect(isElectron()).toBe(true);
  });

  it('should return true for win32 platform', () => {
    setupElectronMock('win32');
    expect(isElectron()).toBe(true);
  });

  it('should return true for darwin platform', () => {
    setupElectronMock('darwin');
    expect(isElectron()).toBe(true);
  });

  it('should return true for linux platform', () => {
    setupElectronMock('linux');
    expect(isElectron()).toBe(true);
  });
});
