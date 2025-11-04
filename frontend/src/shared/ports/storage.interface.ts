/**
 * Storage Interface
 * Defines the contract for persistent storage operations
 * Following Dependency Inversion Principle (SOLID)
 */
export interface IStorage {
  /**
   * Get item from storage
   * @param key - Storage key
   * @returns Stored value or null if not found
   */
  getItem(key: string): string | null;

  /**
   * Set item in storage
   * @param key - Storage key
   * @param value - Value to store
   */
  setItem(key: string, value: string): void;

  /**
   * Remove item from storage
   * @param key - Storage key
   */
  removeItem(key: string): void;

  /**
   * Clear all items from storage
   */
  clear(): void;
}
