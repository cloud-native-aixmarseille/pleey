import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListPartiesUseCase } from './list-parties-use-case';

describe('ListPartiesUseCase', () => {
  const partyManagement = { listUserParties: vi.fn() };

  let useCase: ListPartiesUseCase;

  beforeEach(() => {
    partyManagement.listUserParties.mockReset();

    partyManagement.listUserParties.mockResolvedValue([
      {
        partyId: 10,
        gameId: 17,
        pin: '123456',
        status: 'WAITING',
        role: 'HOST',
        createdAt: new Date('2026-04-13T09:00:00.000Z'),
      },
    ]);

    useCase = new ListPartiesUseCase(partyManagement as never);
  });

  it('lists all host-owned and player-related parties for the authenticated user', async () => {
    const result = await useCase.execute({ userId: 42 });

    expect(partyManagement.listUserParties).toHaveBeenCalledWith({ userId: 42 });
    expect(result).toHaveLength(1);
  });
});
