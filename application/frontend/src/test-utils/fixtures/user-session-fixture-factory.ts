import type { UserSessionDetails, UserSessionOverview } from '../../domains/identity/entities/user-session-details';

export class UserSessionFixtureFactory {
  create(overrides: Partial<UserSessionDetails> = {}): UserSessionDetails {
    return {
      id: '11111111-1111-4111-8111-111111111111',
      createdAt: '2026-09-16T09:00:00Z',
      lastActiveAt: '2026-09-17T09:00:00Z',
      expiresAt: '2026-10-01T09:00:00Z',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36',
      ipAddress: '192.0.2.10',
      ...overrides,
    };
  }

  createOverview(overrides: Partial<UserSessionOverview> = {}): UserSessionOverview {
    return {
      currentSession: this.create(),
      otherSessions: { items: [], totalCount: 0, overallCount: 0, page: 1, pageSize: 5, totalPages: 1 },
      ...overrides,
    };
  }
}
