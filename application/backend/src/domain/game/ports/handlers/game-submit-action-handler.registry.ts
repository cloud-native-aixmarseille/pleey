import type { UserId } from '../../../auth/entities/user';
import type { GameSession, GameSessionPin } from '../../entities/game-session';
import type { GameSessionState } from '../../entities/game-session-state';
import type { GameActionId } from '../../entities/game-stage';
import type { GuestId } from '../../entities/player-state';
import type { GameType } from '../../enums/game-type.enum';

export const GameSubmitActionHandlerRegistryProvider = Symbol('GameSubmitActionHandlerRegistry');

interface SubmitGameActionCommand {
  pin: GameSessionPin;
  userId?: UserId;
  guestId?: GuestId;
  actionId: GameActionId;
  timeLeft: number;
}

export interface GameSubmitActionHandlerInput {
  pin: GameSessionPin;
  state: GameSessionState;
  session: GameSession;
  gameType: GameType;
  dto: SubmitGameActionCommand;
  connectionId?: string;
}

export interface GameSubmitActionHandlerResult {
  isCorrect: boolean;
  points: number;
  correctActionIds: GameActionId[];
}

export interface GameSubmitActionHandler {
  submit(input: GameSubmitActionHandlerInput): Promise<GameSubmitActionHandlerResult>;
}

export interface GameSubmitActionHandlerRegistry {
  resolve(gameType: GameType): GameSubmitActionHandler;
}
