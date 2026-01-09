import { Injectable } from '@nestjs/common';

const TIMER_MULTIPLIER_MS = 1000;

@Injectable()
export class AnswerRevealPolicy {
  getRevealDelayMs(timeSeconds: number): number {
    if (!Number.isFinite(timeSeconds)) {
      throw new Error('timeSeconds must be a finite number');
    }
    if (timeSeconds <= 0) {
      return 0;
    }
    return Math.floor(timeSeconds * TIMER_MULTIPLIER_MS);
  }
}
