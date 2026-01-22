import { Inject, Injectable, Logger } from '@nestjs/common';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import type {
  GameTimerService,
  TimerCallback,
} from '../../../domain/game/ports/game-timer.service';

/**
 * Implementation of GameTimerService using Node.js setTimeout.
 * Manages answer reveal timers for game sessions.
 */
@Injectable()
export class NodeGameTimerService implements GameTimerService {
  private readonly timers = new Map<GameSessionPin, NodeJS.Timeout>();

  constructor(@Inject(Logger) private readonly logger: Logger) {}

  setAnswerRevealTimer(pin: GameSessionPin, delayMs: number, callback: TimerCallback): void {
    // Clear existing timer if any
    this.clearAnswerRevealTimer(pin);

    const timer = setTimeout(() => {
      this.timers.delete(pin);
      callback().catch((error) => {
        const trace = error instanceof Error ? error.stack : undefined;
        this.logger.error(
          `Error in timer callback for pin ${pin}`,
          trace,
          NodeGameTimerService.name,
        );
      });
    }, delayMs);

    this.timers.set(pin, timer);
  }

  clearAnswerRevealTimer(pin: GameSessionPin): void {
    const timer = this.timers.get(pin);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(pin);
    }
  }

  hasTimer(pin: GameSessionPin): boolean {
    return this.timers.has(pin);
  }

  clearAll(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
