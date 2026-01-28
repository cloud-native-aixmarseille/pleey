import { describe, expect, it } from 'vitest';
import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import { createGameSessionFixture } from '../../../../test-utils/fixtures/unit/game-session.fixture';
import { createGameSessionRepositoryMock } from '../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { GetCurrentPlayerSessionUseCase } from './get-current-player-session-use-case';

describe('GetCurrentPlayerSessionUseCase', () => {
  it('returns null when the player has no active session pin', async () => {
    const gameSessionStateService = createGameSessionStateServiceMock({
      findPinByUserId: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock();
    const useCase = new GetCurrentPlayerSessionUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
    );

    await expect(useCase.execute(7)).resolves.toBeNull();
  });

  it('returns the active session resolved from the stored player pin', async () => {
    const session = createGameSessionFixture({ pin: 'AB12CD', status: GameSessionStatus.ACTIVE });
    const gameSessionStateService = createGameSessionStateServiceMock({
      findPinByUserId: 'AB12CD',
    });
    const gameSessionRepository = createGameSessionRepositoryMock({ findByPin: session });
    const useCase = new GetCurrentPlayerSessionUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
    );

    await expect(useCase.execute(7)).resolves.toEqual(session);
  });

  it('clears stale player-session mappings when the target session ended', async () => {
    const session = createGameSessionFixture({ pin: 'AB12CD', status: GameSessionStatus.ENDED });
    const gameSessionStateService = createGameSessionStateServiceMock({
      findPinByUserId: 'AB12CD',
    });
    const gameSessionRepository = createGameSessionRepositoryMock({ findByPin: session });
    const useCase = new GetCurrentPlayerSessionUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
    );

    await expect(useCase.execute(7)).resolves.toBeNull();
    expect(gameSessionStateService.removePinByUserId).toHaveBeenCalledWith(7);
  });
});
