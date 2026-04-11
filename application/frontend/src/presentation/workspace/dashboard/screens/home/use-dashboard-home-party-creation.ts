import { useState } from 'react';
import type { GameId } from '../../../../../domains/game/entities/game';
import type { DashboardGameListItem } from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { Party } from '../../../../../domains/game/party/shared/entities/party';
import { PartyManagementErrorCode } from '../../../../../domains/game/party/shared/errors/party-management-error-code';
import { usePresentationNavigate } from '../../../../shared/routing/router';

interface UseDashboardHomePartyCreationOptions {
  readonly createParty: (gameId: GameId) => Promise<Party>;
  readonly onPartyCreated: (party: Party) => void;
  readonly resolvePartyRoute: (party: Party) => string;
  readonly reloadGames: () => void;
}

interface UseDashboardHomePartyCreationResult {
  readonly creatingPartyGameId: GameId | null;
  readonly partyActionErrorMessage: string | null;
  readonly handleCreateParty: (game: DashboardGameListItem) => Promise<void>;
}

export function useDashboardHomePartyCreation({
  createParty,
  onPartyCreated,
  resolvePartyRoute,
  reloadGames,
}: UseDashboardHomePartyCreationOptions): UseDashboardHomePartyCreationResult {
  const navigate = usePresentationNavigate();
  const [creatingPartyGameId, setCreatingPartyGameId] = useState<GameId | null>(null);
  const [partyActionErrorMessage, setPartyActionErrorMessage] = useState<string | null>(null);

  const handleCreateParty = async (game: DashboardGameListItem) => {
    setCreatingPartyGameId(game.gameId);
    setPartyActionErrorMessage(null);

    try {
      const party = await createParty(game.gameId);
      onPartyCreated(party);
      reloadGames();
      navigate(resolvePartyRoute(party));
    } catch (error) {
      setPartyActionErrorMessage(resolvePartyActionError(error));
    } finally {
      setCreatingPartyGameId((current) => (current === game.gameId ? null : current));
    }
  };

  return {
    creatingPartyGameId,
    partyActionErrorMessage,
    handleCreateParty,
  };
}

function resolvePartyActionError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return PartyManagementErrorCode.CREATE_FAILED;
}
