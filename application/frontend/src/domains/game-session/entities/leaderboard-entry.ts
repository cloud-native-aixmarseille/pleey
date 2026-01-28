export interface LeaderboardEntry {
  readonly avatarUri?: string | null;
  readonly userId?: number;
  readonly guestId?: string;
  readonly username: string;
  readonly totalPoints: number;
  readonly rank: number;
}
