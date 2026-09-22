export type PasswordResetRequest = {
  email: string;
  locale: string;
  requestedAt: Date;
};

export const PasswordRecoveryPortProvider = Symbol('PasswordRecoveryPort');

export interface PasswordRecoveryPort {
  enqueue(email: string, locale: string): Promise<void>;
  claim(): Promise<PasswordResetRequest | null>;
  complete(request: PasswordResetRequest): Promise<void>;
  issueToken(email: string, tokenHash: string, expiresAt: Date): Promise<boolean>;
  consumeToken(tokenHash: string, passwordHash: string): Promise<boolean>;
  deleteExpiredRequests(): Promise<void>;
}
