import type { UserGameHistoryPage } from '../../domains/identity/ports/auth-repository';

export class UserGameHistoryFixtureFactory {
  createPage({ page = 1, pageSize = 20, totalCount = 21 } = {}): UserGameHistoryPage {
    const offset = (page - 1) * pageSize;
    return {
      page,
      pageSize,
      totalCount,
      overallCount: totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      items: Array.from({ length: Math.max(0, Math.min(pageSize, totalCount - offset)) }, (_, index) => ({
        partyId: `party-${offset + index + 1}`,
        title: `Game ${offset + index + 1}`,
        gameType: 'quiz',
        role: 'player',
        status: 'ENDED',
        createdAt: '2026-09-01T12:00:00Z',
        points: 42,
      })),
    };
  }
}
