import { NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import {
  createGameSessionRepositoryMock,
  createScoreRepositoryMock,
} from '../../../test-utils/mock-factories';

import { GetLeaderboardUseCase } from './get-leaderboard.use-case';

describe('GetLeaderboardUseCase', () => {
  it('throws when session is not found', async () => {
    const scoreRepository = createScoreRepositoryMock();
    const sessionRepository = createGameSessionRepositoryMock({ findByPin: null });
    const useCase = new GetLeaderboardUseCase(scoreRepository as never, sessionRepository as never);
    await expect(useCase.execute('123456')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns leaderboard for session', async () => {
    const scoreRepository = createScoreRepositoryMock({
      getLeaderboard: [{ userId: 1, username: 'alice', totalScore: 10 }] as never,
    });
    const sessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 99 } as never,
    });
    const useCase = new GetLeaderboardUseCase(scoreRepository as never, sessionRepository as never);
    const result = await useCase.execute('123456');
    expect(scoreRepository.getLeaderboard).toHaveBeenCalledWith(99);
    expect(result).toEqual([{ userId: 1, username: 'alice', totalScore: 10 }]);
  });
});
