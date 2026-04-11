import {
  createContext,
  type PropsWithChildren,
  startTransition,
  useContext,
  useRef,
  useState,
} from 'react';
import type { PartyId } from '../../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import type {
  PartyObservationPort,
  PartyRuntimeNotice,
} from '../../../../../domains/game/party/shared/ports/party-observation.port';
import { PresentationContextErrorCode } from '../../../../../domains/shared/errors/presentation-context-error-code';
import { usePartyDependencies } from './party-dependencies-context';

interface PartyObservationStateValue {
  readonly currentErrorMessage: string | null;
  readonly currentErrorPartyId: PartyId | null;
  readonly currentParty: PartyObservation | null;
  readonly currentRuntimeNotice: PartyRuntimeNotice | null;
}

interface PartyObservationActionsValue {
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
  const [currentErrorMessage, setCurrentErrorMessage] = useState<string | null>(null);
  const [currentErrorPartyId, setCurrentErrorPartyId] = useState<PartyId | null>(null);
  const [currentRuntimeNotice, setCurrentRuntimeNotice] = useState<PartyRuntimeNotice | null>(null);
  const registrationsRef = useRef(new Map<PartyId, PartyRegistration>());
  const currentPartyRef = useRef<PartyObservation | null>(null);
  const currentErrorMessageRef = useRef<string | null>(null);
  const currentErrorPartyIdRef = useRef<PartyId | null>(null);
  const currentRuntimeNoticeRef = useRef<PartyRuntimeNotice | null>(null);

  currentPartyRef.current = currentParty;
  currentErrorMessageRef.current = currentErrorMessage;
  currentErrorPartyIdRef.current = currentErrorPartyId;
  currentRuntimeNoticeRef.current = currentRuntimeNotice;

  const actionsRef = useRef<PartyObservationActionsValue>({
    getErrorByPartyId: (partyId?: PartyId | null) => {
      if (partyId === null || partyId === undefined) {
        return null;
      }

      return currentErrorPartyIdRef.current === partyId ? currentErrorMessageRef.current : null;
    },
    getPartyByPartyId: (partyId?: PartyId | null) => {
      return partyId !== null &&
        partyId !== undefined &&
        currentPartyRef.current?.partyId === partyId
        ? currentPartyRef.current
        : null;
    },
    getRuntimeNoticeByPartyId: (partyId?: PartyId | null) => {
      return partyId !== null &&
        partyId !== undefined &&
        currentRuntimeNoticeRef.current?.partyId === partyId
        ? currentRuntimeNoticeRef.current
        : null;
    },
    observePartyById: (partyId: PartyId) => {
      return registerObservation(partyId);
    },
  });

  function registerObservation(partyId: PartyId): () => void {
    const existing = registrationsRef.current.get(partyId);

    if (existing) {
      existing.count += 1;

      return () => releaseObservation(registrationsRef.current, partyId, clearCurrentObservation);
    }

    const release = port.observeParty(partyId, {
      onSnapshot: (party) => {
        startTransition(() => {
          setCurrentParty(party);
          setCurrentErrorMessage(null);
          setCurrentErrorPartyId(null);
        });
      },
      onError: (message) => {
        startTransition(() => {
          setCurrentErrorMessage(message);
          setCurrentErrorPartyId(partyId);
        });
      },
      onRuntimeNotice: (runtimeNotice) => {
        startTransition(() => {
          setCurrentRuntimeNotice(runtimeNotice);
        });
      },
    });

    registrationsRef.current.set(partyId, {
      count: 1,
      release,
    });

    return () => releaseObservation(registrationsRef.current, partyId, clearCurrentObservation);
  }

  function clearCurrentObservation(): void {
    startTransition(() => {
      setCurrentParty(null);
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

  return <PartyContext.Provider value={value}>{children}</PartyContext.Provider>;
}

export function useParty(): PartyContextValue {
  const context = useContext(PartyContext);

  if (!context) {
    throw new Error(PresentationContextErrorCode.PARTY_PROVIDER_REQUIRED);
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
