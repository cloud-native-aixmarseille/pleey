export enum GameJoinErrorCode {
  ACTIVE_SESSION_EXISTS = 'ACTIVE_SESSION_EXISTS',
  PIN_REQUIRED = 'PIN_REQUIRED',
  PIN_INVALID = 'PIN_INVALID',
  DISPLAY_NAME_REQUIRED = 'DISPLAY_NAME_REQUIRED',
  UNKNOWN = 'UNKNOWN',
}

export function isGameJoinErrorCode(value: string): value is GameJoinErrorCode {
  return Object.values(GameJoinErrorCode).includes(value as GameJoinErrorCode);
}
