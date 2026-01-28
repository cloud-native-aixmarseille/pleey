import { describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { createGameSessionFixture } from '../../../../../test-utils/fixtures/unit/game-session.fixture';
import { createGameRepositoryMock } from '../../../../../test-utils/mock-factories/game-repository.mock-factory';
import { createGameSessionRepositoryMock } from '../../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { HostStageControlContextService } from './host-stage-control-context-service';

describe('HostStageControlContextService', () => {
  it('throws when the requester is not the host', async () => {
    const state = { sessionId: 1 };
    const service = new HostStageControlContextService(
      createGameSessionStateServiceMock({ getOrCreate: state as never }) as never,
      createGameSessionRepositoryMock({
        findByPin: createGameSessionFixture({ hostId: 42 }) as never,
      }) as never,
      createGameRepositoryMock() as never,
    );

    await expect(service.load('123456', 7)).rejects.toThrow(
      GameErrorCode.UNAUTHORIZED_SESSION_CONTROL,
    );
  });

  it('loads the game when it exists', async () => {
    const game = { id: 9, type: 'QUIZ' };
    const service = new HostStageControlContextService(
      createGameSessionStateServiceMock() as never,
      createGameSessionRepositoryMock() as never,
      createGameRepositoryMock({ findById: game as never }) as never,
    );

    await expect(service.loadGame(9)).resolves.toEqual(game);
  });
});
