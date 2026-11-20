import type { PaginatedResult } from '@pleey/contracts/shared/primitives';

export interface UserSessionDetails {
  readonly id: string;
  readonly createdAt: string | null;
  readonly lastActiveAt: string | null;
  readonly expiresAt: string;
  readonly userAgent: string | null;
  readonly ipAddress: string | null;
}

export interface UserSessionOverview {
  readonly currentSession: UserSessionDetails;
  readonly otherSessions: PaginatedResult<UserSessionDetails>;
}
