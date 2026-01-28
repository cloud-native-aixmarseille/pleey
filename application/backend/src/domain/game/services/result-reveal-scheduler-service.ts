import { Inject, Injectable } from '@nestjs/common';
import type { GameSessionPin } from '../entities/game-session';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../ports/services/game-timer.service';
import {
  type ResultRevealService,
  ResultRevealServiceProvider,
} from '../ports/services/result-reveal.service';
import { ResultRevealPolicy } from './result-reveal-policy';

@Injectable()
export class ResultRevealSchedulerService {
  constructor(
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    private readonly resultRevealPolicy: ResultRevealPolicy,
    @Inject(ResultRevealServiceProvider)
    private readonly resultRevealService: ResultRevealService,
  ) {}

  clear(pin: GameSessionPin): void {
    this.timerService.clearResultRevealTimer(pin);
  }

  schedule(pin: GameSessionPin, timeSeconds: number): void {
    const delayMs = this.resultRevealPolicy.getRevealDelayMs(timeSeconds);
    this.timerService.clearResultRevealTimer(pin);
    this.timerService.setResultRevealTimer(pin, delayMs, async () => {
      await this.resultRevealService.execute(pin);
    });
  }
}
