export interface SessionClientMetadata {
  readonly userAgent: string | null;
  readonly ipAddress: string | null;
}

export interface UserSessionDetails extends SessionClientMetadata {
  readonly id: string;
  readonly createdAt: Date | null;
  readonly lastActiveAt: Date | null;
  readonly expiresAt: Date;
}
