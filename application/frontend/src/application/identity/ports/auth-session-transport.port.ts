import type { AuthSession } from '../../../domains/identity/entities/auth-session';

export interface AuthSessionTransportHandlers {
  readonly onSessionRefreshed?: (session: AuthSession) => void;
  readonly onSessionInvalidated?: () => void;
}

export interface AuthSessionTransport {
  setAuthSessionTokens(tokens: { accessToken: string | null; refreshToken: string | null }): void;
  registerAuthSessionHandlers(handlers: AuthSessionTransportHandlers): void;
}

export const AuthSessionTransportToken = Symbol('AuthSessionTransport');
