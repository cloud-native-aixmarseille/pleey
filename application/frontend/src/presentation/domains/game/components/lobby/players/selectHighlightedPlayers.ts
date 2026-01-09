import type { Player } from "../../../../../../domains/game/types";

interface HighlightedPlayersResult {
  readonly currentPlayer: Player | null;
  readonly otherPlayers: readonly Player[];
}

function normalizeIdentifier(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized ? normalized : null;
}

function buildHighlightIdentifiers(
  highlightPlayerId?: number | string | null,
  highlightPlayerUsername?: string | null
): Set<string> | null {
  const identifiers = new Set<string>();

  const normalizedId = normalizeIdentifier(highlightPlayerId);
  if (normalizedId) {
    identifiers.add(normalizedId);
  }

  const normalizedUsername = normalizeIdentifier(highlightPlayerUsername);
  if (normalizedUsername) {
    identifiers.add(normalizedUsername);
  }

  return identifiers.size > 0 ? identifiers : null;
}

export function selectHighlightedPlayers(
  players: readonly Player[],
  highlightPlayerId?: number | string | null,
  highlightPlayerUsername?: string | null
): HighlightedPlayersResult {
  const highlightIdentifiers = buildHighlightIdentifiers(
    highlightPlayerId,
    highlightPlayerUsername
  );

  if (!highlightIdentifiers || players.length === 0) {
    return { currentPlayer: null, otherPlayers: players };
  }

  const matchPlayer = (player: Player) => {
    const candidateValues: string[] = [];

    const normalizedId = normalizeIdentifier(player.id);
    if (normalizedId) {
      candidateValues.push(normalizedId);
    }

    const normalizedUsername = normalizeIdentifier(player.username);
    if (normalizedUsername) {
      candidateValues.push(normalizedUsername);
    }

    return candidateValues.some((value) => highlightIdentifiers.has(value));
  };

  const found = players.find(matchPlayer) ?? null;
  const remaining = found
    ? players.filter((player) => !matchPlayer(player))
    : players;

  return { currentPlayer: found, otherPlayers: remaining };
}
