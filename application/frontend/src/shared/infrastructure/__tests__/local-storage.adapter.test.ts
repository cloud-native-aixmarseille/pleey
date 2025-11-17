import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '../local-storage.adapter';

describe('LocalStorageAdapter', () => {
  let storage: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageAdapter();
  });

  it('should store and retrieve items', () => {
    storage.setItem('test-key', 'test-value');
    const result = storage.getItem('test-key');

    expect(result).toBe('test-value');
  });

  it('should return null for non-existent keys', () => {
    const result = storage.getItem('non-existent');

    expect(result).toBeNull();
  });

  it('should remove items', () => {
    storage.setItem('test-key', 'test-value');
    storage.removeItem('test-key');
    const result = storage.getItem('test-key');

    expect(result).toBeNull();
  });

  it('should clear all items', () => {
    storage.setItem('key1', 'value1');
    storage.setItem('key2', 'value2');
    storage.clear();

    expect(storage.getItem('key1')).toBeNull();
    expect(storage.getItem('key2')).toBeNull();
  });
});
