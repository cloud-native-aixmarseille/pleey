import { vi } from 'vitest';
import type { AuthContextValue } from '../../presentation/identity/contexts/auth-context';

export class AuthContextMockFactory {
  createValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
    return {
      user: null,
      isAuthenticated: false,
      hasRestoredSession: true,
      signIn: vi.fn().mockResolvedValue(undefined),
      register: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
      updateProfile: vi.fn().mockResolvedValue(undefined),
      regenerateAvatar: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    };
  }

  createModule(overrides: Partial<AuthContextValue> = {}) {
    const value = this.createValue(overrides);

    return {
      useAuth: () => value,
    };
  }

  async createPartialModule<TModule extends object>(
    importOriginal: () => Promise<TModule>,
    overrides: Partial<AuthContextValue> = {},
  ): Promise<TModule & ReturnType<AuthContextMockFactory['createModule']>> {
    const actual = await importOriginal();

    return {
      ...actual,
      ...this.createModule(overrides),
    };
  }
}
