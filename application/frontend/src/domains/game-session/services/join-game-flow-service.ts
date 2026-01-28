import { injectable } from 'inversify';
import { GameJoinErrorCode } from '../errors/game-join-error-code';

@injectable()
export class JoinGameFlowService {
  static readonly expectedPinLength = 6;

  constructor(readonly expectedPinLength = JoinGameFlowService.expectedPinLength) {}

  normalizePin(pin?: string): string {
    return (pin ?? '').trim().toUpperCase();
  }

  truncatePin(pin?: string): string {
    return this.normalizePin(pin).slice(0, this.expectedPinLength);
  }

  isPinComplete(pin: string): boolean {
    return this.normalizePin(pin).length === this.expectedPinLength;
  }

  validatePin(pin: string): GameJoinErrorCode | null {
    const normalized = this.normalizePin(pin);

    if (normalized.length === 0) {
      return GameJoinErrorCode.PIN_REQUIRED;
    }

    if (!this.isPinComplete(normalized)) {
      return GameJoinErrorCode.PIN_INVALID;
    }

    return null;
  }

  sanitizeDisplayName(value?: string): string {
    return (value ?? '').trim();
  }

  hasDisplayName(value?: string): boolean {
    return this.sanitizeDisplayName(value).length > 0;
  }

  hasPlayerIdentity(isAuthenticated: boolean, guestNickname?: string): boolean {
    return isAuthenticated || this.hasDisplayName(guestNickname);
  }
}
