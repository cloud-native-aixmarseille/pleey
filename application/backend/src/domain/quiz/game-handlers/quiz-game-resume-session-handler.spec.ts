import { describe, expect, it } from 'vitest';
import { createGameSessionFixture } from '../../../test-utils/fixtures/unit/game-session.fixture';
import { createGameSessionRepositoryMock } from '../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { GameSessionStatus } from '../../game/enums/game-session-status.enum';
import { QuizGameResumeSessionHandler } from './quiz-game-resume-session-handler';

describe('QuizGameResumeSessionHandler', () => {
  it('resumes a paused session and persists status', async () => {
    const mockSession = createGameSessionFixture({ status: GameSessionStatus.PAUSED });
    const gameSessionRepository = createGameSessionRepositoryMock({
      updateStatus: mockSession as never,
    });

    const handler = new QuizGameResumeSessionHandler(gameSessionRepository as never);

    const result = await handler.resumeSession({
      session: mockSession,
      sessionId: 1,
      hostId: 1,
    });

    expect(result.status).toBe(GameSessionStatus.ACTIVE);
    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, GameSessionStatus.ACTIVE);
  });

  it('throws when resuming a non-paused session', async () => {
    const mockSession = createGameSessionFixture({ status: GameSessionStatus.ACTIVE });
    const gameSessionRepository = createGameSessionRepositoryMock();

    const handler = new QuizGameResumeSessionHandler(gameSessionRepository as never);

    await expect(
      handler.resumeSession({ session: mockSession, sessionId: 1, hostId: 1 }),
    ).rejects.toThrow('CAN_ONLY_RESUME_PAUSED_GAME');
  });

  it('throws when resuming an ended session', async () => {
    const mockSession = createGameSessionFixture({ status: GameSessionStatus.ENDED });
    const gameSessionRepository = createGameSessionRepositoryMock();

    const handler = new QuizGameResumeSessionHandler(gameSessionRepository as never);

    await expect(
      handler.resumeSession({ session: mockSession, sessionId: 1, hostId: 1 }),
    ).rejects.toThrow('CAN_ONLY_RESUME_PAUSED_GAME');
  });
});
