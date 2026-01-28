import { describe, expect, it } from 'vitest';
import { GamePlayingErrorCode } from '../errors/game-playing-error-code';
import { GamePlayingErrorResolutionService } from './game-playing-error-resolution.service';

describe('GamePlayingErrorResolutionService', () => {
  const service = new GamePlayingErrorResolutionService();

  it('maps legacy session-not-found payloads to the domain playing error code', () => {
    expect(service.resolve('GAME_SESSION_NOT_FOUND')).toBe(GamePlayingErrorCode.GAME_NOT_FOUND);
    expect(service.resolve(new Error('GAME_SESSION_NOT_FOUND'))).toBe(
      GamePlayingErrorCode.GAME_NOT_FOUND,
    );
  });

  it('passes through known playing error codes', () => {
    expect(service.resolve(GamePlayingErrorCode.GAME_SESSION_ENDED)).toBe(
      GamePlayingErrorCode.GAME_SESSION_ENDED,
    );
  });

  it('falls back to UNKNOWN for unsupported values', () => {
    expect(service.resolve('OTHER_ERROR')).toBe(GamePlayingErrorCode.UNKNOWN);
    expect(service.resolve({ reason: 'unexpected' })).toBe(GamePlayingErrorCode.UNKNOWN);
  });
});
