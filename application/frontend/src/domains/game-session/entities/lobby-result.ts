import type { GameSessionPlayer } from './game-session-player';

export interface LobbyPinCharacter {
  readonly value: string;
  readonly isPlaceholder: boolean;
}

export interface HighlightedPlayersResult {
  readonly currentPlayer: GameSessionPlayer | null;
  readonly otherPlayers: readonly GameSessionPlayer[];
}
