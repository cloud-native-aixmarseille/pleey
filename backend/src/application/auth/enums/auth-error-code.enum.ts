/**
 * Authentication Error Codes
 * Used to identify specific authentication errors
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  PASSWORD_TOO_SHORT = 'PASSWORD_TOO_SHORT',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
}
