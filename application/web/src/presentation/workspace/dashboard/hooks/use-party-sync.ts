import { useEffect, useEffectEvent } from 'react';
import type { Party } from '../../../../domains/game/party/shared/entities/party';
import type { PartyObservation } from '../../../../domains/game/party/shared/entities/party-observation';
import { useParty } from '../../../game/party/shared/contexts/party-context';

interface UsePartySyncOptions {
  readonly currentParty: Party | null;
  readonly upsertParty: (party: Party) => void;
}

export function usePartySync({ currentParty, upsertParty }: UsePartySyncOptions) {
  const { getPartyByPartyId, observePartyById } = useParty();
  const upsertPartyEffect = useEffectEvent(upsertParty);

  useEffect(() => {
    if (!currentParty) {
      return;
    }

    const release = observePartyById(currentParty.partyId);

    return () => {
      release();
    };
  }, [currentParty, observePartyById]);

  useEffect(() => {
    if (!currentParty) {
      return;
    }

    const observation = getPartyByPartyId(currentParty.partyId);

    if (!observation) {
      return;
    }

    const projectedParty = projectPartySummary(observation, currentParty);

    if (!isSameParty(projectedParty, currentParty)) {
      upsertPartyEffect(projectedParty);
    }
  }, [currentParty, getPartyByPartyId]);
}

function projectPartySummary(observation: PartyObservation, currentParty: Party): Party {
  return {
    partyId: observation.partyId,
    gameId: currentParty.gameId,
    pin: observation.pin,
    status: observation.status,
    role: currentParty.role,
    createdAt: currentParty.createdAt,
  };
}

function isSameParty(left: Party, right: Party): boolean {
  return (
    left.partyId === right.partyId &&
    left.gameId === right.gameId &&
    left.pin === right.pin &&
    left.status === right.status &&
    left.role === right.role &&
    left.createdAt === right.createdAt
  );
}
