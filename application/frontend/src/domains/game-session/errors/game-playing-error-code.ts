export enum GamePlayingErrorCode {
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  GAME_SESSION_ENDED = 'GAME_SESSION_ENDED',
  UNKNOWN = 'UNKNOWN',
}

export function isGamePlayingErrorCode(value: string): value is GamePlayingErrorCode {
  return Object.values(GamePlayingErrorCode).includes(value as GamePlayingErrorCode);
}
