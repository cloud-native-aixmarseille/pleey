import { describe, expect, it } from 'vitest';
import { GameJoinErrorCode } from '../errors/game-join-error-code';
import { GameJoinErrorResolutionService } from './game-join-error-resolution.service';

describe('GameJoinErrorResolutionService', () => {
  const service = new GameJoinErrorResolutionService();

  it('passes through known join error codes', () => {
    expect(service.resolve(new Error(GameJoinErrorCode.PIN_INVALID))).toBe(
      GameJoinErrorCode.PIN_INVALID,
    );
  });

  it('falls back to UNKNOWN for unsupported values', () => {
    expect(service.resolve(new Error('OTHER_ERROR'))).toBe(GameJoinErrorCode.UNKNOWN);
    expect(service.resolve('PIN_INVALID')).toBe(GameJoinErrorCode.UNKNOWN);
  });
});
