import type { AuthSession } from '@pleey/contracts/identity';
import { inject, injectable } from 'inversify';
import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import { AUTH_ERROR_DEFINITIONS, AuthErrorCode } from '../../domains/identity/errors/auth-error-code';
import { createDomainError } from '../../domains/shared/errors/domain-error';
import { type StoragePort, StoragePortToken } from '../../domains/shared/ports/storage.port';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { AuthSessionActor } from './auth-session.actor';
import { betterAuthClient } from './better-auth-client';

@injectable()
export class PersistedAuthSessionAdapter {
  constructor(
    @inject(StoragePortToken) private readonly storage: StoragePort,
    @inject(UserIdentifier) private readonly userIdentifier: UserIdentifier,
    @inject(AuthSessionActor) private readonly sessionActor: AuthSessionActor,
  ) {
    this.sessionActor.configure({
      check: () => this.readNativeSession(),
      createAnonymous: () => this.createAnonymousNativeSession(),
    });
  }

  commit(_session: AuthSession): void {}

  updateUser(_user?: unknown): void {}

  async restore(): Promise<AuthSession | null> {
    return this.sessionActor.check();
  }

  ensureAnonymous(): Promise<AuthSession> {
    return this.sessionActor.createAnonymous();
  }

  private async readNativeSession(): Promise<AuthSession | null> {
    const confirmed = await betterAuthClient.getSession();
    if (confirmed.error)
      throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operation: 'nativeSessionCheck',
      });
    if (!confirmed.data) return null;
    return this.toAuthSession(confirmed.data);
  }

  private async createAnonymousNativeSession(): Promise<AuthSession> {
    const initialize = async () => {
      const current = await this.readNativeSession();
      if (current) return current;
      const created = await betterAuthClient.signIn.anonymous();
      if (created.error)
        throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
          operation: 'anonymousSessionCreate',
        });
      const confirmed = await this.readNativeSession();
      if (!confirmed)
        throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
          operation: 'anonymousSessionConfirmation',
        });
      return confirmed;
    };
    if ('locks' in globalThis.navigator) {
      return globalThis.navigator.locks.request('pleey-auth-session-initialization', initialize);
    }
    return initialize();
  }

  private toAuthSession(confirmed: Awaited<ReturnType<typeof betterAuthClient.getSession>>['data']): AuthSession {
    if (!confirmed)
      throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operation: 'nativeSessionMissing',
      });
    const { user, session } = confirmed;
    const userId = this.userIdentifier.parseOrNull(user.id);
    if (!userId)
      throw createDomainError(AUTH_ERROR_DEFINITIONS[AuthErrorCode.GENERIC], {
        operation: 'nativeSessionUserId',
      });
    return {
      id: session.id,
      isAnonymous: Boolean((user as { isAnonymous?: boolean }).isAnonymous),
      expiresIn: Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)),
      user: {
        id: userId,
        isAnonymous: Boolean((user as { isAnonymous?: boolean }).isAnonymous),
        username: (user as { username?: string }).username || user.name || user.email,
        email: user.email,
      },
    };
  }

  clear(): void {
    this.sessionActor.signOut();
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
