import type { AuthSession } from '@pleey/contracts/identity';
import { injectable } from 'inversify';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { betterAuthClient } from './better-auth-client';

@injectable()
export class PersistedAuthSessionAdapter {
  constructor(..._dependencies: unknown[]) {
    // Dependencies are retained as constructor-compatible migration inputs only.
  }

  commit(session: AuthSession): void {
    // Better Auth owns the session cookie; application state is not persisted.
    void session;
  }

  updateUser(_user?: unknown): void {
    // Profile state is revalidated from the Better Auth session.
  }

  async restore(): Promise<AuthSession | null> {
    const result = await betterAuthClient.getSession();
    if (result.error || !result.data) return null;
    const { user, session } = result.data;
    return {
      accessToken: '',
      refreshToken: '',
      expiresIn: Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)),
      user: {
        id: user.id,
        username: user.name || user.email,
        email: user.email,
      },
    } as AuthSession;
  }

  clear(): void {
    localStorage.removeItem(StorageKey.AUTH_ACCESS_TOKEN);
    localStorage.removeItem(StorageKey.AUTH_REFRESH_TOKEN);
    localStorage.removeItem(StorageKey.AUTH_USER);
    localStorage.removeItem(StorageKey.THEME_DRAFTS);
    localStorage.removeItem('party.guest-session.v1');
    localStorage.removeItem('guest-session');
  }

  suspend(): void {
    // No browser-held secret is suspended.
  }

  registerHandlers(_handlers?: unknown): void {
    // Session refresh and invalidation are owned by Better Auth and the auth actor.
  }

  watch(listener: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea && event.storageArea !== window.localStorage) return;
      if (event.key === null || event.key === StorageKey.AUTH_REFRESH_TOKEN || event.key === StorageKey.AUTH_USER)
        listener();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }
}
