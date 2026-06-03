import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreatePartyUseCase } from '../../../../application/game/party/host/use-cases/create-party-use-case';
import { ListPartiesUseCase } from '../../../../application/game/party/shared/use-cases/list-parties-use-case';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { PartyManagementResolver } from './party-management-resolver';
import { CreatePartyInput } from './types/create-party-input';
import { ListPartiesInput } from './types/list-parties-input';

const gameIdentifier = new GameIdentifier();

describe('PartyManagementResolver', () => {
  const createPartyUseCase = { execute: vi.fn() };
  const listPartiesUseCase = { execute: vi.fn() };
  let resolver: PartyManagementResolver;

  beforeEach(() => {
    createPartyUseCase.execute.mockReset();
    listPartiesUseCase.execute.mockReset();

    createPartyUseCase.execute.mockResolvedValue({
      partyId: backendTestIdentifiers.party(14),
      gameId: backendTestIdentifiers.game(11),
      pin: '123456',
      status: 'WAITING',
      role: 'HOST',
      createdAt: new Date('2026-03-12T00:00:00.000Z'),
    });
    listPartiesUseCase.execute.mockResolvedValue({
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

    resolver = new PartyManagementResolver(
      createPartyUseCase as unknown as CreatePartyUseCase,
      listPartiesUseCase as unknown as ListPartiesUseCase,
      gameIdentifier,
    );
  });

  it('maps createParty to the host-authenticated use case input', async () => {
    const input = new CreatePartyInput();
    input.gameId = backendTestIdentifiers.game(11);

    const result = await resolver.createParty(input, {
      req: {
        user: {
          id: backendTestIdentifiers.user(42),
        },
      },
    });

    expect(createPartyUseCase.execute).toHaveBeenCalledWith({
      gameId: backendTestIdentifiers.game(11),
      hostUserId: backendTestIdentifiers.user(42),
    });
    expect(result.partyId).toBe(backendTestIdentifiers.party(14));
  });

  it('maps listParties to the authenticated user input', async () => {
    const input = new ListPartiesInput();
    input.page = 2;
    input.pageSize = 10;

    const result = await resolver.listParties(input, {
      req: {
        user: {
          id: backendTestIdentifiers.user(42),
        },
      },
    });

    expect(listPartiesUseCase.execute).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      userId: backendTestIdentifiers.user(42),
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
