export enum GameLobbyErrorCode {
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  GAME_SESSION_ENDED = 'GAME_SESSION_ENDED',
  UNKNOWN = 'UNKNOWN',
}

export function isGameLobbyErrorCode(value: string): value is GameLobbyErrorCode {
  return Object.values(GameLobbyErrorCode).includes(value as GameLobbyErrorCode);
}
