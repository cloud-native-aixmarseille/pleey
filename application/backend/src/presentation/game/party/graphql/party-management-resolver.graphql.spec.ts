import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreatePartyUseCase } from '../../../../application/game/party/host/use-cases/create-party-use-case';
import { ListPartiesUseCase } from '../../../../application/game/party/shared/use-cases/list-parties-use-case';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { PartyManagementResolver } from './party-management-resolver';
import { CreatePartyInput } from './types/create-party-input';

const gameIdentifier = new GameIdentifier();

describe('PartyManagementResolver', () => {
  const createPartyUseCase = { execute: vi.fn() };
  const listPartiesUseCase = { execute: vi.fn() };
  let resolver: PartyManagementResolver;

  beforeEach(() => {
    createPartyUseCase.execute.mockReset();
    listPartiesUseCase.execute.mockReset();

    createPartyUseCase.execute.mockResolvedValue({
      partyId: 14,
      gameId: 11,
      pin: '123456',
      status: 'WAITING',
      role: 'HOST',
      createdAt: new Date('2026-03-12T00:00:00.000Z'),
    });
    listPartiesUseCase.execute.mockResolvedValue([
      {
        partyId: 14,
        gameId: 11,
        pin: '123456',
        status: 'WAITING',
        role: 'HOST',
        createdAt: new Date('2026-03-12T00:00:00.000Z'),
      },
    ]);

    resolver = new PartyManagementResolver(
      createPartyUseCase as unknown as CreatePartyUseCase,
      listPartiesUseCase as unknown as ListPartiesUseCase,
      gameIdentifier,
    );
  });

  it('maps createParty to the host-authenticated use case input', async () => {
    const input = new CreatePartyInput();
    input.gameId = 11;

    const result = await resolver.createParty(input, {
      req: {
        user: {
          id: backendTestIdentifiers.user(42),
        },
      },
    });

    expect(createPartyUseCase.execute).toHaveBeenCalledWith({
      gameId: 11,
      hostUserId: backendTestIdentifiers.user(42),
    });
    expect(result.partyId).toBe(14);
  });

  it('maps listParties to the authenticated user input', async () => {
    const result = await resolver.listParties({
      req: {
        user: {
          id: backendTestIdentifiers.user(42),
        },
      },
    });

    expect(listPartiesUseCase.execute).toHaveBeenCalledWith({
      userId: backendTestIdentifiers.user(42),
    });
    expect(result).toEqual([
      {
        partyId: 14,
        gameId: 11,
        pin: '123456',
        status: 'WAITING',
        role: 'HOST',
        createdAt: new Date('2026-03-12T00:00:00.000Z'),
      },
    ]);
  });
});
