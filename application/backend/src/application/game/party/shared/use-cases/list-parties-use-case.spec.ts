import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { ListPartiesUseCase } from './list-parties-use-case';

const USER_ID = backendTestIdentifiers.user(42);

describe('ListPartiesUseCase', () => {
  function arrangeUseCase() {
    const partyManagement = {
      listUserParties: vi.fn().mockResolvedValue({
        items: [
          {
            partyId: backendTestIdentifiers.party(10),
            gameId: backendTestIdentifiers.game(17),
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
      }),
    };
    const useCase = new ListPartiesUseCase(partyManagement as never);

    return { useCase, partyManagement };
  }

  it('lists all host-owned and player-related parties for the authenticated user', async () => {
    // Arrange
    const { useCase, partyManagement } = arrangeUseCase();

    // Act
    const result = await useCase.execute({ userId: USER_ID });

    // Assert
    expect(partyManagement.listUserParties).toHaveBeenCalledWith({
      userId: USER_ID,
      page: 1,
      pageSize: 25,
    });
    expect(result.items).toHaveLength(1);
  });
});
