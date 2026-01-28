import type { JoinGameDto } from '../../../application/game-session/live/player/dto/join-game-dto';
import type { UserId } from '../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import type { GuestId } from '../../../domain/game/entities/player-state';

export type JoinGameDtoFixtureParams = Partial<JoinGameDto> & {
  pin?: GameSessionPin;
  username?: string;
  userId?: UserId;
  guestId?: GuestId;
};

export const createJoinGameDtoFixture = (params: JoinGameDtoFixtureParams = {}): JoinGameDto => ({
  pin: '123456',
  username: 'player',
  guestId: 'guest-1' as GuestId,
  ...params,
});
