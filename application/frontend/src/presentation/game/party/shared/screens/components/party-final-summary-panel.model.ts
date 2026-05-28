import type { PartyObservationPlayer } from '../../../../../../domains/game/party/shared/entities/party-observation-player';
import { PartyPlayerIdentityKind } from '../../../../../../domains/game/party/shared/entities/party-player-identity';

export type PodiumRank = 1 | 2 | 3;

export const PODIUM_LAYOUT_ORDER = [2, 1, 3] as const satisfies readonly PodiumRank[];
export const MOBILE_PODIUM_LAYOUT_ORDER = [1, 2, 3] as const satisfies readonly PodiumRank[];

interface PartyFinalSummaryModel {
  readonly currentPlayer: PartyObservationPlayer | null;
  readonly currentPlayerRank: number | null;
  readonly podiumByRank: ReadonlyMap<PodiumRank, PartyObservationPlayer>;
  readonly rankedPlayers: readonly PartyObservationPlayer[];
  readonly winner: PartyObservationPlayer | null;
}

export function createPartyFinalSummaryModel(
  players: readonly PartyObservationPlayer[],
): PartyFinalSummaryModel {
  const rankedPlayers = sortPlayers(players);
  const podiumByRank = new Map<PodiumRank, PartyObservationPlayer>();
  const currentPlayerIndex = rankedPlayers.findIndex((player) => player.isCurrentPlayer);

  rankedPlayers.slice(0, 3).forEach((player, index) => {
    podiumByRank.set((index + 1) as PodiumRank, player);
  });

  return {
    currentPlayer: currentPlayerIndex === -1 ? null : rankedPlayers[currentPlayerIndex],
    currentPlayerRank: currentPlayerIndex === -1 ? null : currentPlayerIndex + 1,
    podiumByRank,
    rankedPlayers,
    winner: podiumByRank.get(1) ?? null,
  };
}

export function toPartyFinalSummaryPlayerKey(player: PartyObservationPlayer): string {
  return player.identity.kind === PartyPlayerIdentityKind.User
    ? `user:${player.identity.userId}`
    : `guest:${player.identity.guestId}`;
}

function sortPlayers(
  players: readonly PartyObservationPlayer[],
): readonly PartyObservationPlayer[] {
  return [...players].sort((left, right) => {
    if (right.totalScore !== left.totalScore) {
      return right.totalScore - left.totalScore;
    }

    return left.username.localeCompare(right.username);
  });
}
