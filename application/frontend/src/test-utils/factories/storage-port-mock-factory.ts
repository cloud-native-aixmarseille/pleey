import { vi } from 'vitest';
import type { StoragePort } from '../../domains/shared/ports/storage.port';

export class StoragePortMockFactory {
  create(seed: Record<string, string> = {}): StoragePort {
    const store = new Map(Object.entries(seed));

    return {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key);
      }),
    };
  }
}
