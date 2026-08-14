import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { CreatePartyUseCase } from '../../../../application/game/party/host/use-cases/create-party-use-case';
import { ListPartiesUseCase } from '../../../../application/game/party/shared/use-cases/list-parties-use-case';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { PartyManagementResolver } from './party-management-resolver';
import { CreatePartyInput } from './types/create-party-input';
import { ListPartiesInput } from './types/list-parties-input';

const gameIdentifier = new GameIdentifier();
const HOST_USER_ID = backendTestIdentifiers.user(42);

describe('PartyManagementResolver', () => {
  function arrangeResolver() {
    const createPartyUseCase = {
      execute: vi.fn().mockResolvedValue({
        partyId: backendTestIdentifiers.party(14),
        gameId: backendTestIdentifiers.game(11),
        pin: '123456',
        status: 'WAITING',
        role: 'HOST',
        createdAt: new Date('2026-03-12T00:00:00.000Z'),
      }),
    };
    const listPartiesUseCase = {
      execute: vi.fn().mockResolvedValue({
        items: [
          {
            partyId: backendTestIdentifiers.party(14),
            gameId: backendTestIdentifiers.game(11),
            pin: '123456',
            status: 'WAITING',
            role: 'HOST',
            createdAt: new Date('2026-03-12T00:00:00.000Z'),
          },
        ],
        totalCount: 1,
        overallCount: 1,
        page: 1,
        pageSize: 25,
        totalPages: 1,
      }),
    };
    const resolver = new PartyManagementResolver(
      createPartyUseCase as unknown as CreatePartyUseCase,
      listPartiesUseCase as unknown as ListPartiesUseCase,
      gameIdentifier,
    );

    return { resolver, createPartyUseCase, listPartiesUseCase };
  }

  it('maps createParty to the host-authenticated use case input', async () => {
    // Arrange
    const { resolver, createPartyUseCase } = arrangeResolver();
    const input = new CreatePartyInput();
    input.gameId = backendTestIdentifiers.game(11);
    input.privatePartyPassword = 'secret42';

    // Act
    const result = await resolver.createParty(input, {
      req: {
        user: {
          id: HOST_USER_ID,
        },
      },
    });

    // Assert
    expect(createPartyUseCase.execute).toHaveBeenCalledWith({
      gameId: backendTestIdentifiers.game(11),
      hostUserId: HOST_USER_ID,
      privatePartyPassword: 'secret42',
    });
    expect(result.partyId).toBe(backendTestIdentifiers.party(14));
  });

  it('maps listParties to the authenticated user input', async () => {
    // Arrange
    const { resolver, listPartiesUseCase } = arrangeResolver();
    const input = new ListPartiesInput();
    input.page = 2;
    input.pageSize = 10;

    // Act
    const result = await resolver.listParties(input, {
      req: {
        user: {
          id: HOST_USER_ID,
        },
      },
    });

    // Assert
    expect(listPartiesUseCase.execute).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      userId: HOST_USER_ID,
    });
    expect(result).toEqual({
      items: [
        {
          partyId: backendTestIdentifiers.party(14),
          gameId: backendTestIdentifiers.game(11),
          pin: '123456',
          status: 'WAITING',
          role: 'HOST',
          createdAt: new Date('2026-03-12T00:00:00.000Z'),
        },
      ],
      totalCount: 1,
      overallCount: 1,
      page: 1,
      pageSize: 25,
      totalPages: 1,
    });
  });
});
