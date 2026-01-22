/**
 * PIN Value Object
 * Represents a game session PIN with validation
 */
import { GameErrorCode } from '../enums/game-error-code.enum';
import type { GameSessionPin } from './game-session';

export class PIN {
  private readonly value: GameSessionPin;

  constructor(pin: GameSessionPin) {
    this.validate(pin);
    this.value = pin;
  }

  private validate(pin: GameSessionPin): void {
    if (!/^\d{6}$/.test(pin)) {
      throw new Error(GameErrorCode.INVALID_PIN);
    }
  }

  getValue(): GameSessionPin {
    return this.value;
  }

  equals(other: PIN): boolean {
    return this.value === other.getValue();
  }

  static generate(): PIN {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    return new PIN(pin);
  }
}
