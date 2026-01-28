import { inject, injectable } from 'inversify';
import type {
  AuthSessionTransport,
  AuthSessionTransportHandlers,
} from '../../application/identity/contracts/auth-runtime.port';
import { AUTH_SERVICE_ID } from '../../application/identity/contracts/auth-service-id';
import type { AuthSession } from '../../domains/auth/entities/auth-session';
import type { StoragePort } from '../../domains/shared/ports/storage.port';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';

@injectable()
export class AppAuthSessionRuntime {
  constructor(
    @inject(AUTH_SERVICE_ID.storagePort)
    private readonly storage: StoragePort,
    @inject(AUTH_SERVICE_ID.authSessionTransport)
    private readonly transport: AuthSessionTransport,
  ) {}

  commit(session: AuthSession): void {
    this.storage.setItem(StorageKey.AUTH_ACCESS_TOKEN, session.accessToken);
    this.storage.setItem(StorageKey.AUTH_REFRESH_TOKEN, session.refreshToken);
    this.storage.setItem(StorageKey.AUTH_USER, JSON.stringify(session.user));
    this.transport.setAuthSessionTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  }

  updateUser(user: AuthSession['user']): void {
    const accessToken = this.storage.getItem(StorageKey.AUTH_ACCESS_TOKEN);
    const refreshToken = this.storage.getItem(StorageKey.AUTH_REFRESH_TOKEN);

    if (!accessToken || !refreshToken) {
      return;
    }

    this.storage.setItem(StorageKey.AUTH_USER, JSON.stringify(user));
  }

  restore(): AuthSession | null {
    const accessToken = this.storage.getItem(StorageKey.AUTH_ACCESS_TOKEN);
    const refreshToken = this.storage.getItem(StorageKey.AUTH_REFRESH_TOKEN);
    const user = this.storage.getItem(StorageKey.AUTH_USER);

    if (!accessToken || !refreshToken || !user) {
      return null;
    }

    try {
      const parsedUser = this.parseStoredUser(user);
      const session = {
        accessToken,
        refreshToken,
        expiresIn: 0,
        user: parsedUser,
      } satisfies AuthSession;

      this.transport.setAuthSessionTokens({ accessToken, refreshToken });

      return session;
    } catch {
      this.clear();
      return null;
    }
  }

  clear(): void {
    this.storage.removeItem(StorageKey.AUTH_ACCESS_TOKEN);
    this.storage.removeItem(StorageKey.AUTH_REFRESH_TOKEN);
    this.storage.removeItem(StorageKey.AUTH_USER);
    this.transport.setAuthSessionTokens({ accessToken: null, refreshToken: null });
  }

  registerHandlers(handlers: AuthSessionTransportHandlers): void {
    this.transport.registerAuthSessionHandlers({
      onSessionRefreshed: (session) => {
        this.commit(session);
        handlers.onSessionRefreshed?.(session);
      },
      onSessionInvalidated: () => {
        this.clear();
        handlers.onSessionInvalidated?.();
      },
    });
  }

  private parseStoredUser(rawUser: string): AuthSession['user'] {
    const parsedUser = JSON.parse(rawUser) as unknown;

    if (!this.isStoredUser(parsedUser)) {
      throw new Error('Invalid stored auth user payload');
    }

    return parsedUser;
  }

  private isStoredUser(value: unknown): value is AuthSession['user'] {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value.id === 'number' &&
      typeof value.username === 'string' &&
      typeof value.email === 'string' &&
      (value.avatarUri === undefined ||
        value.avatarUri === null ||
        typeof value.avatarUri === 'string') &&
      (value.createdAt === undefined ||
        value.createdAt === null ||
        typeof value.createdAt === 'string')
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
