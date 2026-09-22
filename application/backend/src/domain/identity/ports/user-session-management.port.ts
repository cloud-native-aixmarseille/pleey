import type { PaginatedResult } from '../../shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../shared/value-objects/pagination-query';
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
