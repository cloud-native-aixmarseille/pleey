import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Party, PartyId } from '../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../domains/game/party/shared/entities/party-observation';
import { PartyRole } from '../../../../domains/game/party/shared/entities/party-role';
import { PartyStatus } from '../../../../domains/game/party/shared/entities/party-status';
import { PartyFixtureFactory } from '../../../../test-utils/fixtures/party-fixture-factory';
import { usePartySync } from './use-party-sync';

const partyFixtureFactory = new PartyFixtureFactory();

const mocks = vi.hoisted(() => ({
  currentParty: null as PartyObservation | null,
  getPartyByPartyId: vi.fn(),
  observePartyById: vi.fn(() => vi.fn()),
}));

vi.mock('../../../game/party/shared/contexts/party-context', () => ({
  useParty: () => mocks,
}));

function createParty(overrides: Partial<Party> = {}): Party {
  return partyFixtureFactory.createParty({
    partyId: 1,
    gameId: 17,
    pin: 'AB12CD',
    status: PartyStatus.WAITING,
    role: PartyRole.HOST,
    createdAt: '2026-04-22T10:00:00.000Z',
    ...overrides,
  });
}

describe('usePartySync', () => {
  it('observes only the current party', () => {
    const upsertParty = vi.fn();

    mocks.observePartyById.mockClear();
    mocks.currentParty = null;
    mocks.getPartyByPartyId.mockReset();

    renderHook(() =>
      usePartySync({
        currentParty: createParty({
          partyId: partyFixtureFactory.createParty({ partyId: 3 }).partyId,
          pin: partyFixtureFactory.createParty({ pin: 'ACTIVE1' }).pin,
          status: PartyStatus.ACTIVE,
        }),
        upsertParty,
      }),
    );

    expect(mocks.observePartyById).toHaveBeenCalledTimes(1);
    expect(mocks.observePartyById).toHaveBeenCalledWith(
      partyFixtureFactory.createParty({ partyId: 3 }).partyId,
    );
    expect(mocks.observePartyById).not.toHaveBeenCalledWith(
      partyFixtureFactory.createParty({ partyId: 1 }).partyId,
    );
    expect(mocks.observePartyById).not.toHaveBeenCalledWith(
      partyFixtureFactory.createParty({ partyId: 2 }).partyId,
    );
  });

  it('projects observations only for the current party', () => {
    const upsertParty = vi.fn();
    const activeParty = createParty({
      partyId: partyFixtureFactory.createParty({ partyId: 1 }).partyId,
      pin: partyFixtureFactory.createParty({ pin: 'ACTIVE1' }).pin,
      status: PartyStatus.WAITING,
    });

    mocks.observePartyById.mockClear();
    mocks.getPartyByPartyId.mockImplementation((partyId?: PartyId | null) => {
      if (partyId === partyFixtureFactory.createParty({ partyId: 1 }).partyId) {
        return partyFixtureFactory.createPartyObservation({
          partyId: 1,
          pin: 'ACTIVE1',
          status: PartyStatus.ACTIVE,
          players: [],
        });
      }

      return null;
    });

    mocks.currentParty = partyFixtureFactory.createPartyObservation({
      partyId: 1,
      pin: 'ACTIVE1',
      status: PartyStatus.ACTIVE,
      players: [],
    });

    renderHook(() =>
      usePartySync({
        currentParty: activeParty,
        upsertParty,
      }),
    );

    expect(upsertParty).toHaveBeenCalledTimes(1);
    expect(upsertParty).toHaveBeenCalledWith({
      ...activeParty,
      status: PartyStatus.ACTIVE,
    });
  });

  it('does not observe anything when there is no current party', () => {
    const upsertParty = vi.fn();

    mocks.observePartyById.mockClear();
    mocks.currentParty = null;
    mocks.getPartyByPartyId.mockReset();

    renderHook(() =>
      usePartySync({
        currentParty: null,
        upsertParty,
      }),
    );

    expect(mocks.observePartyById).not.toHaveBeenCalled();
    expect(upsertParty).not.toHaveBeenCalled();
  });
});
