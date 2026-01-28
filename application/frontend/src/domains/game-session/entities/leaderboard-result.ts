import type { LeaderboardEntry } from './leaderboard-entry';

export interface SortedLeaderboardResult {
  readonly podiumEntries: readonly LeaderboardEntry[];
  readonly remainingEntries: readonly LeaderboardEntry[];
  readonly sortedEntries: readonly LeaderboardEntry[];
}
