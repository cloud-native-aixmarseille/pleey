import { injectable } from 'inversify';
import type { LeaderboardEntry } from '../entities/leaderboard-entry';
import type { SortedLeaderboardResult } from '../entities/leaderboard-result';

export type { SortedLeaderboardResult } from '../entities/leaderboard-result';

@injectable()
export class LeaderboardService {
  sortEntries(entries: readonly LeaderboardEntry[]): SortedLeaderboardResult {
    const sortedEntries = [...entries].sort(
      (left, right) =>
        left.rank - right.rank ||
        right.totalPoints - left.totalPoints ||
        left.username.localeCompare(right.username),
    );

    return {
      podiumEntries: sortedEntries.slice(0, 3),
      remainingEntries: sortedEntries.slice(3),
      sortedEntries,
    };
  }

  findCurrentPlayer(
    entries: readonly LeaderboardEntry[],
    userId: number | null,
    guestNickname: string,
  ): LeaderboardEntry | null {
    const normalizedNickname = guestNickname.trim().toLowerCase();

    if (userId !== null) {
      return entries.find((entry) => entry.userId === userId) ?? null;
    }

    if (normalizedNickname.length === 0) {
      return null;
    }

    return (
      entries.find((entry) => entry.username.trim().toLowerCase() === normalizedNickname) ?? null
    );
  }

  isSameEntry(entry: LeaderboardEntry, other: LeaderboardEntry | null): boolean {
    if (!other) {
      return false;
    }

    return (
      entry.rank === other.rank &&
      entry.username === other.username &&
      entry.totalPoints === other.totalPoints
    );
  }
}
