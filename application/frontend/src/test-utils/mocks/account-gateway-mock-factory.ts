import { vi } from 'vitest';
import type { AccountGateway } from '../../application/identity/ports/account.gateway';
import { UserGameHistoryFixtureFactory } from '../fixtures/user-game-history-fixture-factory';
import { UserSessionFixtureFactory } from '../fixtures/user-session-fixture-factory';

export class AccountGatewayMockFactory {
  create(overrides: Partial<AccountGateway> = {}): AccountGateway {
    return {
      sessions: vi.fn().mockResolvedValue(new UserSessionFixtureFactory().createOverview()),
      revokeSession: vi.fn().mockResolvedValue(undefined),
      revokeOtherSessions: vi.fn().mockResolvedValue(undefined),
      gameHistory: vi.fn().mockResolvedValue(new UserGameHistoryFixtureFactory().createPage({ totalCount: 0 })),
      ...overrides,
    };
  }
}
