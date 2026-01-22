import type { UserId } from '../../../domain/auth/entities/user.entity';
import { type GuestId, PlayerState } from '../../../domain/game/entities/player-state';

export type PlayerStateFixtureParams = {
  socketId?: string;
  userId?: UserId;
  guestId?: GuestId;
  username?: string;
  avatarSeed?: string;
};

export const createPlayerStateFixture = (params: PlayerStateFixtureParams = {}): PlayerState => {
  const socketId = params.socketId ?? 'socket-1';
  const username = params.username ?? 'player';
  const avatarSeed = params.avatarSeed ?? 'seed-1';

  if (params.userId !== undefined) {
    return PlayerState.createAuthenticated(socketId, params.userId, username, avatarSeed);
  }

  return PlayerState.createGuest(socketId, params.guestId ?? 'guest-1', username, avatarSeed);
};
