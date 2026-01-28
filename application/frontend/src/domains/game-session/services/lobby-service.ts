import { injectable } from 'inversify';
import type { GameSessionPlayer } from '../entities/game-session-player';
import type { HighlightedPlayersResult, LobbyPinCharacter } from '../entities/lobby-result';
import { GameLobbyErrorCode } from '../errors/game-lobby-error-code';

export type { HighlightedPlayersResult, LobbyPinCharacter } from '../entities/lobby-result';

@injectable()
export class LobbyService {
  buildPinCharacters(gamePin: string, minSlots = 6): LobbyPinCharacter[] {
    const slots = Math.max(gamePin.length, minSlots);

    return Array.from({ length: slots }, (_, index) => ({
      value: gamePin[index] ?? '•',
      isPlaceholder: index >= gamePin.length,
    }));
  }

  selectHighlightedPlayers(
    players: readonly GameSessionPlayer[],
    highlightPlayerId?: number | string | null,
    highlightGuestId?: string | null,
    highlightPlayerUsername?: string | null,
  ): HighlightedPlayersResult {
    const highlightIdentifiers = this.buildIdentifierSet(
      highlightPlayerId,
      highlightGuestId,
      highlightPlayerUsername,
    );

    if (!highlightIdentifiers || players.length === 0) {
      return { currentPlayer: null, otherPlayers: players };
    }

    const matchPlayer = (player: GameSessionPlayer) => {
      const candidateValues: string[] = [];

      const normalizedId = this.normalizeIdentifier(player.id);
      if (normalizedId) {
        candidateValues.push(normalizedId);
      }

      const normalizedGuestId = this.normalizeIdentifier(player.guestId);
      if (normalizedGuestId) {
        candidateValues.push(normalizedGuestId);
      }

      const normalizedUsername = this.normalizeIdentifier(player.username);
      if (normalizedUsername) {
        candidateValues.push(normalizedUsername);
      }

      return candidateValues.some((value) => highlightIdentifiers.has(value));
    };

    const currentPlayer = players.find(matchPlayer) ?? null;
    const otherPlayers = currentPlayer ? players.filter((player) => !matchPlayer(player)) : players;

    return {
      currentPlayer,
      otherPlayers,
    };
  }

  shouldLeaveLobby(errorCode: GameLobbyErrorCode | null): boolean {
    return (
      errorCode === GameLobbyErrorCode.GAME_NOT_FOUND ||
      errorCode === GameLobbyErrorCode.GAME_SESSION_ENDED
    );
  }

  shouldShowUnknownLobbyError(errorCode: GameLobbyErrorCode | null): boolean {
    return errorCode === GameLobbyErrorCode.UNKNOWN;
  }

  private normalizeIdentifier(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = String(value).trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }

  private buildIdentifierSet(
    id?: number | string | null,
    guestId?: string | null,
    username?: string | null,
  ): Set<string> | null {
    const identifiers = new Set<string>();

    const normalizedId = this.normalizeIdentifier(id);
    if (normalizedId) {
      identifiers.add(normalizedId);
    }

    const normalizedGuestId = this.normalizeIdentifier(guestId);
    if (normalizedGuestId) {
      identifiers.add(normalizedGuestId);
    }

    const normalizedUsername = this.normalizeIdentifier(username);
    if (normalizedUsername) {
      identifiers.add(normalizedUsername);
    }

    return identifiers.size > 0 ? identifiers : null;
  }
}
