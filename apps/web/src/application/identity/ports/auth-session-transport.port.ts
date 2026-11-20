import type { AuthSession } from '@pleey/contracts/identity';

export interface AuthSessionTransportHandlers {
  readonly readSessionTokens?: () => { accessToken: string | null; refreshToken: string | null };
  readonly onSessionRefreshed?: (session: AuthSession) => void;
  readonly onSessionInvalidated?: () => void;
}

export interface AuthSessionTransport {
  setAuthSessionTokens(tokens: { accessToken: string | null; refreshToken: string | null }): void;
  registerAuthSessionHandlers(handlers: AuthSessionTransportHandlers): void;
}

export const AuthSessionTransportToken = Symbol('AuthSessionTransport');
