import { describe, expect, it } from 'vitest';
import { LeaderboardService } from './leaderboard-service';

describe('LeaderboardService', () => {
  const service = new LeaderboardService();

  describe('sortEntries', () => {
    it('sorts by rank ascending, then totalPoints descending, then username alphabetically', () => {
      const entries = [
        { username: 'Zara', totalPoints: 100, rank: 2 },
        { username: 'Alice', totalPoints: 200, rank: 1 },
        { username: 'Bob', totalPoints: 100, rank: 2 },
        { username: 'Charlie', totalPoints: 50, rank: 3 },
      ];

      const result = service.sortEntries(entries);

      expect(result.sortedEntries.map((e) => e.username)).toEqual([
        'Alice',
        'Bob',
        'Zara',
        'Charlie',
      ]);
    });

    it('splits podium (top 3) from remaining entries', () => {
      const entries = [
        { username: 'A', totalPoints: 400, rank: 1 },
        { username: 'B', totalPoints: 300, rank: 2 },
        { username: 'C', totalPoints: 200, rank: 3 },
        { username: 'D', totalPoints: 100, rank: 4 },
      ];

      const result = service.sortEntries(entries);

      expect(result.podiumEntries).toHaveLength(3);
      expect(result.remainingEntries).toHaveLength(1);
      expect(result.remainingEntries[0].username).toBe('D');
    });

    it('handles empty entries', () => {
      const result = service.sortEntries([]);

      expect(result.sortedEntries).toEqual([]);
      expect(result.podiumEntries).toEqual([]);
      expect(result.remainingEntries).toEqual([]);
    });
  });

  describe('findCurrentPlayer', () => {
    const entries = [
      { userId: 1, username: 'Alice', totalPoints: 200, rank: 1 },
      { username: 'GuestBob', totalPoints: 100, rank: 2 },
      { userId: 3, username: 'Charlie', totalPoints: 50, rank: 3 },
    ];

    it('finds authenticated player by userId', () => {
      const result = service.findCurrentPlayer(entries, 1, '');

      expect(result?.username).toBe('Alice');
    });

    it('finds guest player by nickname (case-insensitive, trimmed)', () => {
      const result = service.findCurrentPlayer(entries, null, '  guestbob  ');

      expect(result?.username).toBe('GuestBob');
    });

    it('returns null when no match found', () => {
      const result = service.findCurrentPlayer(entries, 999, '');

      expect(result).toBeNull();
    });

    it('returns null for empty guest nickname', () => {
      const result = service.findCurrentPlayer(entries, null, '  ');

      expect(result).toBeNull();
    });
  });

  describe('isSameEntry', () => {
    it('returns true for matching entries', () => {
      const entry = { username: 'Alice', totalPoints: 200, rank: 1 };
      const other = { username: 'Alice', totalPoints: 200, rank: 1 };

      expect(service.isSameEntry(entry, other)).toBe(true);
    });

    it('returns false for null other', () => {
      const entry = { username: 'Alice', totalPoints: 200, rank: 1 };

      expect(service.isSameEntry(entry, null)).toBe(false);
    });

    it('returns false when rank differs', () => {
      const entry = { username: 'Alice', totalPoints: 200, rank: 1 };
      const other = { username: 'Alice', totalPoints: 200, rank: 2 };

      expect(service.isSameEntry(entry, other)).toBe(false);
    });
  });
});
