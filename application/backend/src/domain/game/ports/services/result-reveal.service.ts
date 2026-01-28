import type { GameSessionPin } from '../../entities/game-session';

export const ResultRevealServiceProvider = Symbol('ResultRevealService');

export interface ResultRevealService {
  execute(pin: GameSessionPin): Promise<void>;
}
