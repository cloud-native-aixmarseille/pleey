import { describe, expect, it } from 'vitest';
import { GAME_ERROR_DEFINITIONS, GameErrorCode } from '../../game/enums/game-error-code.enum';
import { GameNotFoundError } from '../../game/errors';
import { createDomainError } from './domain-error';

describe('DomainError', () => {
  it('stores the provided context for generic domain errors', () => {
    // Arrange
    const context = { gameId: 'game-1' };

    // Act
    const error = createDomainError(GAME_ERROR_DEFINITIONS[GameErrorCode.GAME_NOT_FOUND], context);

    // Assert
    expect(error.context).toEqual(context);
    expect(error.code).toBe(GameErrorCode.GAME_NOT_FOUND);
    expect(error.messageKey).toBe('game.errors.gameNotFound');
  });

  it('allows dedicated domain error subclasses to expose context', () => {
    // Arrange
    const context = { gameId: 'game-1' };

    // Act
    const error = new GameNotFoundError(context);

    // Assert
    expect(error.context).toEqual(context);
    expect(error.message).toBe(GameErrorCode.GAME_NOT_FOUND);
  });
});
