import { describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { createGameRepositoryMock } from '../../../../../test-utils/mock-factories/game-repository.mock-factory';
import { createGameSessionRepositoryMock } from '../../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { GameSessionPinContextService } from './game-session-pin-context-service';

describe('GameSessionPinContextService', () => {
  it('loads state, session, and game for an active pin context', async () => {
    const state = { sessionId: 1 };
    const session = { id: 1, gameId: 9 };
    const game = { id: 9, type: 'QUIZ' };
    const service = new GameSessionPinContextService(
      createGameSessionStateServiceMock({ getOrCreate: state as never }) as never,
      createGameSessionRepositoryMock({ findByPin: session as never }) as never,
      createGameRepositoryMock({ findById: game as never }) as never,
    );

    await expect(service.load('123456')).resolves.toEqual({ state, session, game });
  });

  it('returns undefined for loadExisting when no state has been initialized', async () => {
    const service = new GameSessionPinContextService(
      createGameSessionStateServiceMock({ get: undefined }) as never,
      createGameSessionRepositoryMock() as never,
      createGameRepositoryMock() as never,
    );

    await expect(service.loadExisting('123456')).resolves.toBeUndefined();
  });

  it('throws when the session is missing for an initialized pin', async () => {
    const state = { sessionId: 1 };
    const service = new GameSessionPinContextService(
      createGameSessionStateServiceMock({ getOrCreate: state as never }) as never,
      createGameSessionRepositoryMock({ findByPin: null }) as never,
      createGameRepositoryMock() as never,
    );

    await expect(service.load('123456')).rejects.toThrow(GameErrorCode.GAME_SESSION_NOT_FOUND);
  });
});
