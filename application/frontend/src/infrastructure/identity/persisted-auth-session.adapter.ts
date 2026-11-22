import type { AuthSession } from '@pleey/contracts/identity';
import { inject, injectable } from 'inversify';
import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import { type StoragePort, StoragePortToken } from '../../domains/shared/ports/storage.port';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { betterAuthClient } from './better-auth-client';

@injectable()
export class PersistedAuthSessionAdapter {
  constructor(
    @inject(StoragePortToken) private readonly storage: StoragePort,
    @inject(UserIdentifier) private readonly userIdentifier: UserIdentifier,
  ) {}

  commit(_session: AuthSession): void {}

  updateUser(_user?: unknown): void {}

  async restore(): Promise<AuthSession | null> {
    const restoreConfirmedSession = async () => {
      const current = await betterAuthClient.getSession();
      if (current.error) return null;
      if (current.data) return current.data;
      const anonymous = await betterAuthClient.signIn.anonymous();
      if (anonymous.error) return null;
      const confirmed = await betterAuthClient.getSession();
      return confirmed.error ? null : confirmed.data;
    };
    const confirmed =
      'locks' in globalThis.navigator
        ? await globalThis.navigator.locks.request('pleey-auth-session-initialization', restoreConfirmedSession)
        : await restoreConfirmedSession();
    if (!confirmed) return null;
    const { user, session } = confirmed;
    return {
      id: session.id,
      isAnonymous: Boolean((user as { isAnonymous?: boolean }).isAnonymous),
      expiresIn: Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)),
      user: {
        id: this.userIdentifier.parse(user.id),
        isAnonymous: Boolean((user as { isAnonymous?: boolean }).isAnonymous),
        username: (user as { username?: string }).username || user.name || user.email,
        email: user.email,
      },
    };
  }

  clear(): void {
    this.storage.removeItem(StorageKey.AUTH_ACCESS_TOKEN);
    this.storage.removeItem(StorageKey.AUTH_REFRESH_TOKEN);
    this.storage.removeItem(StorageKey.AUTH_USER);
    this.storage.removeItem(StorageKey.THEME_DRAFTS);
    this.storage.removeItem('party.guest-session.v1');
    this.storage.removeItem('guest-session');
  }

  suspend(): void {}

  watch(listener: () => void): () => void {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') listener();
    };
    window.addEventListener('focus', listener);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', listener);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }
}
