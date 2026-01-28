import { describe, expect, it } from 'vitest';
import { GameLobbyErrorCode } from '../errors/game-lobby-error-code';
import { GameLobbyErrorResolutionService } from './game-lobby-error-resolution.service';

describe('GameLobbyErrorResolutionService', () => {
  const service = new GameLobbyErrorResolutionService();

  it('maps legacy session-not-found payloads to the domain lobby error code', () => {
    expect(service.resolve('GAME_SESSION_NOT_FOUND')).toBe(GameLobbyErrorCode.GAME_NOT_FOUND);
    expect(service.resolve(new Error('GAME_SESSION_NOT_FOUND'))).toBe(
      GameLobbyErrorCode.GAME_NOT_FOUND,
    );
  });

  it('passes through known lobby error codes', () => {
    expect(service.resolve(GameLobbyErrorCode.GAME_SESSION_ENDED)).toBe(
      GameLobbyErrorCode.GAME_SESSION_ENDED,
    );
  });

  it('falls back to UNKNOWN for unsupported values', () => {
    expect(service.resolve('OTHER_ERROR')).toBe(GameLobbyErrorCode.UNKNOWN);
    expect(service.resolve({ reason: 'unexpected' })).toBe(GameLobbyErrorCode.UNKNOWN);
  });
});
