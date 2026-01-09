import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { GetLeaderboardUseCase } from './get-leaderboard.use-case';

describe('GetLeaderboardUseCase', () => {
  it('throws when session is not found', async () => {
    const scoreRepository = {
      getLeaderboard: vi.fn(),
    };
    const sessionRepository = {
      findByPin: vi.fn().mockResolvedValue(null),
    };
    const useCase = new GetLeaderboardUseCase(scoreRepository as never, sessionRepository as never);
    await expect(useCase.execute('123456')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns leaderboard for session', async () => {
    const scoreRepository = {
      getLeaderboard: vi.fn().mockResolvedValue([{ userId: 1, username: 'alice', totalScore: 10 }]),
    };
    const sessionRepository = {
      findByPin: vi.fn().mockResolvedValue({ id: 99 }),
    };
    const useCase = new GetLeaderboardUseCase(scoreRepository as never, sessionRepository as never);
    const result = await useCase.execute('123456');
    expect(scoreRepository.getLeaderboard).toHaveBeenCalledWith(99);
    expect(result).toEqual([{ userId: 1, username: 'alice', totalScore: 10 }]);
  });
});
