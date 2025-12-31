import { IStorage } from "../ports/storage.interface";

/**
 * LocalStorage implementation of Storage Interface
 * Provides browser localStorage access with abstraction
 * Following Adapter Pattern and Dependency Inversion Principle
 */
export class LocalStorageAdapter implements IStorage {
  getItem(key: string): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.clear();
  }
}
