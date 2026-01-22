import { Injectable } from '@nestjs/common';
import { GameErrorCode } from '../enums/game-error-code.enum';

const TIMER_MULTIPLIER_MS = 1000;

@Injectable()
export class AnswerRevealPolicy {
  getRevealDelayMs(timeSeconds: number): number {
    if (!Number.isFinite(timeSeconds)) {
      throw new Error(GameErrorCode.INVALID_REVEAL_DELAY);
    }
    if (timeSeconds <= 0) {
      return 0;
    }
    return Math.floor(timeSeconds * TIMER_MULTIPLIER_MS);
  }
}
