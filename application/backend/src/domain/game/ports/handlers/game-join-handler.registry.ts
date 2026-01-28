import type { UserId } from '../../../auth/entities/user';
import type { GameSession, GameSessionPin } from '../../entities/game-session';
import type { GameSessionState } from '../../entities/game-session-state';
import type { GuestId } from '../../entities/player-state';
import type { GameType } from '../../enums/game-type.enum';

export const GameJoinHandlerRegistryProvider = Symbol('GameJoinHandlerRegistry');

export interface JoinGameCommand {
  pin: GameSessionPin;
  username: string;
  userId?: UserId;
  guestId?: GuestId;
}

export interface GameJoinHandlerInput {
  connectionId: string;
  dto: JoinGameCommand;
  pin: GameSessionPin;
  state: GameSessionState;
  session: GameSession;
}

export interface GameJoinHandler {
  join(input: GameJoinHandlerInput): Promise<void>;
}

export interface GameJoinHandlerRegistry {
  resolve(gameType: GameType): GameJoinHandler;
}
