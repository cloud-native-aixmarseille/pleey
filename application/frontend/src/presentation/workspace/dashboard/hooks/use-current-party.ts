import { useEffect, useEffectEvent, useState } from 'react';
import type { Party } from '../../../../domains/game/party/shared/entities/party';
import { PartyStatus } from '../../../../domains/game/party/shared/entities/party-status';

const CURRENT_PARTY_STATUS_PRIORITY = [
  PartyStatus.ACTIVE,
  PartyStatus.PAUSED,
  PartyStatus.WAITING,
] as const;

function resolveCurrentParty(parties: readonly Party[]): Party | null {
  for (const status of CURRENT_PARTY_STATUS_PRIORITY) {
    const party = parties.find((candidate) => candidate.status === status);

    if (party) {
      return party;
    }
  }

  return null;
}

interface UseCurrentPartyOptions {
  readonly loadParties: () => Promise<readonly Party[]>;
}

interface UseCurrentPartyResult {
  readonly currentParty: Party | null;
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly upsertParty: (party: Party) => void;
}

export function useCurrentParty({ loadParties }: UseCurrentPartyOptions): UseCurrentPartyResult {
  const [currentParty, setCurrentParty] = useState<Party | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const loadPartiesEffect = useEffectEvent(loadParties);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setErrorMessage(null);
      setIsLoading(true);

      try {
        const loaded = await loadPartiesEffect();

        if (!ignore) {
          setCurrentParty(resolveCurrentParty(loaded));
        }
      } catch (error) {
        if (!ignore) {
          setCurrentParty(null);
          setErrorMessage(error instanceof Error ? error.message : 'dashboard.errors.loadFailed');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  const upsertParty = (party: Party) => {
    setCurrentParty(party);
  };

  return { currentParty, isLoading, errorMessage, upsertParty };
}
