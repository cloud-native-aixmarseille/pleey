import { vi } from 'vitest';
import type { AuthSessionTransport } from '../../application/identity/ports/auth-session-transport.port';

export class AuthSessionTransportMockFactory {
  create(): AuthSessionTransport {
    return {
      setAuthSessionTokens: vi.fn(),
      registerAuthSessionHandlers: vi.fn(),
    };
  }
}
