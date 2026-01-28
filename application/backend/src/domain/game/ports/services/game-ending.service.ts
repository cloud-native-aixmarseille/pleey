import type { GameSessionPin } from '../../entities/game-session';
import type { GameSessionState } from '../../entities/game-session-state';

export const GameEndingServiceProvider = Symbol('GameEndingService');

export interface GameEndingService {
  endGame(pin: GameSessionPin, state: GameSessionState): Promise<void>;
}
