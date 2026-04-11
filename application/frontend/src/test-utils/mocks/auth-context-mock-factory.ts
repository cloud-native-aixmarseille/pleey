import { vi } from 'vitest';
import type { AuthContextValue } from '../../presentation/identity/contexts/auth-context';
import { AuthFixtureFactory } from '../fixtures/auth-fixture-factory';

const authFixtureFactory = new AuthFixtureFactory();

type AuthContextOverrides = Partial<AuthContextValue> & {
  readonly isAuthenticated?: boolean;
};

export class AuthContextMockFactory {
  createValue(overrides: AuthContextOverrides = {}): AuthContextValue {
    const { isAuthenticated, user, ...restOverrides } = overrides;
    const resolvedUser =
      user !== undefined ? user : isAuthenticated ? authFixtureFactory.createUser() : null;

    return {
      user: resolvedUser,
      hasRestoredSession: true,
      signIn: vi.fn().mockResolvedValue(undefined),
      register: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
      updateProfile: vi.fn().mockResolvedValue(undefined),
      regenerateAvatar: vi.fn().mockResolvedValue(undefined),
      ...restOverrides,
    };
  }

  createAuthenticatedValue(overrides: AuthContextOverrides = {}): AuthContextValue {
    return this.createValue({
      user: authFixtureFactory.createUser(),
      ...overrides,
    });
  }

  createModule(overrides: AuthContextOverrides = {}) {
    const value = this.createValue(overrides);

    return {
      useAuth: () => value,
    };
  }

  createAuthenticatedModule(overrides: AuthContextOverrides = {}) {
    const value = this.createAuthenticatedValue(overrides);

    return {
      useAuth: () => value,
    };
  }

  async createPartialModule<TModule extends object>(
    importOriginal: () => Promise<TModule>,
    overrides: AuthContextOverrides = {},
  ): Promise<TModule & ReturnType<AuthContextMockFactory['createModule']>> {
    const actual = await importOriginal();

    return {
      ...actual,
      ...this.createModule(overrides),
    };
  }

  async createAuthenticatedPartialModule<TModule extends object>(
    importOriginal: () => Promise<TModule>,
    overrides: AuthContextOverrides = {},
  ): Promise<TModule & ReturnType<AuthContextMockFactory['createAuthenticatedModule']>> {
    const actual = await importOriginal();

    return {
      ...actual,
      ...this.createAuthenticatedModule(overrides),
    };
  }
}
