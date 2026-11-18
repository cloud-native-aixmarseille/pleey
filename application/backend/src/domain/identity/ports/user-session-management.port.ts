import type { PaginatedResult } from '@pleey/domain/shared/primitives';
import type { PaginationQuery } from '@pleey/domain/shared/primitives';
import type { UserId } from '../entities/user';
import type { UserSessionDetails } from '../types/user-session';

export const UserSessionManagementPortProvider = Symbol('UserSessionManagementPort');

export interface UserSessionManagementPort {
  current(userId: UserId, sessionId: string): Promise<UserSessionDetails | null>;
  listOthers(
    userId: UserId,
    currentSessionId: string,
    query: PaginationQuery,
  ): Promise<PaginatedResult<UserSessionDetails>>;
  revokeOthers(userId: UserId, currentSessionId: string): Promise<void>;
}
