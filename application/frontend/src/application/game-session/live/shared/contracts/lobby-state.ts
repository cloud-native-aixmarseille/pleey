import type { GameSessionPlayer } from '../../../../../domains/game-session/entities/game-session-player';
import type {
  HighlightedPlayersResult,
  LobbyPinCharacter,
} from '../../../../../domains/game-session/entities/lobby-result';
import type { GameLobbyErrorCode } from '../../../../../domains/game-session/errors/game-lobby-error-code';

export enum GameLobbyStatus {
  LOADING = 'loading',
  READY = 'ready',
  REDIRECT = 'redirect',
}

export enum GameLobbyRedirectTarget {
  JOIN = 'join',
  PLAYING = 'playing',
}

export interface GetGameLobbyStateCommand {
  readonly activePin: string;
  readonly errorCode: GameLobbyErrorCode | null;
  readonly guestNickname: string;
  readonly hasGameStarted: boolean;
  readonly hasReceivedRoster: boolean;
  readonly hasIdentity: boolean;
  readonly hasRestoredSession: boolean;
  readonly isAuthenticated: boolean;
  readonly authenticatedAvatarUri: string | null;
  readonly lastJoinRequest:
    | {
        readonly pin: string;
        readonly username: string;
      }
    | {
        readonly avatarUri?: string | null;
        readonly guestId: string;
        readonly pin: string;
        readonly username: string;
      }
    | null;
  readonly players: readonly GameSessionPlayer[];
  readonly userId: number | null;
  readonly username: string | null;
}

export interface GameLobbyState {
  readonly highlightedPlayers: HighlightedPlayersResult;
  readonly pinCharacters: readonly LobbyPinCharacter[];
  readonly playerCount: number;
  readonly status: GameLobbyStatus;
  readonly redirectTarget: GameLobbyRedirectTarget | null;
  readonly unknownErrorMessageKey: string | null;
}
