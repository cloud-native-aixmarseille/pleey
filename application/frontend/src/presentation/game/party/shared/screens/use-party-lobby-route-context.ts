import { useEffect, useState } from 'react';
import type { PartyLobbyGateway } from '../../../../../application/game/party/shared/facades/party-lobby.facade';
import type {
  Party,
  PartyId,
  PartyPin,
} from '../../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';
import { PartyManagementErrorCode } from '../../../../../domains/game/party/shared/errors/party-management-error-code';
import type { PartyRuntimeNotice } from '../../../../../domains/game/party/shared/ports/party-observation.port';
import {
  type PartyLobbyRouteKind,
  resolvePartyLobbyRouteState,
} from './party-lobby-screen-view-model';

interface UsePartyLobbyRouteContextParams {
  readonly getErrorByPartyId: (partyId?: PartyId | null) => string | null;
  readonly getPartyByPartyId: (partyId?: PartyId | null) => PartyObservation | null;
  readonly getRuntimeNoticeByPartyId: (partyId?: PartyId | null) => PartyRuntimeNotice | null;
  readonly isAuthenticated: boolean;
  readonly normalizedPartyId: PartyId | null;
  readonly normalizedPin: PartyPin | null;
  readonly observePartyById: (partyId: PartyId) => () => void;
  readonly partyLobbyFacade: PartyLobbyGateway;
  readonly resolvePartyLobbyRoute: (partyId: PartyId) => string;
  readonly routeKind: PartyLobbyRouteKind;
  readonly joinedPartyId: PartyId | null;
}

interface UsePartyLobbyRouteContextResult {
  readonly bootstrapCurrentParty: Party | null;
  readonly bootstrapErrorMessage: string | null;
  readonly bootstrapPartyByPin: Party | null;
  readonly bootstrapPinByPartyId: PartyPin | null;
  readonly party: PartyObservation | undefined;
  readonly partyIdErrorMessage: string | null;
  readonly routeState: {
    readonly bootstrapRedirectTo: string | null;
    readonly resolvedPartyId: PartyId | null;
  };
  readonly runtimeNotice: PartyRuntimeNotice | null;
}

export function usePartyLobbyRouteContext({
  getErrorByPartyId,
  getPartyByPartyId,
  getRuntimeNoticeByPartyId,
  isAuthenticated,
  joinedPartyId,
  normalizedPartyId,
  normalizedPin,
  observePartyById,
  partyLobbyFacade,
  resolvePartyLobbyRoute,
  routeKind,
}: UsePartyLobbyRouteContextParams): UsePartyLobbyRouteContextResult {
  const bootstrapPinByPartyId = useBootstrapPinByPartyId({
    enabled: routeKind === 'partyId',
    normalizedPartyId,
    partyLobbyFacade,
  });
  const { bootstrapCurrentParty, bootstrapErrorMessage, bootstrapPartyByPin } =
    useBootstrapPartyByPin({
      enabled: routeKind === 'pin' && isAuthenticated,
      normalizedPin,
      partyLobbyFacade,
    });
  const routeState = resolvePartyLobbyRouteState({
    bootstrapCurrentParty,
    bootstrapPartyByPin,
    joinedPartyId,
    normalizedPartyId,
    resolveHostedPartyRoute: resolvePartyLobbyRoute,
    routeKind,
  });

  useEffect(() => {
    if (routeState.resolvedPartyId !== null) {
      return observePartyById(routeState.resolvedPartyId);
    }

    return;
  }, [observePartyById, routeState.resolvedPartyId]);

  const party = getPartyByPartyId(routeState.resolvedPartyId) ?? undefined;
  const runtimeNotice = getRuntimeNoticeByPartyId(routeState.resolvedPartyId) ?? null;
  const partyIdErrorMessage =
    routeState.resolvedPartyId !== null ? getErrorByPartyId(routeState.resolvedPartyId) : null;

  return {
    bootstrapCurrentParty,
    bootstrapErrorMessage,
    bootstrapPartyByPin,
    bootstrapPinByPartyId,
    party,
    partyIdErrorMessage,
    routeState,
    runtimeNotice,
  };
}

function useBootstrapPinByPartyId({
  enabled,
  normalizedPartyId,
  partyLobbyFacade,
}: {
  readonly enabled: boolean;
  readonly normalizedPartyId: PartyId | null;
  readonly partyLobbyFacade: PartyLobbyGateway;
}): PartyPin | null {
  const [bootstrapPin, setBootstrapPin] = useState<PartyPin | null>(null);

  useEffect(() => {
    if (!enabled || normalizedPartyId === null) {
      setBootstrapPin(null);
      return;
    }

    let isCancelled = false;

    void partyLobbyFacade
      .listParties()
      .then((parties) => {
        if (isCancelled) {
          return;
        }

        const matchingParty = parties.find((party) => party.partyId === normalizedPartyId) ?? null;
        setBootstrapPin(matchingParty?.pin ?? null);
      })
      .catch(() => {
        if (!isCancelled) {
          setBootstrapPin(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [enabled, normalizedPartyId, partyLobbyFacade]);

  return bootstrapPin;
}

function useBootstrapPartyByPin({
  enabled,
  normalizedPin,
  partyLobbyFacade,
}: {
  readonly enabled: boolean;
  readonly normalizedPin: PartyPin | null;
  readonly partyLobbyFacade: PartyLobbyGateway;
}): {
  readonly bootstrapCurrentParty: Party | null;
  readonly bootstrapErrorMessage: string | null;
  readonly bootstrapPartyByPin: Party | null;
} {
  const [bootstrapCurrentParty, setBootstrapCurrentParty] = useState<Party | null>(null);
  const [bootstrapPartyByPin, setBootstrapPartyByPin] = useState<Party | null>(null);
  const [bootstrapErrorMessage, setBootstrapErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !normalizedPin) {
      setBootstrapCurrentParty(null);
      setBootstrapPartyByPin(null);
      setBootstrapErrorMessage(null);
      return;
    }

    setBootstrapCurrentParty(null);
    setBootstrapPartyByPin(null);
    setBootstrapErrorMessage(null);

    let isCancelled = false;

    void partyLobbyFacade
      .listParties()
      .then((parties) => {
        if (isCancelled) {
          return;
        }

        const currentParty = parties.find((party) => party.status !== PartyStatus.ENDED) ?? null;
        const matchingParty = parties.find((party) => party.pin === normalizedPin) ?? null;

        setBootstrapCurrentParty(currentParty);
        setBootstrapPartyByPin(matchingParty);
        setBootstrapErrorMessage(
          matchingParty === null && currentParty === null
            ? PartyManagementErrorCode.PARTY_NOT_FOUND
            : null,
        );
      })
      .catch(() => {
        if (!isCancelled) {
          setBootstrapCurrentParty(null);
          setBootstrapPartyByPin(null);
          setBootstrapErrorMessage(PartyManagementErrorCode.LIST_FAILED);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [enabled, normalizedPin, partyLobbyFacade]);

  return { bootstrapCurrentParty, bootstrapErrorMessage, bootstrapPartyByPin };
}
