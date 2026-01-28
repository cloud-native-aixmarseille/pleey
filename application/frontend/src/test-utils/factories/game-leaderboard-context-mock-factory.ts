import { LeaderboardService } from '../../domains/game-session/services/leaderboard-service';
import type { LeaderboardPort } from '../../presentation/game-session/live/shared/contexts/game-leaderboard-context';

export class GameLeaderboardContextMockFactory {
  createValue(overrides: Partial<LeaderboardPort> = {}): LeaderboardPort {
    const leaderboardService = new LeaderboardService();

    return {
      sortEntries: leaderboardService.sortEntries.bind(leaderboardService),
      findCurrentPlayer: leaderboardService.findCurrentPlayer.bind(leaderboardService),
      isSameEntry: leaderboardService.isSameEntry.bind(leaderboardService),
      ...overrides,
    };
  }

  createModule(overrides: Partial<LeaderboardPort> = {}) {
    const value = this.createValue(overrides);

    return {
      useGameLeaderboard: () => value,
    };
  }

  async createPartialModule<TModule extends object>(
    importOriginal: () => Promise<TModule>,
    overrides: Partial<LeaderboardPort> = {},
  ): Promise<TModule & ReturnType<GameLeaderboardContextMockFactory['createModule']>> {
    const actual = await importOriginal();

    return {
      ...actual,
      ...this.createModule(overrides),
    };
  }
}
