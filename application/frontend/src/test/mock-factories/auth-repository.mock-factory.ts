import { vi } from "vitest";
import type { AuthRepository } from "../../domains/auth/ports/auth.repository";

export const createAuthRepositoryMock = (
  overrides: Partial<AuthRepository> = {}
): AuthRepository => ({
  login: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  updateProfile: vi.fn(),
  regenerateAvatar: vi.fn(),
  logout: vi.fn(),
  ...overrides,
});
