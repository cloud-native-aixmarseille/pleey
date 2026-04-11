import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { LocalStorageAdapter } from './local-storage.adapter';

describe('LocalStorageAdapter', () => {
  describe('getItem()', () => {
    it('returns a stored value from localStorage', () => {
      // Arrange
      const adapter = new LocalStorageAdapter();
      window.localStorage.setItem('token', 'abc');

      // Act
      const value = adapter.getItem('token');

      // Assert
      expect(value).toBe('abc');
    });
  });

  describe('setItem()', () => {
    it('writes a value to localStorage', () => {
      // Arrange
      const adapter = new LocalStorageAdapter();

      // Act
      adapter.setItem('token', 'xyz');

      // Assert
      expect(window.localStorage.getItem('token')).toBe('xyz');
    });
  });

  describe('removeItem()', () => {
    it('removes a value from localStorage', () => {
      // Arrange
      const adapter = new LocalStorageAdapter();
      window.localStorage.setItem('token', 'xyz');

      // Act
      adapter.removeItem('token');

      // Assert
      expect(window.localStorage.getItem('token')).toBeNull();
    });
  });
});
