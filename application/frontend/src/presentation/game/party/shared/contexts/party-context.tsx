import { createContext, type PropsWithChildren, startTransition, useContext, useEffect, useRef, useState } from 'react';
import { unavailableHostPermissions } from '../../../../../domains/game/party/host/value-objects/host-party-permissions';
import type { PartyId } from '../../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import type {
  PartyObservationConnectionState,
  PartyObservationPort,
  PartyRuntimeNotice,
} from '../../../../../domains/game/party/shared/ports/party-observation.port';
import { PartyProviderRequiredError } from '../../../../../domains/shared/errors/presentation-context-error-code';
import { usePartyDependencies } from './party-dependencies-context';
import { type PartyStageScoreboardSnapshot, updatePartyStageScoreboard } from './party-stage-scoreboard.model';
import { PartyStageScoreboardContext } from './party-stage-scoreboard-context';

interface PartyObservationStateValue {
  readonly currentErrorMessage: string | null;
  readonly currentErrorPartyId: PartyId | null;
  readonly currentParty: PartyObservation | null;
  readonly currentRuntimeNotice: PartyRuntimeNotice | null;
}

interface PartyObservationActionsValue {
  consumeRuntimeNotice(runtimeNotice: PartyRuntimeNotice): void;
  getConnectionStateByPartyId(partyId?: PartyId | null): PartyObservationConnectionState | null;
  getErrorByPartyId(partyId?: PartyId | null): string | null;
  getPartyByPartyId(partyId?: PartyId | null): PartyObservation | null;
  getRuntimeNoticeByPartyId(partyId?: PartyId | null): PartyRuntimeNotice | null;
  observePartyById(partyId: PartyId): () => void;
}

interface PartyContextValue extends PartyObservationStateValue, PartyObservationActionsValue {}

const PartyContext = createContext<PartyContextValue | null>(null);

interface PartyProviderProps extends PropsWithChildren {
  readonly port: PartyObservationPort;
}

interface PartyRegistration {
  count: number;
  release: () => void;
}

export function PartyProvider({ children, port }: PartyProviderProps) {
  usePartyDependencies();
  const [currentParty, setCurrentParty] = useState<PartyObservation | null>(null);
  const [stageScoreboard, setStageScoreboard] = useState<PartyStageScoreboardSnapshot | null>(null);
  const [currentErrorMessage, setCurrentErrorMessage] = useState<string | null>(null);
  const [currentErrorPartyId, setCurrentErrorPartyId] = useState<PartyId | null>(null);
  const [currentRuntimeNotice, setCurrentRuntimeNotice] = useState<PartyRuntimeNotice | null>(null);
  const [, setConnectionStateVersion] = useState(0);
  const registrationsRef = useRef(new Map<PartyId, PartyRegistration>());
  const connectionStatesRef = useRef(new Map<PartyId, PartyObservationConnectionState>());
  const currentPartyRef = useRef<PartyObservation | null>(null);
  const currentErrorMessageRef = useRef<string | null>(null);
  const currentErrorPartyIdRef = useRef<PartyId | null>(null);
  const currentRuntimeNoticeRef = useRef<PartyRuntimeNotice | null>(null);

  currentPartyRef.current = currentParty;
  currentErrorMessageRef.current = currentErrorMessage;
  currentErrorPartyIdRef.current = currentErrorPartyId;
  currentRuntimeNoticeRef.current = currentRuntimeNotice;

  const actionsRef = useRef<PartyObservationActionsValue>({
    consumeRuntimeNotice: (runtimeNotice) => {
      startTransition(() => {
        setCurrentRuntimeNotice((currentRuntimeNotice) =>
          currentRuntimeNotice === runtimeNotice ? null : currentRuntimeNotice,
        );
      });
    },
    getConnectionStateByPartyId: (partyId?: PartyId | null) => {
      if (partyId === null || partyId === undefined) {
        return null;
      }

      return connectionStatesRef.current.get(partyId) ?? null;
    },
    getErrorByPartyId: (partyId?: PartyId | null) => {
      if (partyId === null || partyId === undefined) {
        return null;
      }

      return currentErrorPartyIdRef.current === partyId ? currentErrorMessageRef.current : null;
    },
    getPartyByPartyId: (partyId?: PartyId | null) => {
      return partyId !== null && partyId !== undefined && currentPartyRef.current?.partyId === partyId
        ? currentPartyRef.current
        : null;
    },
    getRuntimeNoticeByPartyId: (partyId?: PartyId | null) => {
      return partyId !== null && partyId !== undefined && currentRuntimeNoticeRef.current?.partyId === partyId
        ? currentRuntimeNoticeRef.current
        : null;
    },
    observePartyById: (partyId: PartyId) => {
      return registerObservation(partyId);
    },
  });

  useEffect(
    () => () => {
      for (const registration of registrationsRef.current.values()) registration.release();
      registrationsRef.current.clear();
    },
    [],
  );

  function registerObservation(partyId: PartyId): () => void {
    const existing = registrationsRef.current.get(partyId);

    if (existing) {
      existing.count += 1;

      return () => releaseObservation(registrationsRef.current, partyId, clearCurrentObservation);
    }

    let active = true;
    const invalidate = () =>
      active &&
      setCurrentParty((current) =>
        current?.partyId === partyId
          ? {
              ...current,
              permissions: unavailableHostPermissions(),
              players: current.players.map((player) => ({ ...player, isCurrentPlayer: false })),
            }
          : current,
      );
    const release = port.observeParty(partyId, {
      onDisconnected: invalidate,
      onConnected: (connectionState) => {
        if (!active) return;
        setCurrentParty((current) =>
          current?.partyId === partyId
            ? {
                ...current,
                permissions: unavailableHostPermissions(),
                players: current.players.map((player) => ({ ...player, isCurrentPlayer: false })),
              }
            : current,
        );
        connectionStatesRef.current.set(partyId, connectionState);
        startTransition(() => {
          setConnectionStateVersion((currentVersion) => currentVersion + 1);
        });
      },
      onSnapshot: (party) => {
        if (!active || party.partyId !== partyId) return;
        startTransition(() => {
          setStageScoreboard((previous) => updatePartyStageScoreboard(previous, party));
          setCurrentParty(party);
          setCurrentErrorMessage(null);
          setCurrentErrorPartyId(null);
        });
      },
      onError: (message) => {
        if (!active) return;
        startTransition(() => {
          setCurrentParty((current) =>
            current?.partyId === partyId
              ? {
                  ...current,
                  permissions: unavailableHostPermissions(),
                  players: current.players.map((player) => ({ ...player, isCurrentPlayer: false })),
                }
              : current,
          );
          setCurrentErrorMessage(message);
          setCurrentErrorPartyId(partyId);
        });
      },
      onRuntimeNotice: (runtimeNotice) => {
        if (!active || runtimeNotice.partyId !== partyId) return;
        startTransition(() => {
          setCurrentRuntimeNotice(runtimeNotice);
        });
      },
    });

    registrationsRef.current.set(partyId, {
      count: 1,
      release: () => {
        active = false;
        release();
      },
    });

    return () => releaseObservation(registrationsRef.current, partyId, clearCurrentObservation);
  }

  function clearCurrentObservation(): void {
    startTransition(() => {
      setCurrentParty(null);
      setStageScoreboard(null);
      setCurrentErrorMessage(null);
      setCurrentErrorPartyId(null);
      setCurrentRuntimeNotice(null);
    });
  }

  const value: PartyContextValue = {
    currentErrorMessage,
    currentErrorPartyId,
    currentParty,
    currentRuntimeNotice,
    ...actionsRef.current,
  };

  return (
    <PartyContext.Provider value={value}>
      <PartyStageScoreboardContext.Provider value={stageScoreboard}>{children}</PartyStageScoreboardContext.Provider>
    </PartyContext.Provider>
  );
}

export function useParty(): PartyContextValue {
  const context = useContext(PartyContext);

  if (!context) {
    throw new PartyProviderRequiredError({
      consumer: 'useParty',
      contextName: 'PartyContext',
    });
  }

  return context;
}

function releaseObservation(
  registrations: Map<PartyId, PartyRegistration>,
  partyId: PartyId,
  clearCurrentObservation: () => void,
): void {
  const registration = registrations.get(partyId);

  if (!registration) {
    return;
  }

  registration.count -= 1;

  if (registration.count > 0) {
    return;
  }

  registration.release();
  registrations.delete(partyId);

  if (registrations.size === 0) {
    clearCurrentObservation();
  }
}
