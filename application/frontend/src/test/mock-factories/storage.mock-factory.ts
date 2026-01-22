import { vi } from "vitest";
import type { Storage } from "../../domains/shared/ports/storage";

export const createStorageMock = (
  overrides: Partial<Storage> = {}
): Storage => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  ...overrides,
});
