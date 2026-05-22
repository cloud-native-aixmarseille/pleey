import { act, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { PartyManagementPort } from '../../../../../domains/game/party/host/ports/party-management.port';
import type { PartyGuestSessionPort } from '../../../../../domains/game/party/player/ports/party-guest-session.port';
import type { PartyPlayerPort } from '../../../../../domains/game/party/player/ports/party-player.port';
import type { PartyId } from '../../../../../domains/game/party/shared/entities/party';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';
import type {
  PartyObservationHandlers,
  PartyObservationPort,
} from '../../../../../domains/game/party/shared/ports/party-observation.port';
import { PartyRuntimeNoticeKind } from '../../../../../domains/game/party/shared/ports/party-observation.port';
import { PartyFixtureFactory } from '../../../../../test-utils/fixtures/party-fixture-factory';
import { PartyIdentifierMockFactory } from '../../../../../test-utils/mocks/party-identifier-mock-factory';
import { PartyPinIdentifierMockFactory } from '../../../../../test-utils/mocks/party-pin-identifier-mock-factory';
import { StageIdentifierMockFactory } from '../../../../../test-utils/mocks/stage-identifier-mock-factory';
import { PartyProvider, useParty } from './party-context';
import { type PartyDependencies, providePartyDependencies } from './party-dependencies-context';

const partyIdentifier: PartyDependencies['partyIdentifier'] =
  new PartyIdentifierMockFactory().create();
const partyPinIdentifier: PartyDependencies['partyPinIdentifier'] =
  new PartyPinIdentifierMockFactory().create();
const stageIdentifier: PartyDependencies['stageIdentifier'] =
  new StageIdentifierMockFactory().create();
const partyFixtureFactory = new PartyFixtureFactory();

function parsePartyId(value: number): PartyId {
  const partyId = partyIdentifier.parse(value);

  if (partyId === null) {
    throw new Error(`Expected a party id for ${value}`);
  }

  return partyId;
}

const partyManagementPort = {
  createParty: vi.fn(),
  listParties: vi.fn(),
} as unknown as PartyManagementPort;
const hostPartyRuntimeControlsResolver = {
  resolveControls: vi.fn(),
} as never;
const partyLobbyFacade = {
  clearGuestId: vi.fn(),
  executeHostRuntimeCommand: vi.fn(),
  getGuestId: vi.fn(() => null),
  joinParty: vi.fn(),
  leaveParty: vi.fn(),
  listParties: vi.fn(),
  rejoinParty: vi.fn(),
  setGuestId: vi.fn(),
  submitAction: vi.fn(),
} as never;
const partyHostControlPort = {
  advanceStage: vi.fn(),
  endParty: vi.fn(),
  pauseParty: vi.fn(),
  restartStage: vi.fn(),
  resumeParty: vi.fn(),
  revealStageResult: vi.fn(),
  rewindParty: vi.fn(),
  rewindStage: vi.fn(),
  startParty: vi.fn(),
} as never;
const partyGuestSessionPort = {
  clearGuestId: vi.fn(),
  getGuestId: vi.fn(() => null),
  setGuestId: vi.fn(),
} as PartyGuestSessionPort;
const partyPlayerPort = {
  joinParty: vi.fn(),
  leaveParty: vi.fn(),
  rejoinParty: vi.fn(),
} as unknown as PartyPlayerPort;
const partyObservationPort = {
  observeParty: vi.fn(),
} as unknown as PartyObservationPort;

describe('PartyProvider', () => {
  it('shares one underlying observation per party id and updates state from snapshots', () => {
    const observeParty = vi.fn((partyId: PartyId, handlers: PartyObservationHandlers) => {
      observeParty.handlers = handlers;
      observeParty.partyId = partyId;
      return vi.fn();
    }) as ((partyId: PartyId, handlers: PartyObservationHandlers) => () => void) & {
      handlers?: PartyObservationHandlers;
      partyId?: PartyId;
    };
    const wrapper = ({ children }: PropsWithChildren) =>
      providePartyDependencies(
        <PartyProvider port={{ observeParty } satisfies PartyObservationPort}>
          {children}
        </PartyProvider>,
        {
          hostPartyRuntimeControlsResolver,
          partyLobbyFacade,
          partyGuestSessionPort,
          partyIdentifier,
          partyHostControlPort,
          partyManagementPort,
          partyObservationPort,
          partyPinIdentifier,
          partyPlayerPort,
          stageIdentifier,
        },
      );
    const rendered = renderHook(
      () => ({
        first: useParty(),
        second: useParty(),
      }),
      { wrapper },
    );

    let releaseFirst: () => void;
    let releaseSecond: () => void;
    const observedPartyId = parsePartyId(44);

    act(() => {
      releaseFirst = rendered.result.current.first.observePartyById(observedPartyId);
      releaseSecond = rendered.result.current.second.observePartyById(observedPartyId);
    });

    expect(observeParty).toHaveBeenCalledTimes(1);
    expect(observeParty.partyId).toBe(observedPartyId);

    act(() => {
      observeParty.handlers?.onSnapshot(
        partyFixtureFactory.createPartyObservation({
          partyId: 44,
          pin: '123456',
          status: PartyStatus.ACTIVE,
          players: [],
        }),
      );
    });

    expect(rendered.result.current.first.currentParty?.partyId).toBe(observedPartyId);
    expect(rendered.result.current.second.currentParty?.partyId).toBe(observedPartyId);
    expect(rendered.result.current.first.getPartyByPartyId(observedPartyId)?.status).toBe('ACTIVE');
    expect(rendered.result.current.second.getPartyByPartyId(observedPartyId)?.status).toBe(
      'ACTIVE',
    );

    act(() => {
      releaseFirst();
      releaseSecond();
    });

    expect(rendered.result.current.first.currentParty).toBeNull();
  });

  it('observes parties by party id for host lobby routes', () => {
    const observeParty = vi.fn((partyId: PartyId, handlers: PartyObservationHandlers) => {
      observeParty.handlers = handlers;
      observeParty.partyId = partyId;
      return vi.fn();
    }) as ((partyId: PartyId, handlers: PartyObservationHandlers) => () => void) & {
      handlers?: PartyObservationHandlers;
      partyId?: PartyId;
    };
    const wrapper = ({ children }: PropsWithChildren) =>
      providePartyDependencies(
        <PartyProvider port={{ observeParty } satisfies PartyObservationPort}>
          {children}
        </PartyProvider>,
        {
          hostPartyRuntimeControlsResolver,
          partyLobbyFacade,
          partyGuestSessionPort,
          partyIdentifier,
          partyHostControlPort,
          partyManagementPort,
          partyObservationPort,
          partyPinIdentifier,
          partyPlayerPort,
          stageIdentifier,
        },
      );
    const rendered = renderHook(() => useParty(), { wrapper });
    const observedPartyId = parsePartyId(44);

    act(() => {
      rendered.result.current.observePartyById(observedPartyId);
    });

    expect(observeParty.partyId).toBe(observedPartyId);

    act(() => {
      observeParty.handlers?.onSnapshot(
        partyFixtureFactory.createPartyObservation({
          partyId: 44,
          pin: '123456',
          status: PartyStatus.WAITING,
          players: [],
        }),
      );
    });

    expect(rendered.result.current.currentParty?.pin).toBe('123456');
    expect(rendered.result.current.getPartyByPartyId(observedPartyId)?.pin).toBe('123456');
  });

  it('exposes observation errors by party id', () => {
    const observeParty = vi.fn((_: PartyId, handlers: PartyObservationHandlers) => {
      observeParty.handlers = handlers;
      return vi.fn();
    }) as ((partyId: PartyId, handlers: PartyObservationHandlers) => () => void) & {
      handlers?: PartyObservationHandlers;
    };
    const wrapper = ({ children }: PropsWithChildren) =>
      providePartyDependencies(
        <PartyProvider port={{ observeParty } satisfies PartyObservationPort}>
          {children}
        </PartyProvider>,
        {
          hostPartyRuntimeControlsResolver,
          partyLobbyFacade,
          partyGuestSessionPort,
          partyIdentifier,
          partyHostControlPort,
          partyManagementPort,
          partyObservationPort,
          partyPinIdentifier,
          partyPlayerPort,
          stageIdentifier,
        },
      );
    const rendered = renderHook(() => useParty(), { wrapper });
    const observedPartyId = parsePartyId(44);

    act(() => {
      rendered.result.current.observePartyById(observedPartyId);
      observeParty.handlers?.onError?.('game.party.errors.observeFailed');
    });

    expect(rendered.result.current.getErrorByPartyId(observedPartyId)).toBe(
      'game.party.errors.observeFailed',
    );
  });

  it('exposes runtime notices by party id', () => {
    const observeParty = vi.fn((_: PartyId, handlers: PartyObservationHandlers) => {
      observeParty.handlers = handlers;
      return vi.fn();
    }) as ((partyId: PartyId, handlers: PartyObservationHandlers) => () => void) & {
      handlers?: PartyObservationHandlers;
    };
    const wrapper = ({ children }: PropsWithChildren) =>
      providePartyDependencies(
        <PartyProvider port={{ observeParty } satisfies PartyObservationPort}>
          {children}
        </PartyProvider>,
        {
          hostPartyRuntimeControlsResolver,
          partyLobbyFacade,
          partyGuestSessionPort,
          partyIdentifier,
          partyHostControlPort,
          partyManagementPort,
          partyObservationPort,
          partyPinIdentifier,
          partyPlayerPort,
          stageIdentifier,
        },
      );
    const rendered = renderHook(() => useParty(), { wrapper });
    const observedPartyId = parsePartyId(44);

    act(() => {
      rendered.result.current.observePartyById(observedPartyId);
      observeParty.handlers?.onRuntimeNotice?.({
        kind: PartyRuntimeNoticeKind.RewindStage,
        partyId: observedPartyId,
      });
    });

    expect(rendered.result.current.getRuntimeNoticeByPartyId(observedPartyId)).toEqual({
      kind: PartyRuntimeNoticeKind.RewindStage,
      partyId: observedPartyId,
    });
  });

  it('consumes a runtime notice after it has been handled', () => {
    const observeParty = vi.fn((_: PartyId, handlers: PartyObservationHandlers) => {
      observeParty.handlers = handlers;
      return vi.fn();
    }) as ((partyId: PartyId, handlers: PartyObservationHandlers) => () => void) & {
      handlers?: PartyObservationHandlers;
    };
    const wrapper = ({ children }: PropsWithChildren) =>
      providePartyDependencies(
        <PartyProvider port={{ observeParty } satisfies PartyObservationPort}>
          {children}
        </PartyProvider>,
        {
          hostPartyRuntimeControlsResolver,
          partyLobbyFacade,
          partyGuestSessionPort,
          partyIdentifier,
          partyHostControlPort,
          partyManagementPort,
          partyObservationPort,
          partyPinIdentifier,
          partyPlayerPort,
          stageIdentifier,
        },
      );
    const rendered = renderHook(() => useParty(), { wrapper });
    const observedPartyId = parsePartyId(44);

    act(() => {
      rendered.result.current.observePartyById(observedPartyId);
      observeParty.handlers?.onRuntimeNotice?.({
        kind: PartyRuntimeNoticeKind.RewindStage,
        partyId: observedPartyId,
      });
    });

    const runtimeNotice = rendered.result.current.getRuntimeNoticeByPartyId(observedPartyId);

    expect(runtimeNotice).toEqual({
      kind: PartyRuntimeNoticeKind.RewindStage,
      partyId: observedPartyId,
    });

    act(() => {
      if (runtimeNotice !== null) {
        rendered.result.current.consumeRuntimeNotice(runtimeNotice);
      }
    });

    expect(rendered.result.current.getRuntimeNoticeByPartyId(observedPartyId)).toBeNull();
  });
});
