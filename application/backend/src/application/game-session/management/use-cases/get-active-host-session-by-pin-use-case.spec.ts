import { beforeEach, describe, expect, it } from 'vitest';
import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import { createGameSessionFixture } from '../../../../test-utils/fixtures/unit/game-session.fixture';
import { createGameSessionRepositoryMock } from '../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { GetActiveHostSessionByPinUseCase } from './get-active-host-session-by-pin-use-case';

describe('GetActiveHostSessionByPinUseCase', () => {
  let useCase: GetActiveHostSessionByPinUseCase;
  let mockGameSessionRepository: ReturnType<typeof createGameSessionRepositoryMock>;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();
    useCase = new GetActiveHostSessionByPinUseCase(mockGameSessionRepository);
  });

  it('returns the owned session when it is waiting, active, or paused', async () => {
    const session = createGameSessionFixture({
      hostId: 7,
      pin: 'AB12CD',
      status: GameSessionStatus.ACTIVE,
    });

    mockGameSessionRepository.findByPin.mockResolvedValue(session);

    await expect(useCase.execute('AB12CD', 7)).resolves.toBe(session);
    expect(mockGameSessionRepository.findByPin).toHaveBeenCalledWith('AB12CD');
  });

  it('returns null when the session is owned by another host', async () => {
    mockGameSessionRepository.findByPin.mockResolvedValue(
      createGameSessionFixture({ hostId: 99, pin: 'AB12CD' }),
    );

    await expect(useCase.execute('AB12CD', 7)).resolves.toBeNull();
  });

  it('returns null when the session is ended', async () => {
    mockGameSessionRepository.findByPin.mockResolvedValue(
      createGameSessionFixture({ hostId: 7, pin: 'AB12CD', status: GameSessionStatus.ENDED }),
    );

    await expect(useCase.execute('AB12CD', 7)).resolves.toBeNull();
  });

  it('returns null when the session does not exist', async () => {
    mockGameSessionRepository.findByPin.mockResolvedValue(null);

    await expect(useCase.execute('AB12CD', 7)).resolves.toBeNull();
  });
});
