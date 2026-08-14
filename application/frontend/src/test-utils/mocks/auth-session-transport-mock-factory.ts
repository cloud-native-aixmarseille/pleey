import { vi } from 'vitest';
import type { AuthSessionTransport } from '../../application/identity/contracts/auth-runtime.port';

export class AuthSessionTransportMockFactory {
  create(): AuthSessionTransport {
    return {
      setAuthSessionTokens: vi.fn(),
      registerAuthSessionHandlers: vi.fn(),
    };
  }
}
