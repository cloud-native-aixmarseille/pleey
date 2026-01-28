import type { UserId } from '../../../domain/auth/entities/user';
import { PlayerScore } from '../../../domain/game/entities/player-score';
import type { GuestId } from '../../../domain/game/entities/player-state';

export type PlayerScoreFixtureParams = {
  playerId?: string;
  userId?: UserId;
  guestId?: GuestId;
  username?: string;
  totalPoints?: number;
};

export const createPlayerScoreFixture = (params: PlayerScoreFixtureParams = {}): PlayerScore => {
  const hasUserId = params.userId !== undefined;

  const identity = hasUserId
    ? { userId: params.userId as UserId }
    : { guestId: (params.guestId ?? 'guest-1') as GuestId };

  return PlayerScore.create({
    playerId: params.playerId ?? (hasUserId ? `user-${params.userId ?? 1}` : 'guest-1'),
    username: params.username ?? 'alice',
    totalPoints: params.totalPoints ?? 100,
    ...identity,
  });
};
