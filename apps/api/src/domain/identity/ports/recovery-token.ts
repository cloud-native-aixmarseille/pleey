export const RecoveryTokenProvider = Symbol('RecoveryToken');

export interface RecoveryToken {
  generate(): string;
  digest(token: string): string;
}
