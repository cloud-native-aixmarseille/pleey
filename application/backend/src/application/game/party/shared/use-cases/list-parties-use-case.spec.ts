import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { ListPartiesUseCase } from './list-parties-use-case';

describe('ListPartiesUseCase', () => {
  const partyManagement = { listUserParties: vi.fn() };

  let useCase: ListPartiesUseCase;

  beforeEach(() => {
    partyManagement.listUserParties.mockReset();

    partyManagement.listUserParties.mockResolvedValue({
      items: [
        {
          partyId: 10,
          gameId: 17,
          pin: '123456',
          status: 'WAITING',
          role: 'HOST',
          createdAt: new Date('2026-04-13T09:00:00.000Z'),
        },
      ],
      totalCount: 1,
      overallCount: 1,
      page: 1,
      pageSize: 25,
      totalPages: 1,
    });

    useCase = new ListPartiesUseCase(partyManagement as never);
  });

  it('lists all host-owned and player-related parties for the authenticated user', async () => {
    const result = await useCase.execute({ userId: backendTestIdentifiers.user(42) });

    expect(partyManagement.listUserParties).toHaveBeenCalledWith({
      userId: backendTestIdentifiers.user(42),
      page: 1,
      pageSize: 25,
    });
    expect(result.items).toHaveLength(1);
  });
});
