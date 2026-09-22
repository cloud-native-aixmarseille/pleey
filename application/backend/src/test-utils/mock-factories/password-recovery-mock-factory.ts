import { type Mocked, vi } from 'vitest';
import type { PasswordRecoveryPort } from '../../domain/identity/ports/password-recovery.port';

export class PasswordRecoveryMockFactory {
  create(): Mocked<PasswordRecoveryPort> {
    return {
      enqueue: vi.fn().mockResolvedValue(undefined),
      claim: vi.fn().mockResolvedValue(null),
      complete: vi.fn().mockResolvedValue(undefined),
      issueToken: vi.fn().mockResolvedValue(true),
      consumeToken: vi.fn().mockResolvedValue(true),
      deleteExpiredRequests: vi.fn().mockResolvedValue(undefined),
    };
  }
}
